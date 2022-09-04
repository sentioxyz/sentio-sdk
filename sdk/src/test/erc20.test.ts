// TODO move out of this package

import { expect } from 'chai'

import { HandlerType } from '..'

import { TestProcessorServer } from './test-processor-server'
import { firstCounterValue, firstGaugeValue } from './metric-utils'

describe('Test Basic Examples', () => {
  const service = new TestProcessorServer()

  beforeAll(async () => {
    service.setup()
    require('./erc20')
    await service.start()
  })

  test('check configuration', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(5)

    // check auto rename
    expect(config.contractConfigs?.[2].contract?.name).equals('Erc20')
    expect(config.contractConfigs?.[3].contract?.name).equals('Erc20_1')
    // same as above because only differ in parameters
    expect(config.contractConfigs?.[4].contract?.name).equals('Erc20_1')
  })

  test('Check block dispatch', async () => {
    const res = await service.testBlock(blockData)
    const o11yRes = res.result
    expect(o11yRes?.counters).length(0)
    expect(o11yRes?.gauges).length(1)
    expect(firstGaugeValue(o11yRes, 'g1')).equals(10n)

    const gauge = o11yRes?.gauges?.[0]
    expect(gauge?.metadata?.blockNumber?.toString()).equals('14373295')
    expect(gauge?.runtimeInfo?.from).equals(HandlerType.BLOCK)

    const res2 = await service.testBlock(blockData, 56)
    const o11yRes2 = res2.result
    expect(o11yRes2?.counters).length(0)
    expect(o11yRes2?.gauges).length(1)
    expect(firstGaugeValue(o11yRes2, 'g2')).equals(20n)
  })

  test('Check log dispatch', async () => {
    let res = await service.testLog(logData)

    const counters = res.result?.counters
    expect(counters).length(1)
    expect(firstCounterValue(res.result, 'c1')).equals(1n)

    expect(counters?.[0].metadata?.chainId).equals('1')
    expect(counters?.[0].runtimeInfo?.from).equals(HandlerType.LOG)
    expect(res.configUpdated).equals(true)

    const logData2 = Object.assign({}, logData)
    logData2.address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    res = await service.testLog(logData2, 56)

    expect(firstCounterValue(res.result, 'c2')).equals(2n)
    expect(res.result?.counters[0].metadata?.chainId).equals('56')

    expect(res.result?.gauges).length(0)

    const config = await service.getConfig({})
    expect(config.contractConfigs).length(6) //config increased
    expect(config.contractConfigs?.[5].contract?.name).equals('dynamic')

    // repeat trigger won't bind again
    await service.testLogs([logData])
    const config2 = await service.getConfig({})
    expect(config).deep.equals(config2)
  })

  const blockData = {
    hash: '0x2b9b7cce1f17f3b7e1f3c2472cc806a07bee3f0baca07d021350950d81d73a42',
    number: 14373295,
    timestamp: 1647106437,
    extraData: '0xe4b883e5bda9e7a59ee4bb99e9b1bc493421',
  }

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
