import { TestProcessorServer, firstCounterValue } from '@sentio/sdk/testing'
import { mockTransferLog } from '@sentio/sdk/eth/builtin/erc20'

describe('Test Processor', () => {
  const service = new TestProcessorServer(() => import('./processor.js'))

  beforeAll(async () => {
    await service.start()
  })

  test('has valid config', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs.length > 0).toBeTruthy()
  })

  test('check transfer event handling', async () => {
    const resp = await service.eth.testLog(
      mockTransferLog('0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9', {
        from: '0x0000000000000000000000000000000000000000',
        to: '0xb329e39ebefd16f40d38f07643652ce17ca5bac1',
        value: 10n ** 18n * 10n,
      })
    )

    const tokenCounter = firstCounterValue(resp.result, 'token')
    expect(tokenCounter).toEqual(10n)
  })
})
