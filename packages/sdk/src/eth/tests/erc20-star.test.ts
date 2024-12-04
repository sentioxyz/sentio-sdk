import { before, describe, test } from 'node:test'
// TODO move out of this package

import { expect } from 'chai'

import { firstCounterValue, TestProcessorServer } from '../../testing/index.js'
import { ERC20Processor, mockTransferLog } from '../builtin/erc20.js'
import { ALL_ADDRESS } from '@sentio/sdk'

describe('Test star Examples', () => {
  const service = new TestProcessorServer(async () => {
    ERC20Processor.bind({
      address: ALL_ADDRESS,
      startBlock: 14201940
    }).onEventTransfer(async (evt, ctx) => {
      ctx.meter.Counter('c1').add(1)
    })
  })

  before(async () => {
    process
      .on('uncaughtException', (err) => {
        console.error('Uncaught Exception, please checking if await is properly used', err)
        // shutdownServers(1)
      })
      .on('unhandledRejection', (reason, p) => {
        console.error('Unhandled Rejection, please checking if await is properly', reason)
        // shutdownServers(1)
      })

    await service.start()
  })

  test('check configuration', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)

    expect(config.contractConfigs?.[0].contract?.name).equals('ERC20')
  })

  test.skip('Check log dispatch', async () => {
    const logData = mockTransferLog('0x1E4EDE388cbc9F4b5c79681B7f94d36a11ABEBC9', {
      from: '0x0000000000000000000000000000000000000000',
      to: '0xB329e39Ebefd16f40d38f07643652cE17Ca5Bac1',
      value: BigInt('0x9a71db64810aaa0000')
    })
    const res = await service.eth.testLog(logData)

    const counters = res.result?.counters
    expect(counters).length(1)
    expect(firstCounterValue(res.result, 'c1')).equals(1)
  })
})
