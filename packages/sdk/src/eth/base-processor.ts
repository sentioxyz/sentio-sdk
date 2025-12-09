import { BaseContract, DeferredTopicFilter, LogDescription, LogParams, TransactionResponseParams } from 'ethers'

import { BoundContractView, ContractContext, ContractView, GlobalContext } from './context.js'
import {
  AddressType,
  Data_EthBlock,
  Data_EthLog,
  Data_EthTrace,
  Data_EthTransaction,
  EthFetchConfig,
  HandleInterval,
  PreparedData,
  PreprocessResult,
  ProcessResult
} from '@sentio/protos'
import { BindOptions, TimeOrBlock } from './bind-options.js'
import { PromiseOrVoid } from '../core/promises.js'
import { ServerError, Status } from 'nice-grpc'
import {
  fixEmptyKey,
  formatEthData,
  RawEvent,
  RichBlock,
  Trace,
  TypedCallTrace,
  TypedEvent,
  validateAndNormalizeAddress
} from './eth.js'
import sha3 from 'js-sha3'
import { ListStateStorage } from '@sentio/runtime'
import { EthChainId } from '@sentio/chain'
import { getHandlerName, proxyHandlers, proxyProcessor } from '../utils/metrics.js'
import { ALL_ADDRESS, HandlerOptions } from '../core/index.js'
import { parseLog, decodeTrace } from './abi-decoder/index.js'

export interface AddressOrTypeEventFilter extends DeferredTopicFilter {
  addressType?: AddressType
  address?: string
}

export const defaultPreprocessHandler = () => (<PreprocessResult>{ ethCallParams: [] }) as any

export class EventsHandler {
  filters: AddressOrTypeEventFilter[]
  handlerName: string
  handler: (event: Data_EthLog) => Promise<ProcessResult>
  preprocessHandler?: (event: Data_EthLog, preprocessStore: { [k: string]: any }) => Promise<PreprocessResult>
  fetchConfig: EthFetchConfig
  partitionHandler?: (event: Data_EthLog) => Promise<string | undefined>
}

export class TraceHandler {
  signatures: string[]
  handlerName: string
  handler: (trace: Data_EthTrace) => Promise<ProcessResult>
  preprocessHandler?: (event: Data_EthTrace, preprocessStore: { [k: string]: any }) => Promise<PreprocessResult>
  fetchConfig: EthFetchConfig
  partitionHandler?: (trace: Data_EthTrace) => Promise<string | undefined>
}

export class BlockHandler {
  blockInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handlerName: string
  handler: (block: Data_EthBlock) => Promise<ProcessResult>
  preprocessHandler?: (event: Data_EthBlock, preprocessStore: { [k: string]: any }) => Promise<PreprocessResult>
  fetchConfig: EthFetchConfig
  partitionHandler?: (block: Data_EthBlock) => Promise<string | undefined>
}

export class TransactionHandler {
  handler: (tx: Data_EthTransaction) => Promise<ProcessResult>
  handlerName: string
  preprocessHandler?: (event: Data_EthTransaction, preprocessStore: { [k: string]: any }) => Promise<PreprocessResult>
  fetchConfig: EthFetchConfig
  partitionHandler?: (tx: Data_EthTransaction) => Promise<string | undefined>
}

class BindInternalOptions {
  address: string
  network: EthChainId
  name: string
  start: TimeOrBlock
  end?: TimeOrBlock
  baseLabels?: { [key: string]: string }
}

export class GlobalProcessorState extends ListStateStorage<GlobalProcessor> {
  static INSTANCE = new GlobalProcessorState()
}

export class GlobalProcessor {
  config: BindInternalOptions
  blockHandlers: BlockHandler[] = proxyHandlers([])
  transactionHandler: TransactionHandler[] = proxyHandlers([])
  traceHandlers: TraceHandler[] = proxyHandlers([])
  eventHandlers: EventsHandler[] = []

  static bind(config: Omit<BindOptions, 'address'>): GlobalProcessor {
    const processor = new GlobalProcessor(config)
    GlobalProcessorState.INSTANCE.addValue(processor)
    return processor
  }

  constructor(config: Omit<BindOptions, 'address'>) {
    this.config = {
      address: ALL_ADDRESS,
      name: config.name || 'Global',
      network: config.network || EthChainId.ETHEREUM,
      start: config.start || {
        block: 0
      },
      end: config.end
    }
    if (config.startBlock) {
      this.config.start = {
        block: config.startBlock
      }
    }
    if (config.endBlock) {
      this.config.end = {
        block: config.endBlock
      }
    }

    return proxyProcessor(this)
  }

  public onBlockInterval(
    handler: (block: RichBlock, ctx: GlobalContext) => PromiseOrVoid,
    blockInterval = 250,
    backfillBlockInterval = 1000,
    handlerOptions?: HandlerOptions<EthFetchConfig, RichBlock>,
    preprocessHandler: (
      block: RichBlock,
      ctx: GlobalContext,
      preprocessStore: {
        [k: string]: any
      }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ): this {
    return this.onInterval(
      handler,
      undefined,
      {
        recentInterval: blockInterval,
        backfillInterval: backfillBlockInterval
      },
      handlerOptions,
      preprocessHandler
    )
  }

  public onTimeInterval(
    handler: (block: RichBlock, ctx: GlobalContext) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    handlerOptions?: HandlerOptions<EthFetchConfig, RichBlock>,
    preprocessHandler: (
      block: RichBlock,
      ctx: GlobalContext,
      preprocessStore: {
        [k: string]: any
      }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ): this {
    return this.onInterval(
      handler,
      { recentInterval: timeIntervalInMinutes, backfillInterval: backfillTimeIntervalInMinutes },
      undefined,
      handlerOptions,
      preprocessHandler
    )
  }

  public getChainId(): EthChainId {
    return this.config.network
  }

  public onInterval(
    handler: (block: RichBlock, ctx: GlobalContext) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    blockInterval: HandleInterval | undefined,
    handlerOptions?: HandlerOptions<EthFetchConfig, RichBlock>,
    preprocessHandler: (
      block: RichBlock,
      ctx: GlobalContext,
      preprocessStore: {
        [k: string]: any
      }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ): this {
    const chainId = this.getChainId()
    if (timeInterval) {
      if (timeInterval.backfillInterval < timeInterval.recentInterval) {
        timeInterval.backfillInterval = timeInterval.recentInterval
      }
    }

    const processor = this
    this.blockHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data: Data_EthBlock) {
        const { block } = formatEthData(data)

        if (!block) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Block is empty')
        }

        const ctx = new GlobalContext(
          chainId,
          ALL_ADDRESS,
          new Date(block.timestamp * 1000),
          block,
          undefined,
          undefined,
          undefined,
          undefined,
          processor.config.baseLabels
        )
        await handler(block, ctx)
        return ctx.stopAndGetResult()
      },
      preprocessHandler: async function (data: Data_EthBlock, preprocessStore: { [k: string]: any }) {
        const { block } = formatEthData(data)

        if (!block) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Block is empty')
        }

        const ctx = new GlobalContext(
          chainId,
          ALL_ADDRESS,
          new Date(block.timestamp * 1000),
          block,
          undefined,
          undefined,
          undefined,
          undefined,
          processor.config.baseLabels
        )
        return preprocessHandler(block, ctx, preprocessStore)
      },
      timeIntervalInMinutes: timeInterval,
      blockInterval: blockInterval,
      fetchConfig: EthFetchConfig.fromPartial(handlerOptions || {}),
      partitionHandler: async (data: Data_EthBlock): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const { block } = formatEthData(data)
          if (!block) return undefined
          return p(block)
        }
        return p
      }
    })
    return this
  }

  public onTransaction(
    handler: (transaction: TransactionResponseParams, ctx: GlobalContext) => PromiseOrVoid,
    handlerOptions?: HandlerOptions<EthFetchConfig, TransactionResponseParams>,
    preprocessHandler: (
      transaction: TransactionResponseParams,
      ctx: GlobalContext,
      preprocessStore: {
        [k: string]: any
      }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ): this {
    const chainId = this.getChainId()
    const processor = this

    this.transactionHandler.push({
      handlerName: getHandlerName(),
      handler: async function (data: Data_EthTransaction) {
        const { trace, block, transaction, transactionReceipt } = formatEthData(data)

        if (!transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'transaction is empty')
        }
        let to = transaction.to
        if (to === trace?.action.from) {
          to = '*'
        }
        const ctx = new GlobalContext(
          chainId,
          to || '*',
          data.timestamp,
          block,
          undefined,
          trace,
          transaction,
          transactionReceipt,
          processor.config.baseLabels
        )
        await handler(transaction, ctx)
        return ctx.stopAndGetResult()
      },
      preprocessHandler: async function (data: Data_EthTransaction, preprocessStore: { [k: string]: any }) {
        const { trace, block, transaction, transactionReceipt } = formatEthData(data)

        if (!transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'transaction is empty')
        }
        let to = transaction.to
        if (to === trace?.action.from) {
          to = '*'
        }
        const ctx = new GlobalContext(
          chainId,
          to || '*',
          data.timestamp,
          block,
          undefined,
          trace,
          transaction,
          transactionReceipt,
          processor.config.baseLabels
        )
        return preprocessHandler(transaction, ctx, preprocessStore)
      },
      fetchConfig: EthFetchConfig.fromPartial(handlerOptions || {}),
      partitionHandler: async (data: Data_EthTransaction): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const { transaction } = formatEthData(data)
          return p(transaction)
        }
        return p
      }
    })
    return this
  }

  public onEvent(
    handler: (rawLog: LogParams, ctx: GlobalContext) => PromiseOrVoid,
    filter?: AddressOrTypeEventFilter | AddressOrTypeEventFilter[],
    handlerOptions?: HandlerOptions<EthFetchConfig, TypedEvent>
  ): this {
    let _filters: AddressOrTypeEventFilter[] = []

    if (Array.isArray(filter)) {
      _filters = filter
    } else if (filter) {
      _filters.push(filter)
    }
    const chainId = this.getChainId()

    this.eventHandlers.push({
      filters: _filters,
      fetchConfig: EthFetchConfig.fromPartial(handlerOptions || {}),
      handlerName: getHandlerName(),
      handler: async function (data) {
        const { log, block, transaction, transactionReceipt } = formatEthData(data)
        if (!log) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Log is empty')
        }
        const ctx = new GlobalContext(
          chainId,
          transaction?.to || '*',
          data.timestamp,
          block,
          log,
          undefined,
          transaction,
          transactionReceipt
        )

        await handler(log, ctx)
        return ctx.stopAndGetResult()
      }
    })
    return this
  }

  public onTrace(
    signatures: string | string[],
    handler: (trace: Trace, ctx: GlobalContext) => PromiseOrVoid,
    handlerOptions?: HandlerOptions<EthFetchConfig, Trace>,
    preprocessHandler: (
      trace: Trace,
      ctx: GlobalContext,
      preprocessStore: {
        [k: string]: any
      }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ): this {
    const chainId = this.getChainId()
    if (typeof signatures === 'string') {
      signatures = [signatures]
    }
    for (const signature of signatures) {
      if (signature.length <= 2) {
        throw new Error('Invalid signature length, must start with 0x')
      }
    }

    const processor = this

    this.traceHandlers.push({
      signatures,
      fetchConfig: EthFetchConfig.fromPartial(handlerOptions || {}),
      handlerName: getHandlerName(),
      handler: async function (data: Data_EthTrace) {
        const { trace, block, transaction, transactionReceipt } = formatEthData(data)

        if (!trace) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'trace is null')
        }
        const ctx = new GlobalContext(
          chainId,
          trace.action.to || '*',
          data.timestamp,
          block,
          undefined,
          trace,
          transaction,
          transactionReceipt,
          processor.config.baseLabels
        )
        await handler(trace, ctx)
        return ctx.stopAndGetResult()
      },
      preprocessHandler: async function (data: Data_EthTrace, preprocessStore: { [k: string]: any }) {
        const { trace, block, transaction, transactionReceipt } = formatEthData(data)

        if (!trace) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'trace is null')
        }
        const ctx = new GlobalContext(
          chainId,
          trace.action.to || '*',
          data.timestamp,
          block,
          undefined,
          trace,
          transaction,
          transactionReceipt,
          processor.config.baseLabels
        )
        return preprocessHandler(trace, ctx, preprocessStore)
      },
      partitionHandler: async (data: Data_EthTrace): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const { trace } = formatEthData(data)
          if (!trace) return undefined
          return p(trace)
        }
        return p
      }
    })
    return this
  }
}

export abstract class BaseProcessor<
  TContract extends BaseContract,
  TBoundContractView extends BoundContractView<TContract, ContractView<TContract>>
> {
  blockHandlers: BlockHandler[] = proxyHandlers([])
  eventHandlers: EventsHandler[] = proxyHandlers([])
  traceHandlers: TraceHandler[] = proxyHandlers([])

  config: BindInternalOptions

  constructor(config: BindOptions) {
    this.config = {
      address: validateAndNormalizeAddress(config.address),
      name: config.name || '',
      network: config.network || EthChainId.ETHEREUM,
      start: config.start || {
        block: 0
      },
      end: config.end,
      baseLabels: config.baseLabels
    }
    if (config.startBlock) {
      this.config.start = {
        block: config.startBlock
      }
    }
    if (config.endBlock) {
      this.config.end = {
        block: config.endBlock
      }
    }

    return proxyProcessor(this)
  }

  protected abstract CreateBoundContractView(): TBoundContractView

  public getChainId(): EthChainId {
    return this.config.network
  }

  public onEvent(
    handler: (event: TypedEvent, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    handlerOptions?: HandlerOptions<EthFetchConfig, TypedEvent>,
    preprocessHandler: (
      event: TypedEvent,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ): this {
    const _filters: DeferredTopicFilter[] = []
    const tmpContract = this.CreateBoundContractView()

    for (const fragment of tmpContract.rawContract.interface.fragments) {
      if (fragment.type === 'event') {
        const filter = tmpContract.rawContract.filters[fragment.format()]
        _filters.push(filter())
      }
    }
    return this.onEthEvent(handler, _filters, handlerOptions, preprocessHandler)
  }

  protected onEthEvent(
    handler: (event: TypedEvent | RawEvent, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    filter: DeferredTopicFilter | DeferredTopicFilter[],
    handlerOptions?: HandlerOptions<EthFetchConfig, TypedEvent>,
    preprocessHandler: (
      event: TypedEvent,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler,
    handlerName = getHandlerName()
  ): this {
    const chainId = this.getChainId()
    let _filters: DeferredTopicFilter[] = []

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    const contractName = this.config.name
    const processor = this
    this.eventHandlers.push({
      filters: _filters,
      fetchConfig: EthFetchConfig.fromPartial(handlerOptions || {}),
      handlerName,
      handler: async function (data: Data_EthLog, preparedData?: PreparedData) {
        const { log, block, transaction, transactionReceipt } = formatEthData(data)
        if (!log) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Log is empty')
        }
        let contractView
        try {
          contractView = processor.CreateBoundContractView()
        } catch (e) {
          throw e
          // console.log(e)
        }
        if (processor.config.address === '*') {
          contractView.address = log.address
        }
        const ctx = new ContractContext<TContract, TBoundContractView>(
          contractName,
          contractView,
          chainId,
          data.timestamp,
          block,
          log,
          undefined,
          transaction,
          transactionReceipt,
          processor.config.baseLabels,
          preparedData
        )
        if (handlerOptions?.skipDecoding) {
          await handler(log, ctx)
          return ctx.stopAndGetResult()
        }
        let parsed: LogDescription | null = null
        try {
          parsed = await getCachedParsedLog(data, processor, log)
        } catch (e) {
          // RangeError data out-of-bounds
          if (e instanceof Error) {
            if (e.message.includes('data out-of-bounds')) {
              console.error("Can't decode", log, 'may because of incompatible ABIs, e.g. string vs indexed string', e)
              return ProcessResult.fromPartial({})
            }
          }
          throw e
        }
        if (parsed) {
          const event: TypedEvent = new TypedEvent(log, parsed.name, fixEmptyKey(parsed))
          await handler(event, ctx)
          return ctx.stopAndGetResult()
        }
        return ProcessResult.fromPartial({})
      },
      preprocessHandler: async function (
        data: Data_EthLog,
        preprocessStore: { [k: string]: any }
      ): Promise<PreprocessResult> {
        const { log, block, transaction, transactionReceipt } = formatEthData(data)
        if (!log) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Log is empty')
        }
        let contractView
        try {
          contractView = processor.CreateBoundContractView()
        } catch (e) {
          throw e
          // console.log(e)
        }
        if (processor.config.address === '*') {
          contractView.address = log.address
        }

        const ctx = new ContractContext<TContract, TBoundContractView>(
          contractName,
          contractView,
          chainId,
          data.timestamp,
          block,
          log,
          undefined,
          transaction,
          transactionReceipt,
          processor.config.baseLabels
        )

        let parsed: LogDescription | null = null
        try {
          parsed = await getCachedParsedLog(data, processor, log)
        } catch (e) {
          // RangeError data out-of-bounds
          if (e instanceof Error) {
            if (e.message.includes('data out-of-bounds')) {
              console.error("Can't decode", log, 'may because of incompatible ABIs, e.g. string vs indexed string', e)
              return PreprocessResult.fromPartial({})
            }
          }
          throw e
        }
        if (parsed) {
          const event: TypedEvent = new TypedEvent(log, parsed.name, fixEmptyKey(parsed))
          return preprocessHandler(event, ctx, preprocessStore)
        }
        return PreprocessResult.fromPartial({})
      },
      partitionHandler: async (data: Data_EthLog): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const { log } = formatEthData(data)
          if (!log) return undefined
          let parsed: LogDescription | null = null
          try {
            parsed = await getCachedParsedLog(data, processor, log)
          } catch (e) {
            return undefined
          }
          if (parsed) {
            const event: TypedEvent = new TypedEvent(log, parsed.name, fixEmptyKey(parsed))
            return p(event)
          }
          return undefined
        }
        return p
      }
    })
    return this
  }

  public onBlockInterval(
    handler: (block: RichBlock, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    blockInterval = 250,
    backfillBlockInterval = 1000,
    handlerOptions?: HandlerOptions<EthFetchConfig, RichBlock>,
    preprocessHandler: (
      block: RichBlock,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ): this {
    return this.onInterval(
      handler,
      undefined,
      {
        recentInterval: blockInterval,
        backfillInterval: backfillBlockInterval
      },
      handlerOptions,
      preprocessHandler
    )
  }

  public onTimeInterval(
    handler: (block: RichBlock, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    handlerOptions?: HandlerOptions<EthFetchConfig, RichBlock>,
    preprocessHandler: (
      block: RichBlock,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ): this {
    return this.onInterval(
      handler,
      { recentInterval: timeIntervalInMinutes, backfillInterval: backfillTimeIntervalInMinutes },
      undefined,
      handlerOptions,
      preprocessHandler
    )
  }

  public onInterval(
    handler: (block: RichBlock, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    blockInterval: HandleInterval | undefined,
    handlerOptions?: HandlerOptions<EthFetchConfig, RichBlock>,
    preprocessHandler: (
      block: RichBlock,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler,
    handlerName = getHandlerName()
  ): this {
    const chainId = this.getChainId()
    const processor = this
    const contractName = this.config.name

    this.blockHandlers.push({
      handlerName,
      handler: async function (data: Data_EthBlock, preparedData?: PreparedData) {
        const { block } = formatEthData(data)

        if (!block) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Block is empty')
        }

        const contractView = processor.CreateBoundContractView()

        const ctx = new ContractContext<TContract, TBoundContractView>(
          contractName,
          contractView,
          chainId,
          new Date(block.timestamp * 1000),
          block,
          undefined,
          undefined,
          undefined,
          undefined,
          processor.config.baseLabels,
          preparedData
        )
        await handler(block, ctx)
        return ctx.stopAndGetResult()
      },
      preprocessHandler: async function (data: Data_EthBlock, preprocessStore: { [k: string]: any }) {
        const { block } = formatEthData(data)

        if (!block) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Block is empty')
        }

        const contractView = processor.CreateBoundContractView()

        const ctx = new ContractContext<TContract, TBoundContractView>(
          contractName,
          contractView,
          chainId,
          new Date(block.timestamp * 1000),
          block,
          undefined,
          undefined,
          undefined,
          undefined,
          processor.config.baseLabels
        )
        return preprocessHandler(block, ctx, preprocessStore)
      },
      timeIntervalInMinutes: timeInterval,
      blockInterval: blockInterval,
      fetchConfig: EthFetchConfig.fromPartial(handlerOptions || {}),
      partitionHandler: async (data: Data_EthBlock): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const { block } = formatEthData(data)
          if (!block) return undefined
          return p(block)
        }
        return p
      }
    })
    return this
  }

  protected onEthTrace(
    signatures: string | string[],
    handler: (trace: TypedCallTrace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    handlerOptions?: HandlerOptions<EthFetchConfig, TypedCallTrace>,
    preprocessHandler: (
      trace: TypedCallTrace,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler,
    handlerName = getHandlerName()
  ): this {
    const chainId = this.getChainId()
    const contractName = this.config.name
    const processor = this
    if (typeof signatures === 'string') {
      signatures = [signatures]
    }

    this.traceHandlers.push({
      signatures,
      fetchConfig: EthFetchConfig.fromPartial(handlerOptions || {}),
      handlerName,
      handler: async function (data: Data_EthTrace, preparedData?: PreparedData) {
        const contractView = processor.CreateBoundContractView()
        const contractInterface = contractView.rawContract.interface
        const { trace, block, transaction, transactionReceipt } = formatEthData(data)
        const sighash = trace?.action.input?.slice(0, 10)
        if (!sighash) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'trace has no sighash')
        }
        const fragment = contractInterface.getFunction(sighash)

        if (!trace || !fragment) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'trace is null')
        }
        const typedTrace = trace as TypedCallTrace
        typedTrace.name = fragment.name
        typedTrace.functionSignature = fragment.format()
        // const trace = data.trace as Trace
        if (!trace?.action.input) {
          return ProcessResult.fromPartial({})
        }
        const traceData = '0x' + trace.action.input.slice(10)
        try {
          typedTrace.args = await decodeTrace(processor, fragment.inputs, traceData)
          // typedTrace.args = contractInterface.getAbiCoder().decode(fragment.inputs, traceData, true)
        } catch (e) {
          if (!trace.error) {
            throw e
          }
          console.error('Failed to decode successful trace', e)
        }
        const ctx = new ContractContext<TContract, TBoundContractView>(
          contractName,
          contractView,
          chainId,
          data.timestamp,
          block,
          undefined,
          trace,
          transaction,
          transactionReceipt,
          processor.config.baseLabels,
          preparedData
        )
        await handler(typedTrace, ctx)
        return ctx.stopAndGetResult()
      },
      preprocessHandler: async function (data: Data_EthTrace, preprocessStore: { [k: string]: any }) {
        const contractView = processor.CreateBoundContractView()
        const contractInterface = contractView.rawContract.interface
        const { trace, block, transaction, transactionReceipt } = formatEthData(data)
        const sighash = trace?.action.input?.slice(0, 10)
        if (!sighash) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'trace has no sighash')
        }
        const fragment = contractInterface.getFunction(sighash)

        if (!trace || !fragment) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'trace is null')
        }
        const typedTrace = trace as TypedCallTrace
        typedTrace.name = fragment.name
        typedTrace.functionSignature = fragment.format()
        // const trace = data.trace as Trace
        if (!trace?.action.input) {
          return PreprocessResult.fromPartial({})
        }
        const traceData = '0x' + trace.action.input.slice(10)
        try {
          typedTrace.args = await decodeTrace(processor, fragment.inputs, traceData)
        } catch (e) {
          if (!trace.error) {
            throw e
          }
          console.error('Failed to decode successful trace', e)
        }
        const ctx = new ContractContext<TContract, TBoundContractView>(
          contractName,
          contractView,
          chainId,
          data.timestamp,
          block,
          undefined,
          trace,
          transaction,
          transactionReceipt,
          processor.config.baseLabels
        )
        return preprocessHandler(typedTrace, ctx, preprocessStore)
      },
      partitionHandler: async (data: Data_EthTrace): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const contractView = processor.CreateBoundContractView()
          const contractInterface = contractView.rawContract.interface
          const { trace } = formatEthData(data)
          if (!trace) return undefined
          const sighash = trace.action.input?.slice(0, 10)
          if (!sighash) return undefined
          const fragment = contractInterface.getFunction(sighash)
          if (!fragment) return undefined
          const typedTrace = trace as TypedCallTrace
          typedTrace.name = fragment.name
          typedTrace.functionSignature = fragment.format()
          if (trace.action.input) {
            const traceData = '0x' + trace.action.input.slice(10)
            try {
              typedTrace.args = await decodeTrace(processor, fragment.inputs, traceData)
            } catch (e) {
              if (!trace.error) {
                throw e
              }
            }
          }
          return p(typedTrace)
        }
        return p
      }
    })
    return this
  }

  public onTrace(
    handler: (event: TypedCallTrace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    handlerOptions?: HandlerOptions<EthFetchConfig, TypedCallTrace>,
    preprocessHandler: (
      trace: TypedCallTrace,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ): this {
    const tmpContract = this.CreateBoundContractView()
    const sighashes = []

    for (const fragment of tmpContract.rawContract.interface.fragments) {
      if (fragment.type === 'function') {
        const signature = fragment.format()
        const test = new TextEncoder().encode(signature)
        const sighash = '0x' + sha3.keccak_256(test).substring(0, 8)
        sighashes.push(sighash)
      }
    }
    return this.onEthTrace(sighashes, handler, handlerOptions, preprocessHandler)
  }
}

// Helper function to get cached or parse log data
async function getCachedParsedLog(data: any, processor: any, log: any): Promise<LogDescription | null> {
  // Check if parsed log is already cached on data object
  if ((data as any).__parsedLog !== undefined) {
    return (data as any).__parsedLog
  }

  try {
    const parsed = await parseLog(processor, log)
    // Cache the parsed result on the data object
    ;(data as any).__parsedLog = parsed
    return parsed
  } catch (e) {
    // Cache the null result to avoid retrying
    ;(data as any).__parsedLog = null
    throw e
  }
}
