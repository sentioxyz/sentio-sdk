import { after, before, describe, test } from 'node:test'
import { expect } from 'chai'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { Network } from 'ethers'
import {
  FREE_SOCKET_IDLE_MS,
  createRpcHttpAgent,
  freeSocketIdleMs,
  isHttpsUrl,
  rpcAgents,
  rpcCallTimeoutMs,
  rpcFetchRequest
} from './rpc-agent.js'
import { QueuedStaticJsonRpcProvider } from './provider.js'

// A tiny JSON-RPC endpoint: answers every request with result "0x1". With `keepAliveSecs` it
// also advertises `Keep-Alive: timeout=<secs>`, the way a real server announces its idle limit.
function startRpcServer(keepAliveSecs?: number): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      const payload = JSON.parse(body || '{}')
      res.setHeader('content-type', 'application/json')
      if (keepAliveSecs !== undefined) {
        res.setHeader('keep-alive', `timeout=${keepAliveSecs}`)
      }
      res.end(JSON.stringify({ jsonrpc: '2.0', id: payload.id ?? 1, result: '0x1' }))
    })
  })
  // 0 also stops Node's default `Keep-Alive: timeout=5` header, so the plain server hints nothing.
  server.keepAliveTimeout = keepAliveSecs === undefined ? 0 : keepAliveSecs * 1000
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

// One request over `agent`, fully consumed, so the socket goes back to the free pool.
function requestOnce(url: string, agent: http.Agent): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const req = http.request(url, { method: 'POST', agent }, (res) => {
      res.resume()
      res.on('end', resolve)
    })
    req.on('error', reject)
    req.end('{}')
  })
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
    await requestOnce(urlOf(server), agent)
    await nextTurn()
    const free = freeSocketsOf(agent)
    expect(free.length).eq(1)
    expect(free[0].timeout).eq(FREE_SOCKET_IDLE_MS)
  })

  test('a shorter server Keep-Alive hint wins over the idle retention', async () => {
    // Node keeps the socket for the advertised 2s minus its 1s safety buffer; we must not
    // stretch that back to 5s, or the next reuse races the server closing the idle socket.
    const hinting = await startRpcServer(2)
    const agent = createRpcHttpAgent()
    agents.push(agent)
    try {
      await requestOnce(urlOf(hinting), agent)
      await nextTurn()
      const free = freeSocketsOf(agent)
      expect(free.length).eq(1)
      expect(free[0].timeout).eq(1000)
    } finally {
      hinting.close()
    }
  })

  test('freeSocketIdleMs never lengthens what Node selected', () => {
    expect(freeSocketIdleMs(1000)).eq(1000)
    expect(freeSocketIdleMs(FREE_SOCKET_IDLE_MS)).eq(FREE_SOCKET_IDLE_MS)
    expect(freeSocketIdleMs(120_000)).eq(FREE_SOCKET_IDLE_MS)
    expect(freeSocketIdleMs(0)).eq(FREE_SOCKET_IDLE_MS)
    expect(freeSocketIdleMs(undefined)).eq(FREE_SOCKET_IDLE_MS)
  })

  test('the agent is picked by scheme, case-insensitively, like ethers picks the transport', async () => {
    expect(isHttpsUrl('https://rpc.example')).eq(true)
    expect(isHttpsUrl('HTTPS://rpc.example')).eq(true)
    expect(isHttpsUrl('Https://rpc.example')).eq(true)
    expect(isHttpsUrl('http://rpc.example')).eq(false)
    expect(isHttpsUrl('HTTP://rpc.example')).eq(false)
    // A mixed-case http URL must still go out over the http agent and get answered.
    const req = rpcFetchRequest(urlOf(server).replace('http://', 'HTTP://'))
    req.body = { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }
    const resp = await req.send()
    expect(resp.bodyJson.result).eq('0x1')
  })

  test('the default global agent is why this exists: 5s during connect on Node >= 19', () => {
    // Documents the behaviour we are working around; if Node ever changes it this test says so.
    const globalAgent = http.globalAgent as unknown as { options: http.AgentOptions }
    expect(globalAgent.options.timeout).eq(5000)
  })

  test('a FetchRequest from rpcFetchRequest goes through the SDK agent, clones included', async () => {
    const req = rpcFetchRequest(urlOf(server)).clone()
    expect(req.getUrlFunc).eq(rpcAgents().getUrlFunc)
    req.body = { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }
    const resp = await req.send()
    expect(resp.bodyJson.result).eq('0x1')
    await nextTurn()
    // The only way a socket to this server ends up in the SDK agent's pool is through it.
    const { port } = server.address() as AddressInfo
    expect(freeSocketsOf(rpcAgents().http).some((s) => s.remotePort === port)).eq(true)
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
