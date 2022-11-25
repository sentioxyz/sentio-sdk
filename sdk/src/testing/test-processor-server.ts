import {
  AccountConfig,
  BlockBinding,
  ContractConfig,
  DataBinding,
  HandlerType,
  ProcessBindingResponse,
  ProcessBindingsRequest,
  ProcessBlocksRequest,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessInstructionsRequest,
  ProcessorServiceImplementation,
  ProcessTransactionsRequest,
  StartRequest,
} from '../gen'
import { CallContext } from 'nice-grpc-common'
import { Empty } from '../gen/google/protobuf/empty'
import { ChainConfig } from '../chain-config'
import { CHAIN_MAP } from '../utils/chain'
import { Block, Log } from '@ethersproject/abstract-provider'
import Long from 'long'
import { getNetwork, Networkish } from '@ethersproject/providers'
import { Endpoints } from '../endpoints'
import { ProcessorState } from '../state/processor-state'
import { ProcessorServiceImpl } from '../service'
import { Trace } from '../core/trace'
import { setProvider } from '../provider'
import { account } from '../builtin/aptos/0x1'

export const TEST_CONTEXT: CallContext = <CallContext>{}

export function cleanTest() {
  global.PROCESSOR_STATE = new ProcessorState()
  if (!global.ENDPOINTS) {
    global.ENDPOINTS = new Endpoints()
  }
}

export class TestProcessorServer implements ProcessorServiceImplementation {
  service: ProcessorServiceImpl
  contractConfigs: ContractConfig[]
  accountConfigs: AccountConfig[]

  constructor(loader: () => void, httpEndpoints: Record<string, string> = {}) {
    cleanTest()

    this.service = new ProcessorServiceImpl(loader)
    const dummyConfig: Record<string, ChainConfig> = {}

    for (const k in CHAIN_MAP) {
      const http = httpEndpoints[k] || ''
      dummyConfig[k] = {
        ChainID: k,
        Https: [http],
      }
    }

    setProvider(dummyConfig)
  }

  async start(request: StartRequest = { templateInstances: [] }, context = TEST_CONTEXT): Promise<Empty> {
    const res = await this.service.start(request, context)
    const config = await this.getConfig({})
    this.contractConfigs = config.contractConfigs
    this.accountConfigs = config.accountConfigs
    return res
  }

  stop(request: Empty, context = TEST_CONTEXT): Promise<Empty> {
    return this.service.stop(request, context)
  }

  getConfig(request: ProcessConfigRequest, context = TEST_CONTEXT): Promise<ProcessConfigResponse> {
    return this.service.getConfig(request, context)
  }

  processBlocks(request: ProcessBlocksRequest, context = TEST_CONTEXT): Promise<ProcessBindingResponse> {
    return this.service.processBlocks(request, context)
  }

  processInstructions(request: ProcessInstructionsRequest, context = TEST_CONTEXT): Promise<ProcessBindingResponse> {
    return this.service.processInstructions(request, context)
  }

  processLogs(request: ProcessBindingsRequest, context = TEST_CONTEXT): Promise<ProcessBindingResponse> {
    return this.service.processLogs(request, context)
  }

  processTraces(request: ProcessBindingsRequest, context: CallContext = TEST_CONTEXT): Promise<ProcessBindingResponse> {
    return this.service.processTraces(request, context)
  }

  processTransactions(request: ProcessTransactionsRequest, context = TEST_CONTEXT): Promise<ProcessBindingResponse> {
    return this.service.processTransactions(request, context)
  }

  testTrace(trace: Trace, network: Networkish = 1): Promise<ProcessBindingResponse> {
    return this.testTraces([trace], network)
  }

  testTraces(traces: Trace[], network: Networkish = 1): Promise<ProcessBindingResponse> {
    const bindings = []
    for (const trace of traces) {
      const binding = this.buildTraceBinding(trace, network)
      if (!binding) {
        throw Error('Invalid test trace: ' + JSON.stringify(trace))
      }
      bindings.push(binding)
    }
    return this.processTraces({
      bindings: bindings,
    })
  }

  buildTraceBinding(trace: Trace, network: Networkish = 1): DataBinding | undefined {
    if (trace.type !== 'call' || !trace.action.input) {
      throw Error('Invalid test trace: ' + JSON.stringify(trace))
    }
    const signature = trace.action.input.slice(0, 10)

    for (const contract of this.contractConfigs) {
      if (contract.contract?.chainId !== getNetwork(network).chainId.toString()) {
        continue
      }
      if (trace.action.to?.toLowerCase() !== contract.contract?.address.toLowerCase()) {
        continue
      }
      for (const config of contract.traceConfigs) {
        if (config.signature == signature) {
          return {
            data: {
              raw: toBytes(trace),
            },
            handlerId: config.handlerId,
            handlerType: HandlerType.ETH_TRACE,
          }
        }
      }
    }
    return undefined
  }

  testLog(log: Log, network: Networkish = 1): Promise<ProcessBindingResponse> {
    return this.testLogs([log], network)
  }

  testLogs(logs: Log[], network: Networkish = 1): Promise<ProcessBindingResponse> {
    const bindings = []
    for (const log of logs) {
      const binding = this.buildLogBinding(log, network)
      if (!binding) {
        throw Error('Invalid test log: ' + JSON.stringify(log))
      }
      bindings.push(binding)
    }
    return this.processLogs({
      bindings: bindings,
    })
  }

  buildLogBinding(log: Log, network: Networkish = 1): DataBinding | undefined {
    for (const contract of this.contractConfigs) {
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
              data: {
                raw: toBytes(log),
              },
              handlerId: config.handlerId,
              handlerType: HandlerType.ETH_LOG,
            }
          }
        }
      }
    }
    return undefined
  }
  testAccountLog(address: string, log: Log, network: Networkish = 1): Promise<ProcessBindingResponse> {
    return this.testAccountLogs(address, [log], network)
  }

  testAccountLogs(address: string, logs: Log[], network: Networkish = 1): Promise<ProcessBindingResponse> {
    const bindings = []
    for (const log of logs) {
      const binding = this.buildAccountLogBinding(address, log, network)
      if (!binding) {
        throw Error('Invalid test log: ' + JSON.stringify(log))
      }
      bindings.push(binding)
    }
    return this.processLogs({
      bindings: bindings,
    })
  }

  buildAccountLogBinding(address: string, log: Log, network: Networkish = 1): DataBinding | undefined {
    for (const account of this.accountConfigs) {
      if (account.chainId !== getNetwork(network).chainId.toString()) {
        continue
      }
      if (address.toLowerCase() !== account.address.toLowerCase()) {
        continue
      }
      for (const config of account.logConfigs) {
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
              data: {
                raw: toBytes(log),
              },
              handlerId: config.handlerId,
              handlerType: HandlerType.ETH_LOG,
            }
          }
        }
      }
    }
    return undefined
  }

  testBlock(block: Partial<Block> & { number: number }, network: Networkish = 1): Promise<ProcessBindingResponse> {
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
    for (const contract of this.contractConfigs) {
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

      for (const config of contract.intervalConfigs) {
        binding.handlerIds.push(config.handlerId)
      }
    }
    return binding
  }

  processBindings(
    request: ProcessBindingsRequest,
    context: CallContext = TEST_CONTEXT
  ): Promise<ProcessBindingResponse> {
    return this.service.processBindings(request, context)
  }
}

function toBytes(obj: any): Uint8Array {
  const logJsonStr = JSON.stringify(obj)
  const raw = new Uint8Array(logJsonStr.length)
  for (let i = 0; i < logJsonStr.length; i++) {
    raw[i] = logJsonStr.charCodeAt(i)
  }
  return raw
}
