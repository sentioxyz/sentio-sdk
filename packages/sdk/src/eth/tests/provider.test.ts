import assert from 'assert'
import { describe, test, mock } from 'node:test'
import { JsonRpcProvider, Network } from 'ethers'
import { getProvider, QueuedStaticJsonRpcProvider } from '../provider.js'
import { Endpoints, GLOBAL_CONFIG } from '@sentio/runtime'
import { EthChainId } from '@sentio/chain'

Endpoints.INSTANCE.concurrency = 1
Endpoints.INSTANCE.batchCount = 1
Endpoints.INSTANCE.chainRpc.set(EthChainId.ETHEREUM, { url: 'http://localhost:12345' })

describe('QueuedStaticJsonRpcProvider', () => {
  test('manual retry should work', async () => {
    let count = 0
    const parentSend = mock.method(JsonRpcProvider.prototype, 'send', async () => {
      if (!count) {
        count++
        throw new Error('Unexpected null response')
      }
      return count
    })

    const provider = getProvider() as any
    const params = ['x', 1n]
    await assert.rejects(provider.send('eth_call', params), { name: 'Error', message: 'Unexpected null response' })
    assert.equal(parentSend.mock.callCount(), 1)

    // send again to verify #performCache was cleared correctly
    await provider.send('eth_call', params)
    assert.equal(parentSend.mock.callCount(), 2)
  })

  test('rpcRetryTimes should work', async () => {
    const total = 4
    let count = 0
    GLOBAL_CONFIG.execution.rpcRetryTimes = total - 1
    const parentSend = mock.method(JsonRpcProvider.prototype, 'send', async () => {
      if (count < total - 1) {
        count++
        const error = new Error() as any
        error.code = 'TIMEOUT'
        throw error
      }
      return count
    })

    const provider = getProvider() as any
    const params = ['y', 2n]
    let result = await provider.send('eth_call', params)
    assert.equal(parentSend.mock.callCount(), total)

    // send again to verify #performCache was set correctly
    result = await provider.send('eth_call', params)
    assert.equal(parentSend.mock.callCount(), total)
  })
})

// A minimal stand-in for ethers' FetchRequest/FetchResponse so we can exercise the
// `_send` override (which replicates retired @sentio/ethers fork behaviors) without
// a live RPC endpoint.
function fakeConnection(bodyJson: any, headers: Record<string, string>) {
  return {
    body: '',
    setHeader() {},
    async send() {
      return {
        assertOk() {},
        headers,
        bodyJson
      }
    }
  } as any
}

describe('QueuedStaticJsonRpcProvider fork-compat behaviors', () => {
  function newProvider() {
    return new QueuedStaticJsonRpcProvider('http://localhost:12345', Network.from(1), 1, 1) as any
  }

  test('empty 0x eth_call result becomes an error carrying sentio headers', async () => {
    const provider = newProvider()
    provider._getConnection = () =>
      fakeConnection(
        { id: 7, jsonrpc: '2.0', result: '0x' },
        { 'x-sentio-error': 'rate limited', 'content-type': 'application/json' }
      )
    const payload = { method: 'eth_call', params: ['0x', 'latest'], id: 7, jsonrpc: '2.0' }
    const [res] = await provider._send(payload)
    assert.ok('error' in res, 'eth_call 0x result should be converted to an error')
    // only sentio-* headers are forwarded, not content-type
    assert.deepEqual(res.headers, { 'x-sentio-error': 'rate limited' })
  })

  test('non-empty eth_call result passes through unchanged', async () => {
    const provider = newProvider()
    provider._getConnection = () =>
      fakeConnection({ id: 1, jsonrpc: '2.0', result: '0x01' }, { 'x-sentio-trace': 'abc' })
    const payload = { method: 'eth_call', params: ['0x', 'latest'], id: 1, jsonrpc: '2.0' }
    const [res] = await provider._send(payload)
    assert.equal(res.result, '0x01')
    assert.ok(!('error' in res))
    assert.ok(!('headers' in res))
  })

  test('getRpcError surfaces forwarded headers and the eth_call block tag', () => {
    const provider = newProvider()
    const payload = {
      method: 'eth_call',
      params: [{ to: '0x0000000000000000000000000000000000000001', data: '0x' }, '0x10'],
      id: 1,
      jsonrpc: '2.0'
    }
    const err: any = provider.getRpcError(payload, {
      error: { code: 3, message: 'boom' },
      headers: { 'x-sentio-error': 'boom' }
    })
    assert.equal(err.info.headers['x-sentio-error'], 'boom')
    assert.equal(err.blockNumber, '0x10')
  })
})
