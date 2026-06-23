import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import { getProvider } from './provider.js'
import { PartitionHandlerManager } from '../core/index.js'
import {
  AccountConfigSchema,
  ContractConfigSchema,
  DataBinding,
  HandlerType,
  InitResponse,
  LogFilterSchema,
  LogHandlerConfigSchema,
  OnIntervalConfigSchema,
  PreparedData,
  PreprocessResult,
  PreprocessResultSchema,
  ProcessConfigResponse,
  ProcessResult,
  ProcessStreamResponse_Partitions,
  ProcessStreamResponse_PartitionsSchema,
  StartRequest,
  TopicSchema,
  TraceHandlerConfigSchema,
  TransactionHandlerConfigSchema
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { ConnectError, Code } from '@connectrpc/connect'
import { EthProcessorState } from './binds.js'
import { AccountProcessorState } from './account-processor-state.js'
import { ProcessorTemplateProcessorState } from './base-processor-template.js'
import { GlobalProcessorState } from './base-processor.js'
import { validateAndNormalizeAddress } from './eth.js'
import { EthChainId } from '@sentio/chain'
import { EthContext } from './context.js'
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

      const contractConfig = create(ContractConfigSchema, {
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

        contractConfig.intervalConfigs.push(
          create(OnIntervalConfigSchema, {
            slot: 0,
            slotInterval: blockHandler.blockInterval,
            minutes: 0,
            minutesInterval: blockHandler.timeIntervalInMinutes,
            handlerId: handlerId,
            handlerName: blockHandler.handlerName,
            fetchConfig: blockHandler.fetchConfig
          })
        )
      }

      // Step 2. Prepare all trace handlers
      for (const traceHandler of processor.traceHandlers) {
        const handlerId = this.handlerRegister.register(traceHandler.handler, chainId)

        this.partitionManager.registerPartitionHandler(HandlerType.ETH_TRACE, handlerId, traceHandler.partitionHandler)
        for (const signature of traceHandler.signatures) {
          contractConfig.traceConfigs.push(
            create(TraceHandlerConfigSchema, {
              signature: signature,
              handlerId: handlerId,
              handlerName: traceHandler.handlerName,
              fetchConfig: traceHandler.fetchConfig
            })
          )
        }
      }

      // Step 3. Prepare all the event handlers
      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        const handlerId = this.handlerRegister.register(eventsHandler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.ETH_LOG, handlerId, eventsHandler.partitionHandler)
        const logConfig = create(LogHandlerConfigSchema, {
          handlerId: handlerId,
          handlerName: eventsHandler.handlerName,
          filters: [],
          fetchConfig: eventsHandler.fetchConfig
        })

        for (const filter of eventsHandler.filters) {
          const topics = await filter.getTopicFilter()

          // if (!filter.topics) {
          //   throw new ConnectError('Topic should not be null', Code.InvalidArgument)
          // }
          const logFilter = create(LogFilterSchema, {
            addressOrType: contractConfig.contract?.address
              ? { case: 'address', value: validateAndNormalizeAddress(contractConfig.contract.address) }
              : undefined,
            topics: []
          })

          for (const ts of topics) {
            let hashes: string[] = []
            if (Array.isArray(ts)) {
              hashes = hashes.concat(ts)
            } else if (ts) {
              hashes.push(ts)
            }
            logFilter.topics.push(create(TopicSchema, { hashes: hashes }))
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
      let startBlock, endBlock: bigint | undefined
      try {
        const provider = getProvider(chainId)
        startBlock = await timeOrBlockToBlockNumber(provider, processor.config.start)
        endBlock = processor.config.end ? await timeOrBlockToBlockNumber(provider, processor.config.end) : undefined
      } catch (e) {
        console.error('failed to get start/end block', e)
        startBlock = processor.config.start?.block != undefined ? BigInt(processor.config.start.block) : undefined
        endBlock = processor.config.end?.block != undefined ? BigInt(processor.config.end.block) : undefined
      }

      const contractConfig = create(ContractConfigSchema, {
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
        contractConfig.intervalConfigs.push(
          create(OnIntervalConfigSchema, {
            slot: 0,
            slotInterval: blockHandler.blockInterval,
            minutes: 0,
            minutesInterval: blockHandler.timeIntervalInMinutes,
            handlerId: handlerId,
            handlerName: blockHandler.handlerName,
            fetchConfig: blockHandler.fetchConfig
          })
        )
      }

      for (const transactionHandler of processor.transactionHandler) {
        const handlerId = this.handlerRegister.register(transactionHandler.handler, chainId)
        this.partitionManager.registerPartitionHandler(
          HandlerType.ETH_TRANSACTION,
          handlerId,
          transactionHandler.partitionHandler
        )
        contractConfig.transactionConfig.push(
          create(TransactionHandlerConfigSchema, {
            handlerId: handlerId,
            handlerName: transactionHandler.handlerName,
            fetchConfig: transactionHandler.fetchConfig
          })
        )
      }

      for (const traceHandler of processor.traceHandlers) {
        const handlerId = this.handlerRegister.register(traceHandler.handler, chainId)
        for (const signature of traceHandler.signatures) {
          contractConfig.traceConfigs.push(
            create(TraceHandlerConfigSchema, {
              signature: signature,
              handlerId: handlerId,
              handlerName: traceHandler.handlerName,
              fetchConfig: traceHandler.fetchConfig
            })
          )
        }
      }

      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        const handlerId = this.handlerRegister.register(eventsHandler.handler, processor.getChainId())
        const logConfig = create(LogHandlerConfigSchema, {
          handlerId: handlerId,
          handlerName: eventsHandler.handlerName,
          filters: [],
          fetchConfig: eventsHandler.fetchConfig
        })

        if (!eventsHandler.filters || eventsHandler.filters.length === 0) {
          // if no filter, then we assume all logs
          logConfig.filters.push(
            create(LogFilterSchema, {
              topics: []
            })
          )
        } else {
          for (const filter of eventsHandler.filters) {
            const topics = await filter.getTopicFilter()
            // if (!filter.topics) {
            //   throw new ConnectError('Topic should not be null', Code.InvalidArgument)
            // }
            let address = undefined
            if (filter.address) {
              address = filter.address.toString()
            }
            const logFilter = create(LogFilterSchema, {
              addressOrType:
                filter.addressType != undefined
                  ? { case: 'addressType', value: filter.addressType }
                  : address
                    ? { case: 'address', value: validateAndNormalizeAddress(address) }
                    : undefined,
              topics: []
            })

            for (const ts of topics) {
              let hashes: string[] = []
              if (Array.isArray(ts)) {
                hashes = hashes.concat(ts)
              } else if (ts) {
                hashes.push(ts)
              }
              logFilter.topics.push(create(TopicSchema, { hashes: hashes }))
            }
            logConfig.filters.push(logFilter)
          }
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
      const accountConfig = create(AccountConfigSchema, {
        address: validateAndNormalizeAddress(processor.config.address),
        chainId: processor.getChainId().toString(),
        startBlock: processor.config.startBlock ? BigInt(processor.config.startBlock) : 0n
      })
      // TODO add interval
      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        const handlerId = this.handlerRegister.register(eventsHandler.handler, processor.getChainId())
        const logConfig = create(LogHandlerConfigSchema, {
          handlerId: handlerId,
          handlerName: eventsHandler.handlerName,
          filters: [],
          fetchConfig: eventsHandler.fetchConfig
        })

        for (const filter of eventsHandler.filters) {
          const topics = await filter.getTopicFilter()

          let address = undefined
          if (filter.address) {
            address = filter.address.toString()
          }
          const logFilter = create(LogFilterSchema, {
            addressOrType: filter.addressType
              ? { case: 'addressType', value: filter.addressType }
              : address
                ? { case: 'address', value: validateAndNormalizeAddress(address) }
                : undefined,
            topics: []
          })

          for (const ts of topics) {
            let hashes: string[] = []
            if (Array.isArray(ts)) {
              hashes = hashes.concat(ts)
            } else if (ts) {
              hashes.push(ts)
            }
            logFilter.topics.push(create(TopicSchema, { hashes: hashes }))
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
        throw new ConnectError('No handle type registered ' + request.handlerType, Code.InvalidArgument)
    }
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    let data: any
    switch (request.handlerType) {
      case HandlerType.ETH_LOG:
        if (request.data?.value.case !== 'ethLog' || !request.data.value.value) {
          throw new ConnectError("ethLog can't be empty", Code.InvalidArgument)
        }
        data = request.data.value.value
        break
      case HandlerType.ETH_TRACE:
        if (request.data?.value.case !== 'ethTrace' || !request.data.value.value) {
          throw new ConnectError("ethTrace can't be empty", Code.InvalidArgument)
        }
        data = request.data.value.value
        break
      case HandlerType.ETH_BLOCK:
        if (request.data?.value.case !== 'ethBlock' || !request.data.value.value) {
          throw new ConnectError("ethBlock can't be empty", Code.InvalidArgument)
        }
        data = request.data.value.value
        break
      case HandlerType.ETH_TRANSACTION:
        if (request.data?.value.case !== 'ethTransaction' || !request.data.value.value) {
          throw new ConnectError("ethTransaction can't be empty", Code.InvalidArgument)
        }
        data = request.data.value.value
        break
      default:
        throw new ConnectError('No handle type registered ' + request.handlerType, Code.InvalidArgument)
    }
    const partitions = await this.partitionManager.processPartitionForHandlerType(
      request.handlerType,
      request.handlerIds,
      data
    )
    return create(ProcessStreamResponse_PartitionsSchema, {
      partitions
    })
  }

  async start(request: StartRequest) {
    const allowedChainIds = new Set<string>(Object.values(EthChainId))

    for (const instance of request.templateInstances) {
      if (!allowedChainIds.has(instance.contract?.chainId || '')) {
        continue
      }

      const template = ProcessorTemplateProcessorState.INSTANCE.getValues()[instance.templateId]
      if (!template) {
        throw new ConnectError('Invalid template contract:' + instance, Code.InvalidArgument)
      }
      if (!instance.contract) {
        throw new ConnectError('Contract Empty from:' + instance, Code.InvalidArgument)
      }
      const ctx = new NoopContext(instance.contract.chainId as EthChainId)
      template.startInstance(
        {
          name: instance.contract.name,
          address: validateAndNormalizeAddress(instance.contract.address),
          startBlock: instance.startBlock,
          endBlock: instance.endBlock,
          baseLabels: instance.baseLabels as { [key: string]: string } | undefined
        },
        ctx
      )
    }
  }

  async processLog(request: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    if (request.data?.value.case !== 'ethLog' || !request.data.value.value.rawLog) {
      throw new ConnectError("Log can't be null", Code.InvalidArgument)
    }
    const ethLog = request.data.value.value

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of request.handlerIds) {
      const handler = this.handlerRegister.getHandlerById(request.chainId, handlerId)
      const promise = handler(ethLog, preparedData).catch((e: any) => {
        console.error('error processing log: ', e)
        throw new ConnectError('error processing log: ' + ethLog.rawLog + '\n' + errorString(e), Code.Internal)
      })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processTrace(binding: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    if (binding.data?.value.case !== 'ethTrace' || !binding.data.value.value.rawTrace) {
      throw new ConnectError("Trace can't be null", Code.InvalidArgument)
    }
    const ethTrace = binding.data.value.value

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(binding.chainId, handlerId)(ethTrace, preparedData)
        .catch((e: any) => {
          console.error('error processing trace: ', e)
          throw new ConnectError('error processing trace: ' + ethTrace.rawTrace + '\n' + errorString(e), Code.Internal)
        })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processBlock(binding: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    if (binding.data?.value.case !== 'ethBlock' || !binding.data.value.value.rawBlock) {
      throw new ConnectError("Block can't be empty", Code.InvalidArgument)
    }
    const ethBlock = binding.data.value.value

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(binding.chainId, handlerId)(ethBlock, preparedData)
        .catch((e: any) => {
          console.error('error processing block: ', e)
          throw new ConnectError('error processing block: ' + errorString(e), Code.Internal)
        })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processTransaction(binding: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    if (binding.data?.value.case !== 'ethTransaction' || !binding.data.value.value.rawTransaction) {
      throw new ConnectError("transaction can't be null", Code.InvalidArgument)
    }
    const ethTransaction = binding.data.value.value

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(binding.chainId, handlerId)(ethTransaction, preparedData)
        .catch((e: any) => {
          throw new ConnectError(
            'error processing transaction: ' + ethTransaction.rawTransaction + '\n' + errorString(e),
            Code.Internal
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
  const res = create(PreprocessResultSchema, { ethCallParams: [] })
  for (const r of results) {
    res.ethCallParams = res.ethCallParams.concat(r.ethCallParams)
  }
  return res
}
