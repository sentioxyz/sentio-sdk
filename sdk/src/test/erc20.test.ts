// TODO move out of this package

import { expect } from 'chai'

import { HandlerType, LogBinding, ProcessBlockRequest, ProcessLogRequest, ProcessorServiceImpl, setProvider } from '..'

import { CallContext } from 'nice-grpc-common/src/server/CallContext'
import * as path from 'path'
import * as fs from 'fs-extra'
import { cleanTest } from './clean-test'
import { MetricValueToNumber } from '../numberish'

describe('Test Basic Examples', () => {
  const service = new ProcessorServiceImpl(undefined)
  const testContext: CallContext = <CallContext>{}

  before(async () => {
    cleanTest()

    const fullPath = path.resolve('chains-config.json')
    const chainsConfig = fs.readJsonSync(fullPath)
    setProvider(chainsConfig)

    require('./erc20')
    await service.start({ templateInstances: [] }, testContext)
  })

  it('check configuration', async () => {
    const config = await service.getConfig({}, testContext)
    expect(config.contractConfigs).length(5)

    // check auto rename
    expect(config.contractConfigs?.[2].contract?.name).equals('Erc20')
    expect(config.contractConfigs?.[3].contract?.name).equals('Erc20_1')
    // same as above because only differ in parameters
    expect(config.contractConfigs?.[4].contract?.name).equals('Erc20_1')
  })

  it('Check block dispatch', async () => {
    const raw = toRaw(blockData)

    const request: ProcessBlockRequest = {
      block: {
        raw: raw,
      },
      chainId: '1',
    }
    const res = await service.processBlocks({ requests: [request] }, testContext)
    const o11yRes = res.response?.[0].result
    expect(o11yRes?.counters).length(0)
    expect(o11yRes?.gauges).length(1)
    expect(MetricValueToNumber(o11yRes?.gauges?.[0].metricValue)).equals(10n)

    const gauge = o11yRes?.gauges?.[0]
    expect(gauge?.metadata?.blockNumber?.toString()).equals('14373295')
    expect(gauge?.runtimeInfo?.from).equals(HandlerType.BLOCK)

    // Different chainId should be dispatch to other
    const request2: ProcessBlockRequest = {
      block: {
        raw: raw,
      },
      chainId: '56',
    }
    const res2 = await service.processBlocks({ requests: [request2] }, testContext)
    const o11yRes2 = res2.response?.[0].result
    expect(o11yRes2?.counters).length(0)
    expect(o11yRes2?.gauges).length(1)
    expect(MetricValueToNumber(o11yRes2?.gauges?.[0].metricValue)).equals(20n)
  })

  it('Check log dispatch', async () => {
    const raw = toRaw(logData)
    const request: ProcessLogRequest = {
      logs: [],
    }

    const binding = LogBinding.fromPartial({
      handlerId: 0,
      log: {
        raw: raw,
      },
    })

    request.logs.push(binding)

    // just faked some logs here
    const binding2 = LogBinding.fromPartial({
      handlerId: 1,
      log: {
        raw: raw,
      },
    })
    request.logs.push(binding2)

    const res = await service.processLog(request, testContext)

    const counters = res.result?.counters
    expect(counters).length(2)
    expect(MetricValueToNumber(counters?.[0].metricValue)).equals(1n)
    expect(counters?.[0].metadata?.chainId).equals('1')
    expect(counters?.[0].runtimeInfo?.from).equals(HandlerType.LOG)

    expect(MetricValueToNumber(counters?.[1].metricValue)).equals(2n)
    expect(counters?.[1].metadata?.chainId).equals('56')

    expect(res.result?.gauges).length(0)
    expect(res.configUpdated).equals(true)

    const config = await service.getConfig({}, testContext)
    expect(config.contractConfigs).length(6) //config increased
    expect(config.contractConfigs?.[5].contract?.name).equals('dynamic')

    // repeat trigger won't bind again
    await service.processLog(request, testContext)
    const config2 = await service.getConfig({}, testContext)
    expect(config).deep.equals(config2)
  })

  const blockData = {
    hash: '0x2b9b7cce1f17f3b7e1f3c2472cc806a07bee3f0baca07d021350950d81d73a42',
    parentHash: '0xd538332875124ce30a6674926ae6befa2358ac0a03c70d60c24e74ad7bdf2505',
    number: 14373295,
    timestamp: 1647106437,
    nonce: '0x73bcaf422fe98f49',
    difficulty: null,
    miner: '0x829BD824B016326A401d083B33D092293333A830',
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

  function toRaw(obj: any): Uint8Array {
    const logJsonStr = JSON.stringify(obj)
    const raw = new Uint8Array(logJsonStr.length)
    for (let i = 0; i < logJsonStr.length; i++) {
      raw[i] = logJsonStr.charCodeAt(i)
    }
    return raw
  }
})
