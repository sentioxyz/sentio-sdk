// TODO move out of this package

import { assert, expect } from 'chai'

import { firstCounterValue, TestProcessorServer } from '../testing/index.js'
import { mockTransferLog } from '../eth/builtin/erc20.js'
import { AccountProcessor } from '../eth/account-processor.js'

describe(' erc20 account transfer Examples', () => {
  const ADDRESS = '0x1000000000000000000000000000000000000000'

  const service = new TestProcessorServer(async () => {
    AccountProcessor.bind({ address: ADDRESS })
      .onERC20TransferOut((evt, ctx) => {
        assert(evt.args.from === ADDRESS)
        ctx.meter.Counter('out').add(evt.args.value)
      })
      .onERC20TransferIn(
        (evt, ctx) => {
          assert(evt.args.to === ADDRESS)
          ctx.meter.Counter('in').add(evt.args.value)
        },
        ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48']
      )
  })

  beforeAll(async () => {
    await service.start()
  })

  test('check configuration', async () => {
    const config = await service.getConfig({})
    expect(config.accountConfigs).length(1)

    expect(config.accountConfigs[0].address).equals(ADDRESS)
    expect(config.accountConfigs[0].logConfigs[1].filters[0].address).equals(
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    )
  })

  test('Check log dispatch', async () => {
    const res = await service.testAccountLogs(ADDRESS, [
      mockTransferLog('0x1E4EDE388cbc9F4b5c79681B7f94d36a11ABEBC9', {
        from: ADDRESS,
        to: '0xB329e39Ebefd16f40d38f07643652cE17Ca5Bac1',
        value: BigInt(100),
      }),
      mockTransferLog('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', {
        from: '0xB329e39Ebefd16f40d38f07643652cE17Ca5Bac1',
        to: ADDRESS,
        value: BigInt(200),
      }),
    ])

    const counters = res.result?.counters
    expect(counters).length(2)
    expect(firstCounterValue(res.result, 'out')).equals(100n)
    expect(firstCounterValue(res.result, 'in')).equals(200n)
  })
})
