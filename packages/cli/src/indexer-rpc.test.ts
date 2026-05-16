import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { callIndexerRpc, ForwardRequestRpc } from './indexer-rpc.js'

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

  it('ForwardRequestRpc serializes deadline as a JSON string (not number)', () => {
    // sentio-node parseFwdReq reads Deadline as a Go string and calls
    // big.Int.SetString on it. If the wire format is a JSON number the
    // server fails with "cannot unmarshal number into Go struct field
    // ForwardRequestJSON.deadline of type string". Lock the shape here.
    const req: ForwardRequestRpc = {
      from: '0x0000000000000000000000000000000000000001',
      payer: '0x0000000000000000000000000000000000000001',
      target: '0x0000000000000000000000000000000000000002',
      gas: '600000',
      nonceKey: '0',
      nonceValue: 0,
      deadline: '1700000000',
      maxFee: '20000000000000',
      data: '0xdeadbeef',
      signature: '0x' + 'aa'.repeat(65)
    }
    const wire = JSON.stringify(req)
    assert.ok(wire.includes('"deadline":"1700000000"'), `deadline should be a string, got: ${wire}`)
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
