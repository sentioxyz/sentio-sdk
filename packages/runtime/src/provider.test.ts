import assert from 'assert'
import { describe, test, mock } from 'node:test'
import { JsonRpcProvider } from 'ethers'
import { getProvider } from './provider.js'
import { Endpoints } from 'endpoints.js'
import { EthChainId } from '@sentio/chain'
import { GLOBAL_CONFIG } from 'global-config.js'

Endpoints.INSTANCE.concurrency = 1
Endpoints.INSTANCE.batchCount = 1
Endpoints.INSTANCE.chainServer.set(EthChainId.ETHEREUM, 'http://localhost:12345')

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
