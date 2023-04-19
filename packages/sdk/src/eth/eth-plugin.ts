import { errorString, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  AccountConfig,
  ContractConfig,
  Data_EthBlock,
  Data_EthLog,
  Data_EthTrace,
  Data_EthTransaction,
  DataBinding,
  HandlerType,
  LogFilter,
  LogHandlerConfig,
  ProcessConfigResponse,
  ProcessResult,
  StartRequest,
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'
import { ProcessorState } from './binds.js'
import { AccountProcessorState } from './account-processor-state.js'
import { ProcessorTemplateProcessorState, TemplateInstanceState } from './base-processor-template.js'
import { GlobalProcessorState } from './base-processor.js'
import { validateAndNormalizeAddress } from './eth.js'

export class EthPlugin extends Plugin {
  name: string = 'EthPlugin'

  private eventHandlers: ((event: Data_EthLog) => Promise<ProcessResult>)[] = []
  private traceHandlers: ((trace: Data_EthTrace) => Promise<ProcessResult>)[] = []
  private blockHandlers: ((block: Data_EthBlock) => Promise<ProcessResult>)[] = []
  private transactionHandlers: ((trace: Data_EthTransaction) => Promise<ProcessResult>)[] = []

  async configure(config: ProcessConfigResponse) {
    // This syntax is to copy values instead of using references
    config.templateInstances = [...TemplateInstanceState.INSTANCE.getValues()]

    for (const processor of ProcessorState.INSTANCE.getValues()) {
      // If server favor incremental update this need to change
      // Start basic config for contract
      const chainId = processor.getChainId()
      // this.processorsByChainId.set(chainId, processor)

      const contractConfig = ContractConfig.fromPartial({
        processorType: USER_PROCESSOR,
        contract: {
          name: processor.config.name,
          chainId: chainId.toString(),
          address: validateAndNormalizeAddress(processor.config.address),
          abi: '',
        },
        startBlock: processor.config.startBlock,
        endBlock: processor.config.endBlock,
      })

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
          fetchConfig: blockHandler.fetchConfig,
        })
      }

      // Step 2. Prepare all trace handlers
      for (const traceHandler of processor.traceHandlers) {
        const handlerId = this.traceHandlers.push(traceHandler.handler) - 1
        for (const signature of traceHandler.signatures) {
          contractConfig.traceConfigs.push({
            signature: signature,
            handlerId: handlerId,
            fetchConfig: traceHandler.fetchConfig,
          })
        }
      }

      // Step 3. Prepare all the event handlers
      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        const handlerId = this.eventHandlers.push(eventsHandler.handler) - 1
        const logConfig: LogHandlerConfig = {
          handlerId: handlerId,
          filters: [],
          fetchConfig: eventsHandler.fetchConfig,
        }

        for (const filter of eventsHandler.filters) {
          const topics = await filter.getTopicFilter()

          // if (!filter.topics) {
          //   throw new ServerError(Status.INVALID_ARGUMENT, 'Topic should not be null')
          // }
          const logFilter: LogFilter = {
            addressType: undefined,
            address: contractConfig.contract?.address && validateAndNormalizeAddress(contractConfig.contract.address),
            topics: [],
          }

          for (const ts of topics) {
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

    for (const processor of GlobalProcessorState.INSTANCE.getValues()) {
      const chainId = processor.getChainId()

      const contractConfig = ContractConfig.fromPartial({
        processorType: USER_PROCESSOR,
        contract: {
          name: processor.config.name,
          chainId: chainId.toString(),
          address: processor.config.address, // can only be *
          abi: '',
        },
        startBlock: processor.config.startBlock,
        endBlock: processor.config.endBlock,
      })

      for (const blockHandler of processor.blockHandlers) {
        const handlerId = this.blockHandlers.push(blockHandler.handler) - 1
        contractConfig.intervalConfigs.push({
          slot: 0,
          slotInterval: blockHandler.blockInterval,
          minutes: 0,
          minutesInterval: blockHandler.timeIntervalInMinutes,
          handlerId: handlerId,
          fetchConfig: blockHandler.fetchConfig,
        })
      }

      for (const transactionHandler of processor.transactionHandler) {
        const handlerId = this.transactionHandlers.push(transactionHandler.handler) - 1
        contractConfig.transactionConfig.push({
          handlerId: handlerId,
          fetchConfig: transactionHandler.fetchConfig,
        })
      }
      config.contractConfigs.push(contractConfig)
    }

    // part 1.b prepare EVM account processors
    for (const processor of AccountProcessorState.INSTANCE.getValues()) {
      const accountConfig = AccountConfig.fromPartial({
        address: validateAndNormalizeAddress(processor.config.address),
        chainId: processor.getChainId().toString(),
        startBlock: processor.config.startBlock ? BigInt(processor.config.startBlock) : 0n,
      })
      // TODO add interval
      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        const handlerId = this.eventHandlers.push(eventsHandler.handler) - 1
        const logConfig: LogHandlerConfig = {
          handlerId: handlerId,
          filters: [],
          fetchConfig: eventsHandler.fetchConfig,
        }

        for (const filter of eventsHandler.filters) {
          const topics = await filter.getTopicFilter()
          // if (!filter.topics) {
          //   throw new ServerError(Status.INVALID_ARGUMENT, 'Topic should not be null')
          // }
          let address = undefined
          if (filter.address) {
            address = filter.address.toString()
          }
          const logFilter: LogFilter = {
            addressType: filter.addressType,
            address: address && validateAndNormalizeAddress(address),
            topics: [],
          }

          for (const ts of topics) {
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

  supportedHandlers = [HandlerType.ETH_LOG, HandlerType.ETH_BLOCK, HandlerType.ETH_TRACE, HandlerType.ETH_TRANSACTION]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    // return Promise.resolve(undefined);
    switch (request.handlerType) {
      case HandlerType.ETH_LOG:
        return this.processLog(request)
      case HandlerType.ETH_TRACE:
        return this.processTrace(request)
      case HandlerType.ETH_BLOCK:
        return this.processBlock(request)
      case HandlerType.ETH_TRANSACTION:
        return this.processTransaction(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async start(request: StartRequest) {
    for (const instance of request.templateInstances) {
      const template = ProcessorTemplateProcessorState.INSTANCE.getValues()[instance.templateId]
      if (!template) {
        throw new ServerError(Status.INVALID_ARGUMENT, 'Invalid template contract:' + instance)
      }
      if (!instance.contract) {
        throw new ServerError(Status.INVALID_ARGUMENT, 'Contract Empty from:' + instance)
      }
      template.bind({
        name: instance.contract.name,
        address: validateAndNormalizeAddress(instance.contract.address),
        network: Number(instance.contract.chainId),
        startBlock: instance.startBlock,
        endBlock: instance.endBlock,
      })
    }
  }

  stateDiff(config: ProcessConfigResponse): boolean {
    return TemplateInstanceState.INSTANCE.getValues().length !== config.templateInstances.length
  }

  async processLog(request: DataBinding): Promise<ProcessResult> {
    if (!request.data?.ethLog?.log) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Log can't be null")
    }
    const ethLog = request.data.ethLog

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of request.handlerIds) {
      const handler = this.eventHandlers[handlerId]
      promises.push(
        handler(ethLog).catch((e) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing log: ' + JSON.stringify(ethLog.log) + '\n' + errorString(e)
          )
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processTrace(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.ethTrace?.trace) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Trace can't be null")
    }
    const ethTrace = binding.data.ethTrace

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.traceHandlers[handlerId](ethTrace).catch((e) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing trace: ' + JSON.stringify(ethTrace.trace) + '\n' + errorString(e)
          )
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processBlock(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.ethBlock?.block) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Block can't be empty")
    }
    const ethBlock = binding.data.ethBlock

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.blockHandlers[handlerId](ethBlock).catch((e) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing block: ' + ethBlock.block?.number + '\n' + errorString(e)
          )
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processTransaction(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.ethTransaction?.transaction) {
      throw new ServerError(Status.INVALID_ARGUMENT, "transaction can't be null")
    }
    const ethTransaction = binding.data.ethTransaction

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.transactionHandlers[handlerId](ethTransaction).catch((e) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing transaction: ' + JSON.stringify(ethTransaction.transaction) + '\n' + errorString(e)
          )
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }
}

PluginManager.INSTANCE.register(new EthPlugin())
