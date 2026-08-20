import { after, describe, test } from 'node:test'
import { expect } from 'chai'
import { AccountContext } from './context.js'
import { EthChainId } from '@sentio/chain'
import { QueuedStaticJsonRpcProvider } from './provider.js'
import { Network } from 'ethers'
import type { JsonRpcPayload, JsonRpcResult } from 'ethers'

describe('provider test', () => {
  // test('network test with string', async () => {
  //   const n = getEthChainId('321')
  //   expect(n.chainId).eq(321n)
  // })

  // test('network test with id', async () => {
  //   const n = getEthChainId(321)
  //   expect(n.chainId).eq(321n)
  // })

  test('network test with context', async () => {
    const ctx = new AccountContext(EthChainId.KUCOIN, '0x1')
    const n = ctx.getChainId()
    expect(n).eq(EthChainId.KUCOIN)
  })
})

describe('rpc deadline', () => {
  // A transport that accepts requests but never answers: the pathological case
  // where nothing below us ever settles the promise.
  class HangingProvider extends QueuedStaticJsonRpcProvider {
    sends = 0
    override async _send(_payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult>> {
      this.sends++
      return new Promise(() => {})
    }
  }

  const providers: HangingProvider[] = []
  function newHangingProvider() {
    const p = new HangingProvider('http://127.0.0.1:1', Network.from(1), 4, 1)
    providers.push(p)
    return p
  }

  after(() => {
    delete process.env['RPC_CALL_TIMEOUT_MS']
    for (const p of providers) {
      p.destroy()
    }
  })

  test('eth_call that never settles rejects with TIMEOUT instead of hanging', async () => {
    process.env['RPC_CALL_TIMEOUT_MS'] = '150'
    const provider = newHangingProvider()
    const params = [{ to: '0x0000000000000000000000000000000000000001', data: '0x' }, '0x42']
    let err: any
    try {
      await provider.send('eth_call', params)
    } catch (e) {
      err = e
    }
    expect(err?.code).eq('TIMEOUT')
    expect(provider.sends).gte(1)
  })

  test('a dead in-flight eth_call is evicted, the next identical call re-issues', async () => {
    process.env['RPC_CALL_TIMEOUT_MS'] = '150'
    const provider = newHangingProvider()
    const params = [{ to: '0x0000000000000000000000000000000000000002', data: '0x' }, '0x42']
    await provider.send('eth_call', params).catch(() => {})
    const sendsAfterFirst = provider.sends
    expect(sendsAfterFirst).gte(1)
    // Without eviction this would await the same zombie promise and never
    // reach the transport again.
    await provider.send('eth_call', params).catch(() => {})
    expect(provider.sends).gt(sendsAfterFirst)
  })

  test('non-eth_call requests are bounded too', async () => {
    process.env['RPC_CALL_TIMEOUT_MS'] = '150'
    const provider = newHangingProvider()
    let err: any
    try {
      await provider.send('eth_blockNumber', [])
    } catch (e) {
      err = e
    }
    expect(err?.code).eq('TIMEOUT')
  })

  test('a zombie call frees its concurrency slot (concurrency 1)', async () => {
    process.env['RPC_CALL_TIMEOUT_MS'] = '150'
    const provider = new HangingProvider('http://127.0.0.1:1', Network.from(1), 1, 1)
    providers.push(provider)
    await provider
      .send('eth_call', [{ to: '0x0000000000000000000000000000000000000003', data: '0x' }, '0x42'])
      .catch(() => {})
    const sendsAfterFirst = provider.sends
    expect(sendsAfterFirst).gte(1)
    // A different call must still reach the transport through the single slot:
    // the timed-out task has to settle inside PQueue, not just for its awaiters.
    let err: any
    await provider
      .send('eth_call', [{ to: '0x0000000000000000000000000000000000000004', data: '0x' }, '0x42'])
      .catch((e) => (err = e))
    expect(err?.code).eq('TIMEOUT')
    expect(provider.sends).gt(sendsAfterFirst)
  })

  test('the timeout message stays bounded even for huge calldata', async () => {
    process.env['RPC_CALL_TIMEOUT_MS'] = '150'
    const provider = newHangingProvider()
    const hugeData = '0x' + 'ab'.repeat(200_000)
    let err: any
    await provider
      .send('eth_call', [{ to: '0x0000000000000000000000000000000000000005', data: hugeData }, '0x42'])
      .catch((e) => (err = e))
    expect(err?.code).eq('TIMEOUT')
    expect(err?.message?.length).lt(400)
  })
})
