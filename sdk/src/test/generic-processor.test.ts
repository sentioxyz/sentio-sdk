// TODO move out of this package

import { expect } from 'chai'

import { HandlerType, LogBinding, ProcessLogsRequest, ProcessorServiceImpl, setProvider } from '..'

import { CallContext } from 'nice-grpc-common/src/server/CallContext'
import * as path from 'path'
import * as fs from 'fs-extra'
import { cleanTest } from './clean-test'
import { MetricValueToNumber } from '../numberish'
import { GenericProcessor } from '../generic-processor'

describe('Test Generic Processor', () => {
  const service = new ProcessorServiceImpl(undefined)
  const testContext: CallContext = <CallContext>{}

  beforeAll(async () => {
    cleanTest()

    const fullPath = path.resolve('chains-config.json')
    const chainsConfig = fs.readJsonSync(fullPath)
    setProvider(chainsConfig)

    GenericProcessor.bind(
      [
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        'event Approval(address indexed from, address indexed to,uint256 value)',
      ],
      { address: '0x1E4EDE388cbc9F4b5c79681B7f94d36a11ABEBC9' }
    ).onAllEvents(function (log, ctx) {
      ctx.meter.Counter('event_num').add(1)
    })

    await service.start({ templateInstances: [] }, testContext)
  })

  it('check configuration', async () => {
    const config = await service.getConfig({}, testContext)
    expect(config.contractConfigs).length(1)
    expect(config.contractConfigs?.[0].contract?.name).equals('Generic')
  })

  it('Check log dispatch', async () => {
    const raw = toRaw(logData)
    const request: ProcessLogsRequest = {
      logBindings: [],
    }

    const binding = LogBinding.fromPartial({
      handlerId: 0,
      log: {
        raw: raw,
      },
    })

    request.logBindings.push(binding)
    request.logBindings.push(binding)

    const res = await service.processLogs(request, testContext)

    const counters = res.result?.counters
    expect(counters).length(2)
    expect(MetricValueToNumber(counters?.[0].metricValue)).equals(1n)
    expect(counters?.[0].runtimeInfo?.from).equals(HandlerType.LOG)
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

  function toRaw(obj: any): Uint8Array {
    const logJsonStr = JSON.stringify(obj)
    const raw = new Uint8Array(logJsonStr.length)
    for (let i = 0; i < logJsonStr.length; i++) {
      raw[i] = logJsonStr.charCodeAt(i)
    }
    return raw
  }
})
