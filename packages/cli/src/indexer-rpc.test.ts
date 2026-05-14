import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { callIndexerRpc } from './indexer-rpc.js'

describe('indexerRpc', () => {
  it('builds a valid JSON-RPC POST request', async () => {
    let captured: any
    const fakeFetch = async (url: string, init: any) => {
      captured = { url, init }
      return {
        ok: true,
        json: async () => ({ jsonrpc: '2.0', id: 1, result: 'abc' })
      } as unknown as Response
    }
    const result = await callIndexerRpc<string>(
      'http://x:1',
      'sentio_estimateRelayFee',
      ['0xabc', '0x12345678'],
      fakeFetch as any
    )
    assert.equal(result, 'abc')
    assert.equal(captured.url, 'http://x:1')
    const body = JSON.parse(captured.init.body)
    assert.equal(body.method, 'sentio_estimateRelayFee')
    assert.deepEqual(body.params, ['0xabc', '0x12345678'])
  })

  it('surfaces JSON-RPC error.message', async () => {
    const fakeFetch = async () =>
      ({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32000, message: 'BillingBadNonce(expected=0, got=1)' }
        })
      }) as unknown as Response
    await assert.rejects(
      () => callIndexerRpc('http://x:1', 'sentio_submitForwardRequest', [], fakeFetch as any),
      /BillingBadNonce/
    )
  })
})
