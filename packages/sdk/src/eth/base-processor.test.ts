import { before, describe, test } from 'node:test'
import { setTimeout } from 'timers/promises'

import { expect } from 'chai'

import { GenericProcessor, GlobalProcessor } from './index.js'
import { TestProcessorServer } from '../testing/index.js'
import { processMetrics } from '@sentio/runtime'

describe('Test Base Processor', () => {
  const service = new TestProcessorServer(async () => {
    GenericProcessor.bind(
      [
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        'event Approval(address indexed from, address indexed to, uint256 value)',
        'function transferFrom(address from, address to, uint value)',
        'function balanceOf(address owner) view returns (uint balance)'
      ],
      { address: '0x1E4EDE388cbc9F4b5c79681B7f94d36a11ABEBC9' }
    )
      .onEvent(async function (log, ctx) {
        ctx.meter.Counter('event_num').add(1)
        await setTimeout(135)
      })
      .onTrace(function (trace, ctx) {
        ctx.meter.Counter('trace_count').add(1, { name: trace.name })
        ctx.eventLogger.emit(trace.name, {
          distinctId: trace.action.from,
          ...trace.args.toObject()
        })
      })

    GenericProcessor.bind('event WalletCreated(address wallet, address owner)', {
      address: '0x57E037F4d2c8BEa011Ad8a9A5AF4AaEEd508650f'
    }).onEvent(function (log, ctx) {
      ctx.meter.Counter('wallet').add(1)
    })
  })

  before(async () => {
    await service.start()
  })

  test('Check onEvent metrics', async () => {
    await service.eth.testLogs([logData, logData])

    expect(processMetrics.process_metricrecord_count.get()).equals(2)
  })

  const logData = {
    index: 0,
    blockNumber: 14213252,
    blockHash: '0x83d646fac9350b281def8c4c37626f9d8efc95df801287b848c719edf35cdbaf',
    transactionIndex: 347,
    removed: false,
    address: '0x1E4EDE388cbc9F4b5c79681B7f94d36a11ABEBC9',
    data: '0x00000000000000000000000000000000000000000000009a71db64810aaa0000',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x000000000000000000000000b329e39ebefd16f40d38f07643652ce17ca5bac1'
    ],
    transactionHash: '0x93355e0cb2c3490cb8a747029ff2dc8cdbde2407025b8391398436955afae303',
    logIndex: 428
  }
})

describe('Test Global Processor', () => {
  const service = new TestProcessorServer(async () => {
    GlobalProcessor.bind({}).onTransaction((tx, ctx) => {
      ctx.meter.Counter('tx_num').add(1)
    })
  })

  before(async () => {
    await service.start()
  })

  test('test transaction', async () => {
    const tx = {
      blockNumber: 2,
      index: 0,
      hash: '0xcb8810a23315b5c2cb836883959bbf982f2158b7d9f7f8f4c5c0a8cf9d90f720',
      from: '0x0000000000000000000000000000000000000000',
      gasLimit: 1n,
      value: 2n,
      nonce: 123,
      data: '0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000002'
    }
    const res = await service.eth.testTransaction(tx)
    const counters = res.result?.counters
    expect(counters).length(1)
    expect(counters?.[0].metadata?.transactionHash).equals(tx.hash)
  })
})
