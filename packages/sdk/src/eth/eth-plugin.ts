import {
  errorString,
  getProvider,
  GLOBAL_CONFIG,
  mergeProcessResults,
  Plugin,
  PluginManager,
  USER_PROCESSOR
} from '@sentio/runtime'
import { PartitionHandlerManager } from '../core/index.js'
import {
  AccountConfig,
  ContractConfig,
  DataBinding,
  HandlerType,
  InitResponse,
  LogFilter,
  LogHandlerConfig,
  PreparedData,
  PreprocessResult,
  ProcessConfigResponse,
  ProcessResult,
  ProcessStreamResponse_Partitions,
  StartRequest
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'
import { EthProcessorState } from './binds.js'
import { AccountProcessorState } from './account-processor-state.js'
import { ProcessorTemplateProcessorState } from './base-processor-template.js'
import { GlobalProcessorState } from './base-processor.js'
import { validateAndNormalizeAddress } from './eth.js'
import { EthChainId } from '@sentio/chain'
import { EthContext } from './context.js'
import { TemplateInstanceState } from '../core/template.js'
import { timeOrBlockToBlockNumber } from '@sentio/sdk/utils'
import { HandlerRegister } from '../core/handler-register.js'

export class EthPlugin extends Plugin {
  name: string = 'EthPlugin'
  handlerRegister = new HandlerRegister()

  partitionManager = new PartitionHandlerManager()

  async init(config: InitResponse): Promise<void> {
    for (const state of [EthProcessorState.INSTANCE, GlobalProcessorState.INSTANCE, AccountProcessorState.INSTANCE]) {
      for (const processor of state.getValues()) {
        const chainId = processor.getChainId()
        config.chainIds.push(chainId)
      }
    }
  }

  async configure(config: ProcessConfigResponse, forChainId?: string) {
    this.handlerRegister.clear(forChainId as EthChainId)

    for (const processor of EthProcessorState.INSTANCE.getValues()) {
      // If server favor incremental update this need to change
      // Start basic config for contract
      const chainId = processor.getChainId()
      // this.processorsByChainId.set(chainId, processor)
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
      const provider = getProvider(chainId)
      const startBlock = await timeOrBlockToBlockNumber(provider, processor.config.start)
      const endBlock = processor.config.end ? await timeOrBlockToBlockNumber(provider, processor.config.end) : undefined

      const contractConfig = ContractConfig.fromPartial({
        processorType: USER_PROCESSOR,
        contract: {
          name: processor.config.name,
          chainId: chainId.toString(),
          address: validateAndNormalizeAddress(processor.config.address),
          abi: ''
        },
        startBlock,
        endBlock
      })

      // Step 1. Prepare all the block handlers
      for (const blockHandler of processor.blockHandlers) {
        const handlerId = this.handlerRegister.register(blockHandler.handler, chainId)

        this.partitionManager.registerPartitionHandler(HandlerType.ETH_BLOCK, handlerId, blockHandler.partitionHandler)
        // TODO wrap the block handler into one

        contractConfig.intervalConfigs.push({
          slot: 0,
          slotInterval: blockHandler.blockInterval,
          minutes: 0,
          minutesInterval: blockHandler.timeIntervalInMinutes,
          handlerId: handlerId,
          handlerName: blockHandler.handlerName,
          fetchConfig: blockHandler.fetchConfig
        })
      }

      // Step 2. Prepare all trace handlers
      for (const traceHandler of processor.traceHandlers) {
        const handlerId = this.handlerRegister.register(traceHandler.handler, chainId)

        this.partitionManager.registerPartitionHandler(HandlerType.ETH_TRACE, handlerId, traceHandler.partitionHandler)
        for (const signature of traceHandler.signatures) {
          contractConfig.traceConfigs.push({
            signature: signature,
            handlerId: handlerId,
            handlerName: traceHandler.handlerName,
            fetchConfig: traceHandler.fetchConfig
          })
        }
      }

      // Step 3. Prepare all the event handlers
      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        const handlerId = this.handlerRegister.register(eventsHandler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.ETH_LOG, handlerId, eventsHandler.partitionHandler)
        const logConfig: LogHandlerConfig = {
          handlerId: handlerId,
          handlerName: eventsHandler.handlerName,
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
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
      const provider = getProvider(chainId)
      const startBlock = await timeOrBlockToBlockNumber(provider, processor.config.start)
      const endBlock = processor.config.end ? await timeOrBlockToBlockNumber(provider, processor.config.end) : undefined

      const contractConfig = ContractConfig.fromPartial({
        processorType: USER_PROCESSOR,
        contract: {
          name: processor.config.name,
          chainId: chainId.toString(),
          address: processor.config.address, // can only be *
          abi: ''
        },
        startBlock,
        endBlock
      })

      for (const blockHandler of processor.blockHandlers) {
        const handlerId = this.handlerRegister.register(blockHandler.handler, chainId)
        contractConfig.intervalConfigs.push({
          slot: 0,
          slotInterval: blockHandler.blockInterval,
          minutes: 0,
          minutesInterval: blockHandler.timeIntervalInMinutes,
          handlerId: handlerId,
          handlerName: blockHandler.handlerName,
          fetchConfig: blockHandler.fetchConfig
        })
      }

      for (const transactionHandler of processor.transactionHandler) {
        const handlerId = this.handlerRegister.register(transactionHandler.handler, chainId)
        this.partitionManager.registerPartitionHandler(
          HandlerType.ETH_TRANSACTION,
          handlerId,
          transactionHandler.partitionHandler
        )
        contractConfig.transactionConfig.push({
          handlerId: handlerId,
          handlerName: transactionHandler.handlerName,
          fetchConfig: transactionHandler.fetchConfig
        })
      }

      for (const traceHandler of processor.traceHandlers) {
        const handlerId = this.handlerRegister.register(traceHandler.handler, chainId)
        for (const signature of traceHandler.signatures) {
          contractConfig.traceConfigs.push({
            signature: signature,
            handlerId: handlerId,
            handlerName: traceHandler.handlerName,
            fetchConfig: traceHandler.fetchConfig
          })
        }
      }

      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        const handlerId = this.handlerRegister.register(eventsHandler.handler, processor.getChainId())
        const logConfig: LogHandlerConfig = {
          handlerId: handlerId,
          handlerName: eventsHandler.handlerName,
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
        contractConfig.logConfigs.push(logConfig)
      }

      config.contractConfigs.push(contractConfig)
    }

    // part 1.b prepare EVM account processors
    for (const processor of AccountProcessorState.INSTANCE.getValues()) {
      if (forChainId !== undefined && forChainId !== processor.getChainId().toString()) {
        continue
      }
      const accountConfig = AccountConfig.fromPartial({
        address: validateAndNormalizeAddress(processor.config.address),
        chainId: processor.getChainId().toString(),
        startBlock: processor.config.startBlock ? BigInt(processor.config.startBlock) : 0n
      })
      // TODO add interval
      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        const handlerId = this.handlerRegister.register(eventsHandler.handler, processor.getChainId())
        const logConfig: LogHandlerConfig = {
          handlerId: handlerId,
          handlerName: eventsHandler.handlerName,
          filters: [],
          fetchConfig: eventsHandler.fetchConfig
        }

        for (const filter of eventsHandler.filters) {
          const topics = await filter.getTopicFilter()

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

    // this.handlers = handlers
    // this.preprocessHandlers = preprocessHandlers
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

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    let data: any
    switch (request.handlerType) {
      case HandlerType.ETH_LOG:
        if (!request.data?.ethLog) {
          throw new ServerError(Status.INVALID_ARGUMENT, "ethLog can't be empty")
        }
        data = request.data.ethLog
        break
      case HandlerType.ETH_TRACE:
        if (!request.data?.ethTrace) {
          throw new ServerError(Status.INVALID_ARGUMENT, "ethTrace can't be empty")
        }
        data = request.data.ethTrace
        break
      case HandlerType.ETH_BLOCK:
        if (!request.data?.ethBlock) {
          throw new ServerError(Status.INVALID_ARGUMENT, "ethBlock can't be empty")
        }
        data = request.data.ethBlock
        break
      case HandlerType.ETH_TRANSACTION:
        if (!request.data?.ethTransaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, "ethTransaction can't be empty")
        }
        data = request.data.ethTransaction
        break
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
    const partitions = await this.partitionManager.processPartitionForHandlerType(
      request.handlerType,
      request.handlerIds,
      data
    )
    return {
      partitions
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

  async processLog(request: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    if (!request.data?.ethLog?.log) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Log can't be null")
    }
    const ethLog = request.data.ethLog

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of request.handlerIds) {
      const handler = this.handlerRegister.getHandlerById(handlerId)
      const promise = handler(ethLog, preparedData).catch((e: any) => {
        console.error('error processing log: ', e)
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
      const promise = this.handlerRegister
        .getHandlerById(handlerId)(ethTrace, preparedData)
        .catch((e: any) => {
          console.error('error processing trace: ', e)
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
      const promise = this.handlerRegister
        .getHandlerById(handlerId)(ethBlock, preparedData)
        .catch((e: any) => {
          console.error('error processing block: ', e)
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
      const promise = this.handlerRegister
        .getHandlerById(handlerId)(ethTransaction, preparedData)
        .catch((e: any) => {
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
