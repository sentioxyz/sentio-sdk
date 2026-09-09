import { after, before, describe, test } from 'node:test'
import { expect } from 'chai'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { Network } from 'ethers'
import { FREE_SOCKET_IDLE_MS, createRpcHttpAgent, rpcAgents, rpcCallTimeoutMs, rpcFetchRequest } from './rpc-agent.js'
import { QueuedStaticJsonRpcProvider } from './provider.js'

// A tiny JSON-RPC endpoint: answers every request with result "0x1".
function startRpcServer(): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      const payload = JSON.parse(body || '{}')
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ jsonrpc: '2.0', id: payload.id ?? 1, result: '0x1' }))
    })
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

function urlOf(server: http.Server): string {
  const { port } = server.address() as AddressInfo
  return `http://127.0.0.1:${port}`
}

function freeSocketsOf(agent: http.Agent) {
  return Object.values(agent.freeSockets).flatMap((sockets) => sockets ?? [])
}

const nextTurn = () => new Promise((resolve) => setImmediate(resolve))

describe('rpc agent', () => {
  let server: http.Server
  const agents: http.Agent[] = []

  before(async () => {
    server = await startRpcServer()
  })

  after(() => {
    delete process.env['RPC_CALL_TIMEOUT_MS']
    for (const a of agents) a.destroy()
    rpcAgents().http.destroy()
    server.close()
  })

  test('a new socket carries the RPC deadline as its timeout while it is still connecting', async () => {
    process.env['RPC_CALL_TIMEOUT_MS'] = '7000'
    const agent = createRpcHttpAgent()
    agents.push(agent)
    const seen = await new Promise<{ connecting: boolean; timeout: number }>((resolve, reject) => {
      const req = http.request(urlOf(server), { method: 'POST', agent })
      req.on('socket', (socket) => resolve({ connecting: socket.connecting, timeout: socket.timeout ?? -1 }))
      req.on('error', reject)
      req.end('{}')
    })
    // The timeout that applies during DNS + TCP connect is the agent's, not the one the
    // request sets later; it must be our deadline, not Node's 5s global-agent default.
    expect(seen.connecting).eq(true)
    expect(seen.timeout).eq(7000)
    expect(rpcCallTimeoutMs()).eq(7000)
  })

  test('an idle keep-alive socket is kept, with the short idle retention', async () => {
    const agent = createRpcHttpAgent()
    agents.push(agent)
    await new Promise<void>((resolve, reject) => {
      const req = http.request(urlOf(server), { method: 'POST', agent }, (res) => {
        res.resume()
        res.on('end', resolve)
      })
      req.on('error', reject)
      req.end('{}')
    })
    await nextTurn()
    const free = freeSocketsOf(agent)
    expect(free.length).eq(1)
    expect(free[0].timeout).eq(FREE_SOCKET_IDLE_MS)
  })

  test('the default global agent is why this exists: 5s during connect on Node >= 19', () => {
    // Documents the behaviour we are working around; if Node ever changes it this test says so.
    const globalAgent = http.globalAgent as unknown as { options: http.AgentOptions }
    expect(globalAgent.options.timeout).eq(5000)
  })

  test('a FetchRequest from rpcFetchRequest goes through the SDK agent, clones included', async () => {
    const before = freeSocketsOf(rpcAgents().http).length
    const req = rpcFetchRequest(urlOf(server)).clone()
    expect(req.getUrlFunc).eq(rpcAgents().getUrlFunc)
    req.body = { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }
    const resp = await req.send()
    expect(resp.bodyJson.result).eq('0x1')
    await nextTurn()
    expect(freeSocketsOf(rpcAgents().http).length).gt(before)
  })

  test('QueuedStaticJsonRpcProvider accepts the FetchRequest and answers over it', async () => {
    const provider = new QueuedStaticJsonRpcProvider(rpcFetchRequest(urlOf(server)), Network.from(1), 4, 1)
    try {
      const result = await provider.send('eth_blockNumber', [])
      expect(result).eq('0x1')
    } finally {
      provider.destroy()
    }
  })
})
