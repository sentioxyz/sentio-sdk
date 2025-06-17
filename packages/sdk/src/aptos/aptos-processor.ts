import { defaultMoveCoder, MoveCoder } from './index.js'

import {
  Event,
  MoveResource,
  UserTransactionResponse,
  EntryFunctionPayloadResponse,
  WriteSetChangeWriteResource
} from '@aptos-labs/ts-sdk'

import { AptosBindOptions, AptosNetwork } from './network.js'
import { AptosContext, AptosResourcesContext, AptosTransactionContext } from './context.js'
import { ListStateStorage } from '@sentio/runtime'
import { MoveFetchConfig, Data_AptResource, HandleInterval, MoveAccountFetchConfig } from '@sentio/protos'
import { ServerError, Status } from 'nice-grpc'
import {
  accountTypeString,
  CallHandler,
  EventFilter,
  EventHandler,
  FunctionNameAndCallFilter,
  parseMoveType,
  ResourceChangeHandler,
  ResourceIntervalHandler,
  TransactionIntervalHandler
} from '../move/index.js'
import { ALL_ADDRESS, Labels, PromiseOrVoid } from '../core/index.js'
import { TypeDescriptor, matchType, NestedDecodedStruct } from '@typemove/move'
import { ResourceChange } from '@typemove/aptos'
import { GeneralTransactionResponse, HandlerOptions } from './models.js'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'
import { AptCall, AptEvent, AptResource } from './data.js'

const DEFAULT_FETCH_CONFIG: MoveFetchConfig = {
  resourceChanges: false,
  allEvents: true,
  inputs: true,
  // for backward compatibility
  supportMultisigFunc: true
}

export const DEFAULT_RESOURCE_FETCH_CONFIG: MoveAccountFetchConfig = {
  owned: true
}

type IndexConfigure = {
  address: string
  network: AptosNetwork
  startVersion: bigint
  endVersion?: bigint
  baseLabels?: Labels
  // endSeqNumber?: Long
}

export class AptosProcessorState extends ListStateStorage<AptosTransactionProcessor<any, any>> {
  static INSTANCE = new AptosProcessorState()
}

export class AptosTransactionProcessor<T extends GeneralTransactionResponse, CT extends AptosTransactionContext<T>> {
  readonly moduleName: string
  config: IndexConfigure
  eventHandlers: EventHandler<AptEvent>[] = []
  callHandlers: CallHandler<AptCall>[] = []
  resourceChangeHandlers: ResourceChangeHandler<AptResource>[] = []
  transactionIntervalHandlers: TransactionIntervalHandler[] = []
  coder: MoveCoder

  constructor(moduleName: string, options: AptosBindOptions) {
    this.moduleName = moduleName
    this.config = configure(options)
    AptosProcessorState.INSTANCE.addValue(this)
    this.coder = defaultMoveCoder(this.config.network)
    // this.loadTypes(this.coder)

    return proxyProcessor(this)
  }

  protected onMoveEvent(
    handler: (event: Event, ctx: AptosContext) => PromiseOrVoid,
    filter: EventFilter | EventFilter[],
    handlerOptions?: HandlerOptions<MoveFetchConfig, Event>
  ): this {
    let _filters: EventFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...handlerOptions })

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const moduleName = this.moduleName

    const processor = this

    this.eventHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data) {
        if (!data.rawTransaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'event is null')
        }
        const txn = data.transaction

        const ctx = new AptosContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          BigInt(txn.version),
          txn,
          data.eventIndex,
          processor.config.baseLabels
        )

        const decoded = await data.decodeEvent(processor.coder)
        await handler(decoded || data.event, ctx)
        return ctx.stopAndGetResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
      partitionHandler: async (data: AptEvent): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const decoded = await data.decodeEvent(processor.coder)
          return p(decoded || data.event)
        }
        return p
      }
    })
    return this
  }

  protected onEntryFunctionCall(
    handler: (call: EntryFunctionPayloadResponse, ctx: AptosContext) => PromiseOrVoid,
    filter: FunctionNameAndCallFilter | FunctionNameAndCallFilter[],
    handlerOptions?: HandlerOptions<MoveFetchConfig, EntryFunctionPayloadResponse>
  ): this {
    let _filters: FunctionNameAndCallFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...handlerOptions })

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const address = this.config.address
    // const moduleName = this.moduleName
    const processor = this

    this.callHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data) {
        if (!data.rawTransaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'call is null')
        }
        const tx = data.transaction

        const ctx = new AptosContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          BigInt(tx.version),
          tx,
          0,
          processor.config.baseLabels
        )
        if (tx) {
          const decoded = await data.decodeCall(processor.coder)
          await handler(decoded, ctx)
        }
        return ctx.stopAndGetResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
      partitionHandler: async (data: AptCall): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const decoded = await data.decodeCall(processor.coder)
          return p(decoded)
        }
        return p
      }
    })
    return this
  }

  public onTransaction(
    handler: (transaction: UserTransactionResponse, ctx: AptosContext) => PromiseOrVoid,
    transactionFilter?: {
      includeFailed?: boolean
      sender?: string
    },
    handleOptions?: HandlerOptions<MoveFetchConfig, UserTransactionResponse>
  ): this {
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...handleOptions })

    const processor = this
    const filter: FunctionNameAndCallFilter = { function: '', includeFailed: transactionFilter?.includeFailed }
    if (transactionFilter?.sender) {
      filter.fromAndToAddress = {
        from: transactionFilter.sender,
        to: ''
      }
    }

    this.callHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data) {
        if (!data.rawTransaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'call is null')
        }
        const call = data.transaction
        const ctx = new AptosContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          BigInt(call.version),
          call,
          0,
          processor.config.baseLabels
        )
        await handler(call, ctx)
        return ctx.stopAndGetResult()
      },
      filters: [filter],
      fetchConfig: _fetchConfig,
      partitionHandler: async (data: AptCall): Promise<string | undefined> => {
        const p = handleOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          return p(data.transaction)
        }
        return p
      }
    })
    return this
  }

  public onEvent(
    handler: (event: Event, ctx: AptosContext) => void,
    handlerOptions?: HandlerOptions<MoveFetchConfig, Event>
  ): this {
    this.onMoveEvent(handler, { type: '' }, handlerOptions)
    return this
  }

  public onResourceChange<T>(
    handler: (changes: ResourceChange<T>[], ctx: AptosResourcesContext) => PromiseOrVoid,
    typeDesc: TypeDescriptor<T> | string,
    handlerOptions?: HandlerOptions<object, ResourceChange<T>[]>
  ): this {
    if (typeof typeDesc === 'string') {
      typeDesc = parseMoveType(typeDesc)
    }

    const hasAny = typeDesc.existAnyType()

    const processor = this
    this.resourceChangeHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data) {
        if (!data.rawResources || !data.version) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'resource is null')
        }
        const aptResource = new AptResource(data)
        const timestamp = Number(data.timestampMicros)
        const ctx = new AptosResourcesContext(
          processor.config.network,
          processor.config.address,
          data.version,
          timestamp,
          processor.config.baseLabels
        )
        let resources = await aptResource.decodeResources<T>(processor.coder)

        if (hasAny) {
          resources = resources.filter((r) => {
            const rt = parseMoveType(r.type)
            return matchType(typeDesc, rt)
          })
        }

        if (resources.length > 0) {
          await handler(resources, ctx)
        }
        return ctx.stopAndGetResult()
      },
      type: hasAny ? typeDesc.qname : typeDesc.getNormalizedSignature(),
      partitionHandler: async (data): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const resources = await data.decodeResources<T>(processor.coder)
          return p(resources)
        }
        return p
      }
    })
    return this
  }

  protected onInterval(
    handler: (transaction: T, ctx: CT) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    versionInterval: HandleInterval | undefined,
    handlerOptions?: HandlerOptions<MoveFetchConfig, T>
  ): this {
    const processor = this
    this.transactionIntervalHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data) {
        if (!data.rawTransaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'call is null')
        }
        const transaction = JSON.parse(data.rawTransaction) as T
        const timestampMicros = BigInt(transaction.timestamp)
        if (timestampMicros > Number.MAX_SAFE_INTEGER) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'timestamp is too large')
        }

        const ctx = new AptosTransactionContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          BigInt(transaction.version),
          transaction,
          0,
          processor.config.baseLabels
        )
        await handler(transaction, ctx as CT)
        return ctx.stopAndGetResult()
      },
      timeIntervalInMinutes: timeInterval,
      versionInterval: versionInterval,
      fetchConfig: { ...DEFAULT_FETCH_CONFIG, ...handlerOptions }
    })
    return this
  }

  public onTimeInterval(
    handler: (transaction: T, ctx: CT) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    handlerOptions?: HandlerOptions<MoveFetchConfig, T>
  ): this {
    return this.onInterval(
      handler,
      {
        recentInterval: timeIntervalInMinutes,
        backfillInterval: backfillTimeIntervalInMinutes
      },
      undefined,
      handlerOptions
    )
  }

  public onVersionInterval(
    handler: (transaction: T, context: CT) => PromiseOrVoid,
    versionInterval = 100000,
    backfillVersionInterval = 400000,
    handlerOptions?: HandlerOptions<MoveFetchConfig, T>
  ): this {
    return this.onInterval(
      handler,
      undefined,
      { recentInterval: versionInterval, backfillInterval: backfillVersionInterval },
      handlerOptions
    )
  }

  getChainId(): string {
    return this.config.network
  }
}

export class AptosBaseProcessor extends AptosTransactionProcessor<UserTransactionResponse, AptosContext> {}

export class AptosModulesProcessor extends AptosTransactionProcessor<
  GeneralTransactionResponse,
  AptosTransactionContext<GeneralTransactionResponse>
> {
  private constructor(options: AptosBindOptions) {
    super(ALL_ADDRESS, options)
    return proxyProcessor(this)
  }

  static bind(options: AptosBindOptions): AptosModulesProcessor {
    return new AptosModulesProcessor(options)
  }
}

export class AptosGlobalProcessor {
  private baseProcessor

  private constructor(options: AptosBindOptions) {
    this.baseProcessor = new AptosTransactionProcessor('*', options)
    return proxyProcessor(this)
  }

  static bind(options: AptosBindOptions): AptosGlobalProcessor {
    return new AptosGlobalProcessor(options)
  }

  public onTransaction(
    handler: (transaction: UserTransactionResponse, ctx: AptosContext) => PromiseOrVoid,
    transactionFilter?: {
      includeFailed?: boolean
      sender?: string
    },
    fetchConfig?: Partial<MoveFetchConfig>
  ): this {
    this.baseProcessor.onTransaction(handler, transactionFilter, fetchConfig)
    return this
  }

  public onTimeInterval(
    handler: (
      transaction: GeneralTransactionResponse,
      ctx: AptosTransactionContext<GeneralTransactionResponse>
    ) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    handlerOptions?: HandlerOptions<MoveFetchConfig, GeneralTransactionResponse>
  ): this {
    this.baseProcessor.onTimeInterval(handler, timeIntervalInMinutes, backfillTimeIntervalInMinutes, handlerOptions)
    return this
  }

  public onVersionInterval(
    handler: (
      transaction: GeneralTransactionResponse,
      ctx: AptosTransactionContext<GeneralTransactionResponse>
    ) => PromiseOrVoid,
    versionInterval = 100000,
    backfillVersionInterval = 400000,
    handlerOptions?: HandlerOptions<MoveFetchConfig, GeneralTransactionResponse>
  ): this {
    this.baseProcessor.onVersionInterval(handler, versionInterval, backfillVersionInterval, handlerOptions)
    return this
  }
}

export class AptosResourceProcessorState extends ListStateStorage<AptosResourcesProcessor> {
  static INSTANCE = new AptosResourceProcessorState()
}

export class AptosResourcesProcessor {
  config: IndexConfigure

  resourceIntervalHandlers: ResourceIntervalHandler[] = []

  static bind(options: AptosBindOptions): AptosResourcesProcessor {
    return new AptosResourcesProcessor(options)
  }

  protected constructor(options: AptosBindOptions) {
    this.config = configure(options)
    AptosResourceProcessorState.INSTANCE.addValue(this)

    return proxyProcessor(this)
  }

  getChainId(): string {
    return this.config.network
  }

  onInterval(
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    versionInterval: HandleInterval | undefined,
    type: string | undefined,
    handlerOptions?: HandlerOptions<MoveAccountFetchConfig, MoveResource[]>,
    handlerName = getHandlerName()
  ): this {
    const processor = this
    this.resourceIntervalHandlers.push({
      handlerName,
      handler: async function (data) {
        if (data.timestampMicros > Number.MAX_SAFE_INTEGER) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'timestamp is too large')
        }
        const aptResource = new AptResource(data)
        const timestamp = Number(data.timestampMicros)

        const ctx = new AptosResourcesContext(
          processor.config.network,
          processor.config.address,
          data.version,
          timestamp,
          processor.config.baseLabels
        )
        await handler(aptResource.resources, ctx)
        return ctx.stopAndGetResult()
      },
      timeIntervalInMinutes: timeInterval,
      versionInterval: versionInterval,
      type: type,
      fetchConfig: { ...DEFAULT_RESOURCE_FETCH_CONFIG, ...handlerOptions },
      partitionHandler: async (data: Data_AptResource): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const aptResource = new AptResource(data)
          return p(aptResource.resources)
        }
        return p
      }
    })
    return this
  }

  public onTimeInterval(
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    type?: string,
    handlerOptions?: HandlerOptions<MoveAccountFetchConfig, MoveResource[]>
  ): this {
    return this.onInterval(
      handler,
      {
        recentInterval: timeIntervalInMinutes,
        backfillInterval: backfillTimeIntervalInMinutes
      },
      undefined,
      type,
      handlerOptions
    )
  }

  public onVersionInterval(
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => PromiseOrVoid,
    versionInterval = 100000,
    backfillVersionInterval = 400000,
    typePrefix?: string,
    handlerOptions?: HandlerOptions<MoveAccountFetchConfig, MoveResource[]>
  ): this {
    return this.onInterval(
      handler,
      undefined,
      { recentInterval: versionInterval, backfillInterval: backfillVersionInterval },
      typePrefix,
      handlerOptions
    )
  }

  public onResourceChange<T>(
    handler: (changes: ResourceChange<T>[], ctx: AptosResourcesContext) => PromiseOrVoid,
    typeDesc: TypeDescriptor<T> | string
  ): this {
    if (typeof typeDesc === 'string') {
      typeDesc = parseMoveType(typeDesc)
    }

    const hasAny = typeDesc.existAnyType()

    const processor = this
    this.resourceIntervalHandlers.push({
      fetchConfig: DEFAULT_RESOURCE_FETCH_CONFIG,
      handlerName: getHandlerName(),
      handler: async function (data) {
        const timestamp = Number(data.timestampMicros)

        if (!data.rawResources || !data.version) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'resource is null')
        }
        const aptResource = new AptResource(data)
        const ctx = new AptosResourcesContext(
          processor.config.network,
          processor.config.address,
          data.version,
          timestamp,
          processor.config.baseLabels
        )

        let resources = (await aptResource.decodeResources<T>(ctx.coder)) as NestedDecodedStruct<
          MoveResource,
          WriteSetChangeWriteResource,
          T
        >[]

        if (hasAny) {
          resources = resources.filter((r) => {
            const rt = parseMoveType(r.data.type)
            return matchType(typeDesc, rt)
          })
        }

        if (resources.length > 0) {
          await handler(resources, ctx)
        }
        return ctx.stopAndGetResult()
      },
      type: hasAny ? typeDesc.qname : typeDesc.getNormalizedSignature()
    })
    return this
  }
}

function configure(options: AptosBindOptions): IndexConfigure {
  let startVersion = 0n
  if (options.startVersion !== undefined) {
    if (typeof options.startVersion === 'number') {
      startVersion = BigInt(options.startVersion)
    } else {
      startVersion = options.startVersion
    }
  }

  return {
    startVersion: startVersion,
    endVersion: options.endVersion ? BigInt(options.endVersion) : undefined,
    address: options.address === ALL_ADDRESS ? ALL_ADDRESS : accountTypeString(options.address), // aptos don't use address string in api, so only use type string
    network: options.network || AptosNetwork.MAIN_NET,
    baseLabels: options.baseLabels
  }
}
