import {
  type Data_SuiCall,
  type Data_SuiEvent,
  type Data_SuiObjectChange,
  type MoveFetchConfig,
  MoveFetchConfigSchema,
  timestampDate
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { ListStateStorage } from '@sentio/runtime'
import { SuiNetwork } from './network.js'
import { ConnectError, Code } from '@connectrpc/connect'
import { SuiContext, SuiObjectChangeContext } from './context.js'
import type { GrpcTypes } from '@mysten/sui/grpc'
import type { SuiClientTypes } from '@mysten/sui/client'
import type { SuiEventInput } from '@typemove/sui'
import {
  accountAddressString,
  CallHandler,
  EventFilter,
  EventHandler,
  FunctionNameAndCallFilter,
  ObjectChangeHandler,
  SPLITTER,
  TransactionFilter
} from '../move/index.js'
import { getMoveCalls, getProgrammableTransaction } from './utils.js'
import { defaultMoveCoder, MoveCoder } from './index.js'
import { ALL_ADDRESS, Labels, PromiseOrVoid } from '../core/index.js'
import { Required } from 'utility-types'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'
import { HandlerOptions } from './models.js'
import { toSuiClientChangedObjects, toSuiClientEvent } from './to-client-types.js'

export const DEFAULT_FETCH_CONFIG: MoveFetchConfig = create(MoveFetchConfigSchema, {
  resourceChanges: false,
  allEvents: true,
  inputs: true
})

export type IndexConfigure = Required<SuiBindOptions, 'startCheckpoint' | 'network'>

export function configure(options: SuiBindOptions): IndexConfigure {
  return {
    startCheckpoint: options.startCheckpoint || 0n,
    endCheckpoint: options.endCheckpoint,
    address: options.address === ALL_ADDRESS ? ALL_ADDRESS : accountAddressString(options.address),
    network: options.network || SuiNetwork.MAIN_NET,
    baseLabels: options.baseLabels
  }
}

export interface SuiBindOptions {
  address: string
  network?: SuiNetwork
  startCheckpoint?: bigint
  endCheckpoint?: bigint
  baseLabels?: Labels
}

export class SuiProcessorState extends ListStateStorage<SuiBaseProcessor> {
  static INSTANCE = new SuiProcessorState()
}

export class SuiBaseProcessor {
  readonly moduleName: string
  config: IndexConfigure

  eventHandlers: EventHandler<Data_SuiEvent>[] = []
  callHandlers: CallHandler<Data_SuiCall>[] = []
  objectChangeHandlers: ObjectChangeHandler<Data_SuiObjectChange>[] = []

  coder: MoveCoder

  constructor(name: string, options: SuiBindOptions) {
    this.moduleName = name
    this.config = configure(options)
    SuiProcessorState.INSTANCE.addValue(this)
    this.coder = defaultMoveCoder(this.config.network)

    return proxyProcessor(this)
  }

  getChainId(): string {
    return this.config.network
  }

  protected onMoveEvent<T extends SuiEventInput = SuiEventInput>(
    handler: (event: T, ctx: SuiContext) => PromiseOrVoid,
    filter: EventFilter | EventFilter[],
    handlerOptions?: HandlerOptions<MoveFetchConfig, T>
  ): SuiBaseProcessor {
    let _filters: EventFilter[] = []
    const _fetchConfig = create(MoveFetchConfigSchema, { ...DEFAULT_FETCH_CONFIG, ...handlerOptions })

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const address = this.config.address
    // const moduleName = this.moduleName

    const processor = this

    this.eventHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data) {
        if (!data.rawTransaction) {
          throw new ConnectError('event is null', Code.InvalidArgument)
        }
        const txn = JSON.parse(data.rawTransaction) as GrpcTypes.ExecutedTransaction

        const evt = toSuiClientEvent(JSON.parse(data.rawEvent))
        // gRPC events carry no on-chain sequence; the driver supplies the event's
        // index within the tx via the eventSeq field (mirrors json-rpc's id.eventSeq).
        const idx = data.eventSeq

        const ctx = new SuiContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          data.timestamp ? timestampDate(data.timestamp) : new Date(0),
          data.slot,
          txn,
          idx,
          processor.config.baseLabels
        )

        const decoded = await processor.coder.decodeEvent<T>(evt)
        await handler((decoded || evt) as T, ctx)

        return ctx.stopAndGetResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
      partitionHandler: async (data: Data_SuiEvent): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const evt = toSuiClientEvent(JSON.parse(data.rawEvent))
          const decoded = await processor.coder.decodeEvent<any>(evt)
          return p((decoded || evt) as T)
        }
        return p
      }
    })
    return this
  }

  protected onEntryFunctionCall<T extends GrpcTypes.MoveCall = GrpcTypes.MoveCall>(
    handler: (call: T, ctx: SuiContext) => PromiseOrVoid,
    filter: FunctionNameAndCallFilter | FunctionNameAndCallFilter[],
    handlerOptions?: HandlerOptions<MoveFetchConfig, T>
  ): SuiBaseProcessor {
    let _filters: FunctionNameAndCallFilter[] = []
    const _fetchConfig = create(MoveFetchConfigSchema, { ...DEFAULT_FETCH_CONFIG, ...handlerOptions })

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    const processor = this
    const allFunctionType = new Set(_filters.map((f) => f.function))

    this.callHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data) {
        if (!data.rawTransaction) {
          throw new ConnectError('call is null', Code.InvalidArgument)
        }
        const tx = JSON.parse(data.rawTransaction) as GrpcTypes.ExecutedTransaction

        const ctx = new SuiContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          data.timestamp ? timestampDate(data.timestamp) : new Date(0),
          data.slot,
          tx,
          0,
          processor.config.baseLabels
        )
        if (tx) {
          const calls = getMoveCalls(tx)
          const programmableTx = getProgrammableTransaction(tx)
          if (!programmableTx) {
            throw new ConnectError('Unexpected getTransactionKind get empty', Code.InvalidArgument)
          }

          // TODO potential pass index
          for (const call of calls) {
            const functionType = [call.module, call.function].join(SPLITTER)
            if (!allFunctionType.has(functionType)) {
              continue
            }

            // TODO maybe do in parallel
            const decoded = await processor.coder.decodeFunctionPayload(call, programmableTx.inputs)
            await handler(decoded, ctx)
          }
        }
        return ctx.stopAndGetResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
      partitionHandler: async (data: Data_SuiCall): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const tx = JSON.parse(data.rawTransaction) as GrpcTypes.ExecutedTransaction
          const calls = getMoveCalls(tx)
          // For simplicity, use the first call for partitioning
          if (calls.length > 0) {
            return p(calls[0] as T)
          }
          return undefined
        }
        return p
      }
    })
    return this
  }

  onEvent(
    handler: (event: SuiEventInput, ctx: SuiContext) => void,
    handlerOptions?: HandlerOptions<MoveFetchConfig, SuiEventInput>
  ): this {
    this.onMoveEvent(handler, { type: '' }, handlerOptions)
    return this
  }

  onTransactionBlock(
    handler: (transaction: GrpcTypes.ExecutedTransaction, ctx: SuiContext) => PromiseOrVoid,
    filter?: TransactionFilter,
    handlerOptions?: HandlerOptions<MoveFetchConfig, GrpcTypes.ExecutedTransaction>
  ): this {
    const _fetchConfig = create(MoveFetchConfigSchema, { ...DEFAULT_FETCH_CONFIG, ...handlerOptions })

    const processor = this

    this.callHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data) {
        if (!data.rawTransaction) {
          throw new ConnectError('transaction is null', Code.InvalidArgument)
        }
        const tx = JSON.parse(data.rawTransaction) as GrpcTypes.ExecutedTransaction

        const ctx = new SuiContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          data.timestamp ? timestampDate(data.timestamp) : new Date(0),
          data.slot,
          tx,
          0,
          processor.config.baseLabels
        )
        if (tx) {
          await handler(tx, ctx)
        }
        return ctx.stopAndGetResult()
      },
      filters: [{ ...filter, function: '' }],
      fetchConfig: _fetchConfig,
      partitionHandler: async (data: Data_SuiCall): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const tx = JSON.parse(data.rawTransaction) as GrpcTypes.ExecutedTransaction
          return p(tx)
        }
        return p
      }
    })
    return this
  }

  protected onObjectChange(
    handler: (changes: SuiClientTypes.ChangedObject[], ctx: SuiObjectChangeContext) => PromiseOrVoid,
    type: string | string[]
  ): this {
    if (this.config.network === SuiNetwork.TEST_NET) {
      throw new ConnectError('object change not supported in testnet', Code.InvalidArgument)
    }
    const processor = this
    this.objectChangeHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data: Data_SuiObjectChange) {
        const ctx = new SuiObjectChangeContext(
          processor.config.network,
          processor.config.address,
          data.timestamp ? timestampDate(data.timestamp) : new Date(0),
          data.slot,
          data.txDigest,
          processor.config.baseLabels
        )
        await handler(await toSuiClientChangedObjects(data.rawChanges.map((r) => JSON.parse(r))), ctx)
        return ctx.stopAndGetResult()
      },
      type
    })

    return this
  }
}

export class SuiModulesProcessor extends SuiBaseProcessor {
  static bind(options: SuiBindOptions): SuiModulesProcessor {
    return new SuiModulesProcessor(ALL_ADDRESS, options)
  }
}

export class SuiGlobalProcessor extends SuiBaseProcessor {
  static bind(options: Omit<SuiBindOptions, 'address'>): SuiGlobalProcessor {
    return new SuiGlobalProcessor(ALL_ADDRESS, { ...options, address: ALL_ADDRESS })
  }
  onTransactionBlock(
    handler: (transaction: GrpcTypes.ExecutedTransaction, ctx: SuiContext) => void,
    filter: TransactionFilter,
    fetchConfig?: Partial<MoveFetchConfig>
  ): this {
    // TODO enable more strict check
    // if (!filter.publicKeyPrefix || filter.publicKeyPrefix.length < 2) {
    //   throw new ConnectError('restriction too low for global processor', Code.InvalidArgument)
    // }
    return super.onTransactionBlock(handler, filter, fetchConfig)
  }

  // deprecated,, use object type processor
  public onObjectChange(
    handler: (changes: SuiClientTypes.ChangedObject[], ctx: SuiObjectChangeContext) => void,
    type: string | string[]
  ): this {
    return super.onObjectChange(handler, type)
  }
}
