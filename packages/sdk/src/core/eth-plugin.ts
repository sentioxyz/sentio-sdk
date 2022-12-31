import { Plugin, PluginManager } from '@sentio/base'
import {
  AccountConfig,
  ContractConfig,
  DataBinding,
  HandlerType,
  LogFilter,
  LogHandlerConfig,
  ProcessConfigResponse,
  ProcessResult,
} from '@sentio/protos'
import { errorString, mergeProcessResults, USER_PROCESSOR } from '@sentio/base'

import { ServerError, Status } from 'nice-grpc'
import { Block, Log } from '@ethersproject/abstract-provider'
import { Trace } from '@sentio/sdk'
import { ProcessorState } from '../binds'
import { AccountProcessorState } from './account-processor'

export class EthPlugin implements Plugin {
  name: string = 'EthPlugin'

  private eventHandlers: ((event: Log) => Promise<ProcessResult>)[] = []
  private traceHandlers: ((trace: Trace) => Promise<ProcessResult>)[] = []
  private blockHandlers: ((block: Block) => Promise<ProcessResult>)[] = []

  configure(config: ProcessConfigResponse): void {
    for (const processor of ProcessorState.INSTANCE.getValues()) {
      // If server favor incremental update this need to change
      // Start basic config for contract
      const chainId = processor.getChainId()
      // this.processorsByChainId.set(chainId, processor)

      const contractConfig: ContractConfig = {
        processorType: USER_PROCESSOR,
        contract: {
          name: processor.config.name,
          chainId: chainId.toString(),
          address: processor.config.address,
          abi: '',
        },
        intervalConfigs: [],
        logConfigs: [],
        traceConfigs: [],
        startBlock: processor.config.startBlock,
        endBlock: 0n,
        instructionConfig: undefined,
        aptosEventConfigs: [],
        aptosCallConfigs: [],
      }
      if (processor.config.endBlock) {
        contractConfig.endBlock = processor.config.endBlock
      }

      // Step 1. Prepare all the block handlers
      for (const blockHandler of processor.blockHandlers) {
        const handlerId = this.blockHandlers.push(blockHandler.handler) - 1
        // TODO wrap the block handler into one

        contractConfig.intervalConfigs.push({
          slot: 0,
          slotInterval: blockHandler.blockInterval,
          minutes: 0,
          minutesInterval: blockHandler.timeIntervalInMinutes,
          handlerId: handlerId,
        })
      }

      // Step 2. Prepare all trace handlers
      for (const traceHandler of processor.traceHandlers) {
        const handlerId = this.traceHandlers.push(traceHandler.handler) - 1
        contractConfig.traceConfigs.push({
          signature: traceHandler.signature,
          handlerId: handlerId,
        })
      }

      // Step 3. Prepare all the event handlers
      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        const handlerId = this.eventHandlers.push(eventsHandler.handler) - 1
        const logConfig: LogHandlerConfig = {
          handlerId: handlerId,
          filters: [],
        }

        for (const filter of eventsHandler.filters) {
          if (!filter.topics) {
            throw new ServerError(Status.INVALID_ARGUMENT, 'Topic should not be null')
          }
          const logFilter: LogFilter = {
            addressType: undefined,
            address: contractConfig.contract?.address,
            topics: [],
          }

          for (const ts of filter.topics) {
            let hashes: string[] = []
            if (Array.isArray(ts)) {
              hashes = hashes.concat(ts)
            } else if (ts) {
              hashes.push(ts)
            }
            logFilter.topics.push({ hashes: hashes })
          }
          logConfig.filters.push(logFilter)
        }
        contractConfig.logConfigs.push(logConfig)
      }

      // Finish up a contract
      config.contractConfigs.push(contractConfig)
    }

    // part 1.b prepare EVM account processors
    for (const processor of AccountProcessorState.INSTANCE.getValues()) {
      const accountConfig: AccountConfig = {
        address: processor.config.address,
        chainId: processor.getChainId().toString(),
        startBlock: processor.config.startBlock ? BigInt(processor.config.startBlock) : 0n,
        aptosIntervalConfigs: [],
        intervalConfigs: [],
        logConfigs: [],
      }
      // TODO add interval
      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        const handlerId = this.eventHandlers.push(eventsHandler.handler) - 1
        const logConfig: LogHandlerConfig = {
          handlerId: handlerId,
          filters: [],
        }

        for (const filter of eventsHandler.filters) {
          if (!filter.topics) {
            throw new ServerError(Status.INVALID_ARGUMENT, 'Topic should not be null')
          }
          const logFilter: LogFilter = {
            addressType: filter.addressType,
            address: filter.address,
            topics: [],
          }

          for (const ts of filter.topics) {
            let hashes: string[] = []
            if (Array.isArray(ts)) {
              hashes = hashes.concat(ts)
            } else if (ts) {
              hashes.push(ts)
            }
            logFilter.topics.push({ hashes: hashes })
          }
          logConfig.filters.push(logFilter)
        }
        accountConfig.logConfigs.push(logConfig)
      }

      config.accountConfigs.push(accountConfig)
    }
  }

  supportedHandlers = [HandlerType.ETH_LOG, HandlerType.ETH_BLOCK, HandlerType.ETH_TRACE]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    // return Promise.resolve(undefined);
    switch (request.handlerType) {
      case HandlerType.ETH_LOG:
        return this.processLog(request)
      case HandlerType.ETH_TRACE:
        return this.processTrace(request)
      case HandlerType.ETH_BLOCK:
        return this.processBlock(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async processLog(request: DataBinding): Promise<ProcessResult> {
    if (!request.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Log can't be null")
    }

    const promises: Promise<ProcessResult>[] = []
    let log: Log
    if (request.data.ethLog) {
      log = request.data.ethLog.log as Log
    } else {
      throw new ServerError(Status.INVALID_ARGUMENT, "Log can't be null")
    }

    for (const handlerId of request.handlerIds) {
      const handler = this.eventHandlers[handlerId]
      promises.push(
        handler(log).catch((e) => {
          throw new ServerError(Status.INTERNAL, 'error processing log: ' + JSON.stringify(log) + '\n' + errorString(e))
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processTrace(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Trace can't be empty")
    }
    let trace: Trace
    if (binding.data.ethTrace?.trace) {
      trace = binding.data.ethTrace.trace as Trace
    } else {
      throw new ServerError(Status.INVALID_ARGUMENT, "Trace can't be null")
    }

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.traceHandlers[handlerId](trace).catch((e) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing trace: ' + JSON.stringify(trace) + '\n' + errorString(e)
          )
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processBlock(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Block can't be empty")
    }
    let block: Block
    if (binding.data.ethBlock?.block) {
      block = binding.data.ethBlock.block as Block
    } else {
      throw new ServerError(Status.INVALID_ARGUMENT, "Block can't be empty")
    }

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.blockHandlers[handlerId](block).catch((e) => {
          throw new ServerError(Status.INTERNAL, 'error processing block: ' + block.number + '\n' + errorString(e))
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }
}

PluginManager.INSTANCE.register(new EthPlugin())
