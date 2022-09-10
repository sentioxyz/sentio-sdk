// TODO move out of this package

import { expect } from 'chai'

import { HandlerType } from '..'

import { GenericProcessor } from '../generic-processor'
import { TestProcessorServer } from './test-processor-server'
import { firstCounterValue } from './metric-utils'

describe('Test Generic Processor', () => {
  const service = new TestProcessorServer(() => {
    GenericProcessor.bind(
      [
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        'event Approval(address indexed from, address indexed to, uint256 value)',
      ],
      { address: '0x1E4EDE388cbc9F4b5c79681B7f94d36a11ABEBC9' }
    ).onAllEvents(function (log, ctx) {
      ctx.meter.Counter('event_num').add(1)
    })

    GenericProcessor.bind('event WalletCreated(address wallet, address owner)', {
      address: '0x57E037F4d2c8BEa011Ad8a9A5AF4AaEEd508650f',
    }).onAllEvents(function (log, ctx) {
      ctx.meter.Counter('wallet').add(1)
    })
  })

  beforeAll(async () => {
    await service.start()
  })

  test('check configuration', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.contractConfigs?.[0].contract?.name).equals('Generic')
  })

  test('Check log dispatch', async () => {
    const res = await service.testLogs([logData, logData])
    const counters = res.result?.counters
    expect(counters).length(2)
    expect(firstCounterValue(res.result, 'event_num')).equals(1n)
    expect(counters?.[0].runtimeInfo?.from).equals(HandlerType.LOG)
  })

  test('Check log dispatch no buffer over rune', async () => {
    const logStr =
      '{"address":"0x57e037f4d2c8bea011ad8a9a5af4aaeed508650f","topics":["0x5b03bfed1c14a02bdeceb5fa582eb1a5765fc0bc64ca0e6af4c20afc9487f081"],"data":"0x00000000000000000000000093269483a70c68d5c5bb63aac1e8f4ac59f498800000000000000000000000000c520e51c055cf63bab075715c1b860b2e9b8e24","blockNumber":"0xc9d6d7","transactionHash":"0x208af3250499672c2f07138b9aa236153c65c78ae4341b23c2763017afdd61a2","transactionIndex":"0xf3","blockHash":"0x6e3b100c34b510049e922fbe1c1dab1b0793be3d1229b632688e6a518cdd11b6","logIndex":"0x14b","removed":false}'
    const res = await service.testLog(JSON.parse(logStr))
    console.log(JSON.stringify(res))
  })

  const logData = {
    blockNumber: 14213252,
    blockHash: '0x83d646fac9350b281def8c4c37626f9d8efc95df801287b848c719edf35cdbaf',
    transactionIndex: 347,
    removed: false,
    address: '0x1E4EDE388cbc9F4b5c79681B7f94d36a11ABEBC9',
    data: '0x00000000000000000000000000000000000000000000009a71db64810aaa0000',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x000000000000000000000000b329e39ebefd16f40d38f07643652ce17ca5bac1',
    ],
    transactionHash: '0x93355e0cb2c3490cb8a747029ff2dc8cdbde2407025b8391398436955afae303',
    logIndex: 428,
  }
})
