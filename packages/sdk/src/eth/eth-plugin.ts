import { errorString, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR, GLOBAL_CONFIG } from '@sentio/runtime'
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
  PreparedData,
  PreprocessResult,
  ProcessConfigResponse,
  ProcessResult,
  StartRequest
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'
import { EthProcessorState } from './binds.js'
import { AccountProcessorState } from './account-processor-state.js'
import { ProcessorTemplateProcessorState } from './base-processor-template.js'
import { defaultPreprocessHandler, GlobalProcessorState } from './base-processor.js'
import { validateAndNormalizeAddress } from './eth.js'
import { EthChainId } from '@sentio/chain'
import { EthContext } from './context.js'
import { TemplateInstanceState } from '../core/template.js'

interface Handlers {
  eventHandlers: ((event: Data_EthLog, preparedData?: PreparedData) => Promise<ProcessResult>)[]
  traceHandlers: ((trace: Data_EthTrace, preparedData?: PreparedData) => Promise<ProcessResult>)[]
  blockHandlers: ((block: Data_EthBlock, preparedData?: PreparedData) => Promise<ProcessResult>)[]
  transactionHandlers: ((trace: Data_EthTransaction, preparedData?: PreparedData) => Promise<ProcessResult>)[]
}

interface PreprocessHandlers {
  eventHandlers: ((event: Data_EthLog) => Promise<PreprocessResult>)[]
  traceHandlers: ((trace: Data_EthTrace) => Promise<PreprocessResult>)[]
  blockHandlers: ((block: Data_EthBlock) => Promise<PreprocessResult>)[]
  transactionHandlers: ((txn: Data_EthTransaction) => Promise<PreprocessResult>)[]
}

export class EthPlugin extends Plugin {
  name: string = 'EthPlugin'
  handlers: Handlers = {
    blockHandlers: [],
    eventHandlers: [],
    traceHandlers: [],
    transactionHandlers: []
  }
  preprocessHandlers: PreprocessHandlers = {
    blockHandlers: [],
    eventHandlers: [],
    traceHandlers: [],
    transactionHandlers: []
  }

  async configure(config: ProcessConfigResponse) {
    const handlers: Handlers = {
      blockHandlers: [],
      eventHandlers: [],
      traceHandlers: [],
      transactionHandlers: []
    }
    const preprocessHandlers: PreprocessHandlers = {
      blockHandlers: [],
      eventHandlers: [],
      traceHandlers: [],
      transactionHandlers: []
    }

    for (const processor of EthProcessorState.INSTANCE.getValues()) {
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
          abi: ''
        },
        startBlock: processor.config.startBlock,
        endBlock: processor.config.endBlock
      })

      // Step 1. Prepare all the block handlers
      for (const blockHandler of processor.blockHandlers) {
        preprocessHandlers.blockHandlers.push(blockHandler.preprocessHandler ?? defaultPreprocessHandler)
        const handlerId = handlers.blockHandlers.push(blockHandler.handler) - 1
        // TODO wrap the block handler into one

        contractConfig.intervalConfigs.push({
          slot: 0,
          slotInterval: blockHandler.blockInterval,
          minutes: 0,
          minutesInterval: blockHandler.timeIntervalInMinutes,
          handlerId: handlerId,
          fetchConfig: blockHandler.fetchConfig
        })
      }

      // Step 2. Prepare all trace handlers
      for (const traceHandler of processor.traceHandlers) {
        preprocessHandlers.traceHandlers.push(traceHandler.preprocessHandler ?? defaultPreprocessHandler)
        const handlerId = handlers.traceHandlers.push(traceHandler.handler) - 1
        for (const signature of traceHandler.signatures) {
          contractConfig.traceConfigs.push({
            signature: signature,
            handlerId: handlerId,
            fetchConfig: traceHandler.fetchConfig
          })
        }
      }

      // Step 3. Prepare all the event handlers
      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        preprocessHandlers.eventHandlers.push(eventsHandler.preprocessHandler ?? defaultPreprocessHandler)
        const handlerId = handlers.eventHandlers.push(eventsHandler.handler) - 1
        const logConfig: LogHandlerConfig = {
          handlerId: handlerId,
          filters: [],
          fetchConfig: eventsHandler.fetchConfig
        }

        for (const filter of eventsHandler.filters) {
          const topics = await filter.getTopicFilter()

          // if (!filter.topics) {
          //   throw new ServerError(Status.INVALID_ARGUMENT, 'Topic should not be null')
          // }
          const logFilter: LogFilter = {
            addressType: undefined,
            address: contractConfig.contract?.address && validateAndNormalizeAddress(contractConfig.contract.address),
            topics: []
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
          abi: ''
        },
        startBlock: processor.config.startBlock,
        endBlock: processor.config.endBlock
      })

      for (const blockHandler of processor.blockHandlers) {
        const handlerId = handlers.blockHandlers.push(blockHandler.handler) - 1
        contractConfig.intervalConfigs.push({
          slot: 0,
          slotInterval: blockHandler.blockInterval,
          minutes: 0,
          minutesInterval: blockHandler.timeIntervalInMinutes,
          handlerId: handlerId,
          fetchConfig: blockHandler.fetchConfig
        })
      }

      for (const transactionHandler of processor.transactionHandler) {
        const handlerId = handlers.transactionHandlers.push(transactionHandler.handler) - 1
        contractConfig.transactionConfig.push({
          handlerId: handlerId,
          fetchConfig: transactionHandler.fetchConfig
        })
      }

      for (const traceHandler of processor.traceHandlers) {
        const handlerId = handlers.traceHandlers.push(traceHandler.handler) - 1
        for (const signature of traceHandler.signatures) {
          contractConfig.traceConfigs.push({
            signature: signature,
            handlerId: handlerId,
            fetchConfig: traceHandler.fetchConfig
          })
        }
      }
      config.contractConfigs.push(contractConfig)
    }

    // part 1.b prepare EVM account processors
    for (const processor of AccountProcessorState.INSTANCE.getValues()) {
      const accountConfig = AccountConfig.fromPartial({
        address: validateAndNormalizeAddress(processor.config.address),
        chainId: processor.getChainId().toString(),
        startBlock: processor.config.startBlock ? BigInt(processor.config.startBlock) : 0n
      })
      // TODO add interval
      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        preprocessHandlers.eventHandlers.push(eventsHandler.preprocessHandler ?? defaultPreprocessHandler)
        const handlerId = handlers.eventHandlers.push(eventsHandler.handler) - 1
        const logConfig: LogHandlerConfig = {
          handlerId: handlerId,
          filters: [],
          fetchConfig: eventsHandler.fetchConfig
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
            topics: []
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

    this.handlers = handlers
    this.preprocessHandlers = preprocessHandlers
  }

  supportedHandlers = [HandlerType.ETH_LOG, HandlerType.ETH_BLOCK, HandlerType.ETH_TRACE, HandlerType.ETH_TRANSACTION]

  processBinding(request: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    // return Promise.resolve(undefined);
    switch (request.handlerType) {
      case HandlerType.ETH_LOG:
        return this.processLog(request, preparedData)
      case HandlerType.ETH_TRACE:
        return this.processTrace(request, preparedData)
      case HandlerType.ETH_BLOCK:
        return this.processBlock(request, preparedData)
      case HandlerType.ETH_TRANSACTION:
        return this.processTransaction(request, preparedData)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  preprocessBinding(request: DataBinding): Promise<PreprocessResult> {
    switch (request.handlerType) {
      case HandlerType.ETH_LOG:
        return this.preprocessLog(request)
      case HandlerType.ETH_TRACE:
        return this.preprocessTrace(request)
      case HandlerType.ETH_BLOCK:
        return this.preprocessBlock(request)
      case HandlerType.ETH_TRANSACTION:
        return this.preprocessTransaction(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async start(request: StartRequest) {
    const allowedChainIds = new Set<string>(Object.values(EthChainId))

    for (const instance of request.templateInstances) {
      if (!allowedChainIds.has(instance.contract?.chainId || '')) {
        continue
      }

      const template = ProcessorTemplateProcessorState.INSTANCE.getValues()[instance.templateId]
      if (!template) {
        throw new ServerError(Status.INVALID_ARGUMENT, 'Invalid template contract:' + instance)
      }
      if (!instance.contract) {
        throw new ServerError(Status.INVALID_ARGUMENT, 'Contract Empty from:' + instance)
      }
      const ctx = new NoopContext(instance.contract.chainId as EthChainId)
      template.bind(
        {
          name: instance.contract.name,
          address: validateAndNormalizeAddress(instance.contract.address),
          startBlock: instance.startBlock,
          endBlock: instance.endBlock,
          baseLabels: instance.baseLabels
        },
        ctx
      )
    }
  }

  stateDiff(config: ProcessConfigResponse): boolean {
    return TemplateInstanceState.INSTANCE.getValues().length !== config.templateInstances.length
  }

  async preprocessLog(request: DataBinding): Promise<PreprocessResult> {
    if (!request.data?.ethLog?.log) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Log can't be null")
    }
    const ethLog = request.data.ethLog

    const promises: Promise<PreprocessResult>[] = []
    for (const handlerId of request.handlerIds) {
      const handler = this.preprocessHandlers.eventHandlers[handlerId]
      const promise = handler(ethLog).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing log: ' + JSON.stringify(ethLog.log) + '\n' + errorString(e)
        )
      })
      promises.push(promise)
    }
    return mergePreprocessResults(await Promise.all(promises))
  }

  async preprocessTrace(binding: DataBinding): Promise<PreprocessResult> {
    if (!binding.data?.ethTrace?.trace) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Trace can't be null")
    }
    const ethTrace = binding.data.ethTrace

    const promises: Promise<PreprocessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.preprocessHandlers.traceHandlers[handlerId](ethTrace).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing trace: ' + JSON.stringify(ethTrace.trace) + '\n' + errorString(e)
        )
      })
      promises.push(promise)
    }
    return mergePreprocessResults(await Promise.all(promises))
  }

  async preprocessBlock(binding: DataBinding): Promise<PreprocessResult> {
    if (!binding.data?.ethBlock?.block) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Block can't be empty")
    }
    const ethBlock = binding.data.ethBlock

    const promises: Promise<PreprocessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.preprocessHandlers.blockHandlers[handlerId](ethBlock).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing block: ' + ethBlock.block?.number + '\n' + errorString(e)
        )
      })
      promises.push(promise)
    }
    return mergePreprocessResults(await Promise.all(promises))
  }

  async preprocessTransaction(binding: DataBinding): Promise<PreprocessResult> {
    if (!binding.data?.ethTransaction?.transaction) {
      throw new ServerError(Status.INVALID_ARGUMENT, "transaction can't be null")
    }
    const ethTransaction = binding.data.ethTransaction

    const promises: Promise<PreprocessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.preprocessHandlers.transactionHandlers[handlerId](ethTransaction).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing transaction: ' + JSON.stringify(ethTransaction.transaction) + '\n' + errorString(e)
        )
      })
      promises.push(promise)
    }
    return mergePreprocessResults(await Promise.all(promises))
  }

  async processLog(request: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    if (!request.data?.ethLog?.log) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Log can't be null")
    }
    const ethLog = request.data.ethLog

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of request.handlerIds) {
      const handler = this.handlers.eventHandlers[handlerId]
      const promise = handler(ethLog).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing log: ' + JSON.stringify(ethLog.log) + '\n' + errorString(e)
        )
      })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processTrace(binding: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    if (!binding.data?.ethTrace?.trace) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Trace can't be null")
    }
    const ethTrace = binding.data.ethTrace

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.traceHandlers[handlerId](ethTrace).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing trace: ' + JSON.stringify(ethTrace.trace) + '\n' + errorString(e)
        )
      })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processBlock(binding: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    if (!binding.data?.ethBlock?.block) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Block can't be empty")
    }
    const ethBlock = binding.data.ethBlock

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.blockHandlers[handlerId](ethBlock).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing block: ' + ethBlock.block?.number + '\n' + errorString(e)
        )
      })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processTransaction(binding: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    if (!binding.data?.ethTransaction?.transaction) {
      throw new ServerError(Status.INVALID_ARGUMENT, "transaction can't be null")
    }
    const ethTransaction = binding.data.ethTransaction

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.transactionHandlers[handlerId](ethTransaction).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing transaction: ' + JSON.stringify(ethTransaction.transaction) + '\n' + errorString(e)
        )
      })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }
}

PluginManager.INSTANCE.register(new EthPlugin())

class NoopContext extends EthContext {
  public constructor(chainId: EthChainId) {
    super(chainId, '')
  }

  protected getContractName(): string {
    return ''
  }
}

function mergePreprocessResults(results: PreprocessResult[]): PreprocessResult {
  const res: PreprocessResult = { ethCallParams: [] }
  for (const r of results) {
    res.ethCallParams = res.ethCallParams.concat(r.ethCallParams)
  }
  return res
}
