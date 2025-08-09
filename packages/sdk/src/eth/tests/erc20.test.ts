import { before, describe, test } from 'node:test'
// TODO move out of this package

import { expect } from 'chai'

import { firstCounterValue, firstGaugeValue, TestProcessorServer } from '../../testing/index.js'
import { mockTransferLog } from '../builtin/erc20.js'
import { HandlerType } from '@sentio/protos'
import { SENTIO_BIGINT_STRING_SUFFIX } from '../../core/normalization.js'
import { RichBlock } from '../eth.js'
import { EthChainId } from '@sentio/chain'

describe('Test Basic Examples', () => {
  const service = new TestProcessorServer(async () => {
    await import('./erc20.js')
  })

  before(async () => {
    await service.start()
  })
  test('check configuration', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(5)

    expect(config.contractConfigs?.[2].contract?.name).equals('ERC20')
    expect(config.contractConfigs?.[3].contract?.name).equals('ERC20')
    expect(config.contractConfigs?.[4].contract?.name).equals('ytoken')
  })

  test('Check block dispatch', async () => {
    const res = (await service.eth.testBlock(blockData)).result
    expect(res?.counters).length(0)
    expect(res?.gauges).length(1)
    expect(firstGaugeValue(res, 'g1')).equals(10)
    expect(res?.gauges[0].metadata?.contractName).equals('x2y2')

    const gauge = res?.gauges?.[0]
    expect(gauge?.metadata?.blockNumber?.toString()).equals('14373295')
    expect(gauge?.runtimeInfo?.from).equals(HandlerType.ETH_BLOCK)

    const res2 = (await service.eth.testBlock(blockData, EthChainId.BSC)).result
    expect(res2?.counters).length(0)
    expect(res2?.gauges).length(1)
    expect(firstGaugeValue(res2, 'g2')).equals(20)
  })

  test('Check log dispatch', async () => {
    const logData = mockTransferLog('0x1E4EDE388cbc9F4b5c79681B7f94d36a11ABEBC9', {
      from: '0x0000000000000000000000000000000000000000',
      to: '0xB329e39Ebefd16f40d38f07643652cE17Ca5Bac1',
      value: BigInt('0x9a71db64810aaa0000')
    })
    let res = await service.eth.testLog(logData)

    const counters = res.result?.counters
    expect(counters).length(1)
    expect(firstCounterValue(res.result, 'c1')).equals(1)
    const event = res.result?.events[0]
    expect(event?.attributes?.value.endsWith(SENTIO_BIGINT_STRING_SUFFIX)).equals(true)
    expect(event?.attributes?.project).equals('a')

    expect(counters?.[0].metadata?.chainId).equals('1')
    expect(counters?.[0].runtimeInfo?.from).equals(HandlerType.ETH_LOG)
    expect(res.result?.states?.configUpdated).equals(true)

    const logData2 = Object.assign({}, logData)
    logData2.address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    res = await service.eth.testLog(logData2, EthChainId.BSC)

    expect(firstCounterValue(res.result, 'c2')).equals(2)
    expect(res.result?.counters[0].metadata?.chainId).equals('56')

    expect(res.result?.gauges).length(0)

    const config = await service.getConfig({})
    expect(config.contractConfigs).length(6) //config increased
    expect(config.contractConfigs?.[5].contract?.name).equals('dynamic')

    // repeat trigger won't bind again
    await service.eth.testLogs([logData])
    const config2 = await service.getConfig({})
    expect(config).deep.equals(config2)
  })

  test('Check trace dispatch', async () => {
    // const res = (await service.eth.testTrace(traceData)).result
    const config = await service.getConfig({})

    const handlerId = config.contractConfigs?.[0].traceConfigs[0].handlerId
    const res = (
      await service.processBinding({
        data: {
          ethTrace: {
            trace: traceData,
            transaction: undefined,
            transactionReceipt: {
              transactionHash: '0xcb8810a23315b5c2cb836883959bbf982f2158b7d9f7f8f4c5c0a8cf9d90f720',
              gasUsed: '0x4cf12',
              blockHash: '0x74f3c24a0f27a3a6afa8878a2072d62f661b03d04ead2b99c7f6c33acff2e7c2',
              status: '0x1',
              logsBloom:
                '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
              transactionIndex: '0x50',
              contractAddress: '0x0000000000000000000000000000000000000000',
              blockNumber: '0xb8ba23',
              type: '0x0',
              cumulativeGasUsed: '0x8b56b3'
            },
            timestamp: new Date()
          }
        },
        handlerIds: [handlerId],
        handlerType: HandlerType.ETH_TRACE,
        chainId: EthChainId.ETHEREUM
      })
    ).result

    expect(res?.counters).length(1)
  })

  const traceData = {
    action: {
      from: '0x80009ff8154bd5653c6dda2fa5f5053e5a5c1a91',
      callType: 'call',
      gas: 0xbb0a,
      input:
        '0x095ea7b30000000000000000000000003eabf546fff0a41edaaf5b667333a846285713180000000000000000000000000000000000000000000000000000002a03956d85',
      to: '0x1E4EDE388cbc9F4b5c79681B7f94d36a11ABEBC9',
      value: 0x0
    },
    blockHash: '0xb1fe1fefca4063ab9cc06a10356a6dd397b8c3dd38e21470e107a711ad559c13',
    blockNumber: 15548801,
    result: {
      gasUsed: 0x95df,
      output: '0x0000000000000000000000000000000000000000000000000000000000000001'
    },
    subtraces: 1,
    traceAddress: [],
    transactionHash: '0xc05c37b34e13380d0b7e0475b27a0c77fda826f82c603f9c45922e952d63b7a5',
    transactionPosition: 69,
    type: 'call'
  }

  const blockData: RichBlock = {
    hash: '0x2b9b7cce1f17f3b7e1f3c2472cc806a07bee3f0baca07d021350950d81d73a42',
    parentHash: '0x2b9b7cce1f17f3b7e1f3c2472cc806a07bee3f0baca07d021350950d81d73a41',
    difficulty: 1n,
    number: 14373295,
    timestamp: 1647106437,
    extraData: '0xe4b883e5bda9e7a59ee4bb99e9b1bc493421',
    nonce: '0x689056015818adbe',
    gasLimit: 0n,
    gasUsed: 0n,
    miner: '0xbb7b8287f3f0a933474a79eae42cbca977791171',
    baseFeePerGas: null,
    transactions: [],
    traces: [traceData]
  }
})
