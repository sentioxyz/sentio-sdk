import {
  BigDecimal,
  BlockBinding,
  ContractConfig,
  LogBinding,
  MetricValue,
  O11yResult,
  ProcessBlocksRequest,
  ProcessBlocksResponse,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessInstructionsRequest,
  ProcessInstructionsResponse,
  ProcessLogsRequest,
  ProcessLogsResponse,
  ProcessorServiceImpl,
  ProcessorServiceImplementation,
  ProcessorState,
  ProcessTransactionsRequest,
  ProcessTransactionsResponse,
  setProvider,
  StartRequest,
} from '@sentio/sdk'
import { CallContext } from 'nice-grpc-common'
import { Empty } from '../gen/google/protobuf/empty'
import { ChainConfig } from '../chain-config'
import { CHAIN_MAP } from '../utils/chainmap'
import { Numberish } from '../numberish'
import { Block, Log } from '@ethersproject/abstract-provider'
import Long from 'long'
import { getNetwork, Networkish } from '@ethersproject/providers'
import { DeepPartial } from '../gen/builtin'
import { BigNumber } from 'ethers'

const TEST_CONTEXT: CallContext = <CallContext>{}

function cleanTest() {
  global.PROCESSOR_STATE = new ProcessorState()
}

export class TestProcessorServer implements ProcessorServiceImplementation {
  service = new ProcessorServiceImpl()
  contractConfig: ContractConfig[]

  setup(httpEndpoints: Record<string, string> = {}) {
    cleanTest()
    const dummyConfig: Record<string, ChainConfig> = {}

    for (const k in CHAIN_MAP) {
      const http = httpEndpoints[k] || ''
      dummyConfig[k] = {
        ChainID: k,
        Https: [http],
      }
    }

    setProvider(dummyConfig)

    // if (!Array.isArray(processorPath)) {
    //   processorPath = [processorPath]
    // }
    // for (const path of processorPath) {
    //   require(path)
    // }
  }

  async start(request: StartRequest = { templateInstances: [] }, context = TEST_CONTEXT): Promise<Empty> {
    const res = await this.service.start(request, context)
    this.contractConfig = (await this.getConfig({})).contractConfigs
    return res
  }

  stop(request: Empty, context = TEST_CONTEXT): Promise<Empty> {
    return this.service.stop(request, context)
  }

  getConfig(request: ProcessConfigRequest, context = TEST_CONTEXT): Promise<ProcessConfigResponse> {
    return this.service.getConfig(request, context)
  }

  processBlocks(request: ProcessBlocksRequest, context = TEST_CONTEXT): Promise<ProcessBlocksResponse> {
    return this.service.processBlocks(request, context)
  }

  processInstructions(
    request: ProcessInstructionsRequest,
    context = TEST_CONTEXT
  ): Promise<ProcessInstructionsResponse> {
    return this.service.processInstructions(request, context)
  }

  processLogs(request: ProcessLogsRequest, context = TEST_CONTEXT): Promise<ProcessLogsResponse> {
    return this.service.processLogs(request, context)
  }

  processTransactions(
    request: ProcessTransactionsRequest,
    context = TEST_CONTEXT
  ): Promise<ProcessTransactionsResponse> {
    return this.service.processTransactions(request, context)
  }

  testLog(log: Log, network: Networkish = 1): Promise<ProcessLogsResponse> {
    return this.testLogs([log], network)
  }

  testLogs(logs: Log[], network: Networkish = 1): Promise<ProcessLogsResponse> {
    const bindings = []
    for (const log of logs) {
      const binding = this.buildLogBinding(log, network)
      if (!binding) {
        throw Error('Invalid test log: ' + JSON.stringify(log))
      }
      bindings.push(binding)
    }
    return this.processLogs({
      logBindings: bindings,
    })
  }

  buildLogBinding(log: Log, network: Networkish = 1): LogBinding | undefined {
    for (const contract of this.contractConfig) {
      if (contract.contract?.chainId !== getNetwork(network).chainId.toString()) {
        continue
      }
      if (log.address.toLowerCase() !== contract.contract?.address.toLowerCase()) {
        continue
      }
      for (const config of contract.logConfigs) {
        for (const filter of config.filters) {
          // if (filter.topics.length != log.topics.length) {
          //   continue
          // }

          let match = true
          for (const topicIdx in filter.topics) {
            const logTopic = log.topics[topicIdx]
            const possibleTopic = filter.topics[topicIdx].hashes
            if (possibleTopic.length === 0) {
              // match all
              continue
            }
            if (possibleTopic.find((e) => e.toLowerCase() === logTopic.toLowerCase())) {
              // find one
              continue
            }
            match = false
            break
          }
          if (match) {
            return {
              log: {
                raw: toBytes(log),
              },
              handlerId: config.handlerId,
            }
          }
        }
      }
    }
    return undefined
  }

  testBlock(block: Partial<Block> & { number: number }, network: Networkish = 1): Promise<ProcessBlocksResponse> {
    return this.testBlocks([block], network)
  }

  testBlocks(blocks: Partial<Block> & { number: number }[], network: Networkish = 1) {
    const bindings = []
    for (const block of blocks) {
      const binding = this.buildBlockBinding(block, network)
      if (!binding) {
        throw Error('Invalid test block: ' + JSON.stringify(block))
      }
      bindings.push(binding)
    }
    return this.processBlocks({
      blockBindings: bindings,
    })
  }

  buildBlockBinding(block: Partial<Block> & { number: number }, network: Networkish = 1): BlockBinding {
    const binding: BlockBinding = {
      block: {
        raw: toBytes(block),
      },
      handlerIds: [],
    }
    for (const contract of this.contractConfig) {
      if (contract.contract?.chainId !== getNetwork(network).chainId.toString()) {
        continue
      }
      const longBlockNumber = Long.fromNumber(block.number)
      if (longBlockNumber < contract.startBlock) {
        continue
      }
      if (contract.endBlock !== Long.ZERO && longBlockNumber >= contract.endBlock) {
        continue
      }

      for (const config of contract.blockConfigs) {
        binding.handlerIds.push(config.handlerId)
      }
    }
    return binding
  }
}

export function firstCounterValue(result: O11yResult | undefined, name: string): Numberish | undefined {
  if (!result) {
    return undefined
  }
  for (const counter of result.counters) {
    if (counter.metadata?.name === name) {
      return MetricValueToNumber(counter.metricValue)
    }
  }
  return undefined
}

export function firstGaugeValue(result: O11yResult | undefined, name: string): Numberish | undefined {
  if (!result) {
    return undefined
  }
  for (const gauge of result.gauges) {
    if (gauge.metadata?.name === name) {
      return MetricValueToNumber(gauge.metricValue)
    }
  }
  return undefined
}

function toBytes(obj: any): Uint8Array {
  const logJsonStr = JSON.stringify(obj)
  const raw = new Uint8Array(logJsonStr.length)
  for (let i = 0; i < logJsonStr.length; i++) {
    raw[i] = logJsonStr.charCodeAt(i)
  }
  return raw
}

export function MetricValueToNumber(v: DeepPartial<MetricValue> | undefined): Numberish | undefined {
  if (v === undefined) {
    return undefined
  }

  if (v.doubleValue !== undefined) {
    return v.doubleValue
  }
  if (v.bigInteger !== undefined) {
    let intValue = BigNumber.from(v.bigInteger.data).toBigInt()
    if (v.bigInteger.negative) {
      intValue = -intValue
    }
    return intValue
  }
  if (v.bigDecimal !== undefined) {
    return new BigDecimal(v.bigDecimal)
  }
  return undefined
}
