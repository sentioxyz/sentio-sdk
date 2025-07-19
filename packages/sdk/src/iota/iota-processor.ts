import { Data_SuiCall, Data_SuiEvent, Data_SuiObjectChange, MoveFetchConfig } from '@sentio/protos'
import { ListStateStorage } from '@sentio/runtime'
import { IotaNetwork } from './network.js'
import { ServerError, Status } from 'nice-grpc'
import { IotaContext, IotaObjectChangeContext } from './context.js'
import {
  MoveCallIotaTransaction,
  IotaEvent,
  IotaTransactionBlockResponse,
  IotaObjectChange
} from '@iota/iota-sdk/client'
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
import { getMoveCalls } from './utils.js'
import { defaultMoveCoder, MoveCoder } from './index.js'
import { ALL_ADDRESS, Labels, PromiseOrVoid } from '../core/index.js'
import { Required } from 'utility-types'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'
import { HandlerOptions } from './models.js'

export const DEFAULT_FETCH_CONFIG: MoveFetchConfig = {
  resourceChanges: false,
  allEvents: true,
  inputs: true
}

export type IndexConfigure = Required<IotaBindOptions, 'startCheckpoint' | 'network'>

export function configure(options: IotaBindOptions): IndexConfigure {
  return {
    startCheckpoint: options.startCheckpoint || 0n,
    endCheckpoint: options.endCheckpoint,
    address: options.address === ALL_ADDRESS ? ALL_ADDRESS : accountAddressString(options.address),
    network: options.network || IotaNetwork.MAIN_NET,
    baseLabels: options.baseLabels
  }
}

export interface IotaBindOptions {
  address: string
  network?: IotaNetwork
  startCheckpoint?: bigint
  endCheckpoint?: bigint
  baseLabels?: Labels
}

export class IotaProcessorState extends ListStateStorage<IotaBaseProcessor> {
  static INSTANCE = new IotaProcessorState()
}

export class IotaBaseProcessor {
  readonly moduleName: string
  config: IndexConfigure

  eventHandlers: EventHandler<Data_SuiEvent>[] = []
  callHandlers: CallHandler<Data_SuiCall>[] = []
  objectChangeHandlers: ObjectChangeHandler<Data_SuiObjectChange>[] = []

  coder: MoveCoder

  constructor(name: string, options: IotaBindOptions) {
    this.moduleName = name
    this.config = configure(options)
    IotaProcessorState.INSTANCE.addValue(this)
    this.coder = defaultMoveCoder(this.config.network)

    return proxyProcessor(this)
  }

  getChainId(): string {
    return this.config.network
  }

  protected onMoveEvent(
    handler: (event: IotaEvent, ctx: IotaContext) => PromiseOrVoid,
    filter: EventFilter | EventFilter[],
    handlerOptions?: HandlerOptions<MoveFetchConfig, IotaEvent>
  ): IotaBaseProcessor {
    let _filters: EventFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...handlerOptions })

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
          throw new ServerError(Status.INVALID_ARGUMENT, 'event is null')
        }
        const txn = JSON.parse(data.rawTransaction) as IotaTransactionBlockResponse
        if (txn.events == null) {
          txn.events = []
        }

        const evt = JSON.parse(data.rawEvent) as IotaEvent
        const idx = Number(evt.id.eventSeq) || 0

        const ctx = new IotaContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          data.timestamp || new Date(0),
          data.slot,
          txn,
          idx,
          processor.config.baseLabels
        )

        const decoded = await processor.coder.decodeEvent<any>(evt)
        await handler(decoded || evt, ctx)

        return ctx.stopAndGetResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
      partitionHandler: async (data: Data_SuiEvent): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const evt = JSON.parse(data.rawEvent) as IotaEvent
          const decoded = await processor.coder.decodeEvent<any>(evt)
          return p(decoded || evt)
        }
        return p
      }
    })
    return this
  }

  protected onEntryFunctionCall(
    handler: (call: MoveCallIotaTransaction, ctx: IotaContext) => PromiseOrVoid,
    filter: FunctionNameAndCallFilter | FunctionNameAndCallFilter[],
    handlerOptions?: HandlerOptions<MoveFetchConfig, MoveCallIotaTransaction>
  ): IotaBaseProcessor {
    let _filters: FunctionNameAndCallFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...handlerOptions })

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
          throw new ServerError(Status.INVALID_ARGUMENT, 'call is null')
        }
        const tx = JSON.parse(data.rawTransaction) as IotaTransactionBlockResponse

        const ctx = new IotaContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          data.timestamp || new Date(0),
          data.slot,
          tx,
          0,
          processor.config.baseLabels
        )
        if (tx) {
          const calls: MoveCallIotaTransaction[] = getMoveCalls(tx)
          const txKind = tx.transaction?.data?.transaction
          if (!txKind) {
            throw new ServerError(Status.INVALID_ARGUMENT, 'Unexpected getTransactionKind get empty')
          }

          // getProgrammableTransaction(txKind)
          const programmableTx = txKind.kind === 'ProgrammableTransaction' ? txKind : undefined

          // TODO potential pass index
          for (const call of calls) {
            const functionType = [call.module, call.function].join(SPLITTER)
            if (!allFunctionType.has(functionType)) {
              continue
            }

            // TODO maybe do in parallel
            const decoded = await processor.coder.decodeFunctionPayload(call, programmableTx?.inputs || [])
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
          const tx = JSON.parse(data.rawTransaction) as IotaTransactionBlockResponse
          const calls: MoveCallIotaTransaction[] = getMoveCalls(tx)
          // For simplicity, use the first call for partitioning
          if (calls.length > 0) {
            return p(calls[0])
          }
          return undefined
        }
        return p
      }
    })
    return this
  }

  onEvent(
    handler: (event: IotaEvent, ctx: IotaContext) => void,
    handlerOptions?: HandlerOptions<MoveFetchConfig, IotaEvent>
  ): this {
    this.onMoveEvent(handler, { type: '' }, handlerOptions)
    return this
  }

  onTransactionBlock(
    handler: (transaction: IotaTransactionBlockResponse, ctx: IotaContext) => PromiseOrVoid,
    filter?: TransactionFilter,
    handlerOptions?: HandlerOptions<MoveFetchConfig, IotaTransactionBlockResponse>
  ): this {
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...handlerOptions })

    const processor = this

    this.callHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data) {
        if (!data.rawTransaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'transaction is null')
        }
        const tx = JSON.parse(data.rawTransaction) as IotaTransactionBlockResponse

        const ctx = new IotaContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          data.timestamp || new Date(0),
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
          const tx = JSON.parse(data.rawTransaction) as IotaTransactionBlockResponse
          return p(tx)
        }
        return p
      }
    })
    return this
  }

  protected onObjectChange(
    handler: (changes: IotaObjectChange[], ctx: IotaObjectChangeContext) => PromiseOrVoid,
    type: string
  ): this {
    if (this.config.network === IotaNetwork.TEST_NET) {
      throw new ServerError(Status.INVALID_ARGUMENT, 'object change not supported in testnet')
    }
    const processor = this
    this.objectChangeHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data: Data_SuiObjectChange) {
        const ctx = new IotaObjectChangeContext(
          processor.config.network,
          processor.config.address,
          data.timestamp || new Date(0),
          data.slot,
          data.txDigest,
          processor.config.baseLabels
        )
        await handler(data.rawChanges.map((r) => JSON.parse(r)) as IotaObjectChange[], ctx)
        return ctx.stopAndGetResult()
      },
      type
    })

    return this
  }
}

export class IotaModulesProcessor extends IotaBaseProcessor {
  static bind(options: IotaBindOptions): IotaModulesProcessor {
    return new IotaModulesProcessor(ALL_ADDRESS, options)
  }
}

export class IotaGlobalProcessor extends IotaBaseProcessor {
  static bind(options: Omit<IotaBindOptions, 'address'>): IotaGlobalProcessor {
    return new IotaGlobalProcessor(ALL_ADDRESS, { ...options, address: ALL_ADDRESS })
  }
  onTransactionBlock(
    handler: (transaction: IotaTransactionBlockResponse, ctx: IotaContext) => void,
    filter: TransactionFilter,
    fetchConfig?: Partial<MoveFetchConfig>
  ): this {
    // TODO enable more strict check
    // if (!filter.publicKeyPrefix || filter.publicKeyPrefix.length < 2) {
    //   throw new ServerError(Status.INVALID_ARGUMENT, 'restriction too low for global processor')
    // }
    return super.onTransactionBlock(handler, filter, fetchConfig)
  }

  // deprecated,, use object type processor
  public onObjectChange(
    handler: (changes: IotaObjectChange[], ctx: IotaObjectChangeContext) => void,
    type: string
  ): this {
    return super.onObjectChange(handler, type)
  }
}
