import {
  Data_SuiCall,
  Data_SuiEvent,
  Data_SuiObject,
  HandleInterval,
  MoveFetchConfig,
  MoveOnIntervalConfig_OwnerType,
  ProcessResult,
} from '@sentio/protos'
import { ListStateStorage, mergeProcessResults } from '@sentio/runtime'
import { SuiNetwork } from './network.js'
import { ServerError, Status } from 'nice-grpc'
import { SuiContext, SuiObjectsContext } from './context.js'
import {
  getProgrammableTransaction,
  getTransactionKind,
  MoveCallSuiTransaction,
  SuiEvent,
  SuiMoveObject,
  SuiTransactionBlockResponse,
} from '@mysten/sui.js'
import { CallHandler, EventFilter, EventHandler, FunctionNameAndCallFilter, parseMoveType } from '../move/index.js'
import { getMoveCalls } from './utils.js'
import { defaultMoveCoder, MoveCoder } from './move-coder.js'
import { Labels, PromiseOrVoid } from '../core/index.js'
// import { dynamic_field } from './builtin/0x2.js'

const DEFAULT_FETCH_CONFIG: MoveFetchConfig = {
  resourceChanges: false,
  allEvents: true,
}

class IndexConfigure {
  address: string
  network: SuiNetwork
  startCheckpoint: bigint
  baseLabels?: Labels
}

export class SuiBindOptions {
  address: string
  network?: SuiNetwork
  startCheckpoint?: bigint
  baseLabels?: Labels
}

export class SuiObjectBindOptions {
  objectId: string
  network?: SuiNetwork
  startCheckpoint?: bigint
  baseLabels?: { [key: string]: string }
}

export class SuiProcessorState extends ListStateStorage<SuiBaseProcessor> {
  static INSTANCE = new SuiProcessorState()
}

export class SuiBaseProcessor {
  readonly moduleName: string
  config: IndexConfigure

  eventHandlers: EventHandler<Data_SuiEvent>[] = []
  callHandlers: CallHandler<Data_SuiCall>[] = []
  coder: MoveCoder

  constructor(name: string, options: SuiBindOptions) {
    this.moduleName = name
    this.config = configure(options)
    SuiProcessorState.INSTANCE.addValue(this)
    this.coder = defaultMoveCoder(this.config.network)
  }

  getChainId(): string {
    return this.config.network
  }

  public onMoveEvent(
    handler: (event: SuiEvent, ctx: SuiContext) => void,
    filter: EventFilter | EventFilter[],
    fetchConfig?: Partial<MoveFetchConfig>
  ): SuiBaseProcessor {
    let _filters: EventFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...fetchConfig })

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const address = this.config.address
    // const moduleName = this.moduleName

    const processor = this
    const allEventType = new Set(_filters.map((f) => processor.config.address + '::' + f.type))

    this.eventHandlers.push({
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'event is null')
        }
        const txn = data.transaction as SuiTransactionBlockResponse
        if (!txn.events || !txn.events.length) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'no event in the transactions')
        }

        const processResults = []
        for (const [idx, evt] of (txn.events as SuiEvent[]).entries()) {
          const typeQname = parseMoveType(evt.type).qname
          if (!allEventType.has(typeQname)) {
            continue
          }

          const ctx = new SuiContext(
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
          processResults.push(ctx.getProcessResult())
        }

        return mergeProcessResults(processResults)
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
    })
    return this
  }

  public onEntryFunctionCall(
    handler: (call: MoveCallSuiTransaction, ctx: SuiContext) => void,
    filter: FunctionNameAndCallFilter | FunctionNameAndCallFilter[],
    fetchConfig?: Partial<MoveFetchConfig>
  ): SuiBaseProcessor {
    let _filters: FunctionNameAndCallFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...fetchConfig })

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const address = this.config.address
    // const moduleName = this.moduleName
    const processor = this
    const allFunctionType = new Set(_filters.map((f) => processor.config.address + '::' + f.function))

    this.callHandlers.push({
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'call is null')
        }
        const tx = data.transaction as SuiTransactionBlockResponse

        const ctx = new SuiContext(
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
          const calls: MoveCallSuiTransaction[] = getMoveCalls(tx)
          // if (calls.length !== 1) {
          //   throw new ServerError(Status.INVALID_ARGUMENT, 'Unexpected number of call transactions ' + calls.length)
          // }
          const txKind = getTransactionKind(tx)
          if (!txKind) {
            throw new ServerError(Status.INVALID_ARGUMENT, 'Unexpected getTransactionKind get empty')
          }
          const programmableTx = getProgrammableTransaction(txKind)

          let matched: MoveCallSuiTransaction
          // TODO potential pass index
          for (const call of calls) {
            if (allFunctionType.has(call.function)) {
              matched = call
              break
            }

            const payload = calls[0]
            const decoded = await processor.coder.decodeFunctionPayload(payload, programmableTx?.inputs || [])
            await handler(decoded, ctx)
          }
        }
        return ctx.getProcessResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
    })
    return this
  }
}

class ObjectHandler {
  type?: string
  versionInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handler: (resource: Data_SuiObject) => Promise<ProcessResult>
}

export class SuiAccountProcessorState extends ListStateStorage<SuiBaseObjectsProcessor<any>> {
  static INSTANCE = new SuiAccountProcessorState()
}

class SuiObjectsBindOptions extends SuiBindOptions {
  ownerType: MoveOnIntervalConfig_OwnerType
}

abstract class SuiBaseObjectsProcessor<HandlerType> {
  config: IndexConfigure
  ownerType: MoveOnIntervalConfig_OwnerType

  objectHandlers: ObjectHandler[] = []

  // static bind(options: SuiObjectsBindOptions): SuiBaseObjectsProcessor<any> {
  //   return new SuiBaseObjectsProcessor(options)
  // }

  protected constructor(options: SuiObjectsBindOptions) {
    this.config = configure(options)
    this.ownerType = options.ownerType
    SuiAccountProcessorState.INSTANCE.addValue(this)
  }

  getChainId(): string {
    return this.config.network
  }

  // protected abstract transformObjects(objects: SuiMoveObject[]): SuiMoveObject[]

  protected abstract doHandle(handler: HandlerType, data: Data_SuiObject, ctx: SuiObjectsContext): PromiseOrVoid

  protected onInterval(
    handler: HandlerType, //(resources: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    versionInterval: HandleInterval | undefined,
    type: string | undefined
  ): this {
    const processor = this
    this.objectHandlers.push({
      handler: async function (data) {
        const ctx = new SuiObjectsContext(
          processor.config.network,
          processor.config.address,
          data.slot,
          data.timestamp || new Date(0),
          processor.config.baseLabels
        )
        await processor.doHandle(handler, data, ctx)
        return ctx.getProcessResult()
      },
      timeIntervalInMinutes: timeInterval,
      versionInterval: versionInterval,
      type,
    })
    return this
  }

  public onTimeInterval(
    handler: HandlerType,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    type?: string
  ): this {
    return this.onInterval(
      handler,
      {
        recentInterval: timeIntervalInMinutes,
        backfillInterval: backfillTimeIntervalInMinutes,
      },
      undefined,
      type
    )
  }

  public onSlotInterval(
    handler: HandlerType,
    slotInterval = 100000,
    backfillSlotInterval = 400000,
    type?: string
  ): this {
    return this.onInterval(
      handler,
      undefined,
      { recentInterval: slotInterval, backfillInterval: backfillSlotInterval },
      type
    )
  }
}

function configure(options: SuiBindOptions): IndexConfigure {
  return {
    startCheckpoint: options.startCheckpoint || 0n,
    address: options.address,
    network: options.network || SuiNetwork.MAIN_NET,
    baseLabels: options.baseLabels,
  }
}

export class SuiAddressProcessor extends SuiBaseObjectsProcessor<
  (objects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid
> {
  static bind(options: SuiBindOptions): SuiAddressProcessor {
    return new SuiAddressProcessor({ ...options, ownerType: MoveOnIntervalConfig_OwnerType.ADDRESS })
  }

  protected doHandle(
    handler: (objects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectsContext
  ): PromiseOrVoid {
    return handler(data.objects as SuiMoveObject[], ctx)
  }
}
// export class SuiDynamicFieldObjectsProcessor extends SuiBaseObjectsProcessor<dynamic_field.Field<any, any>> {
export class SuiObjectProcessor extends SuiBaseObjectsProcessor<
  (self: SuiMoveObject, dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid
> {
  static bind(options: SuiObjectBindOptions): SuiObjectProcessor {
    return new SuiObjectProcessor({
      address: options.objectId,
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      ownerType: MoveOnIntervalConfig_OwnerType.OBJECT,
      baseLabels: options.baseLabels,
    })
  }

  protected doHandle(
    handler: (self: SuiMoveObject, dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectsContext
  ): PromiseOrVoid {
    if (!data.self) {
      console.log(`Sui object not existed in ${ctx.slot}, please specific a start time`)
      return
    }
    return handler(data.self as SuiMoveObject, data.objects as SuiMoveObject[], ctx)
  }
}

export class SuiWrappedObjectProcessor extends SuiBaseObjectsProcessor<
  (dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid
> {
  static bind(options: SuiObjectBindOptions): SuiWrappedObjectProcessor {
    return new SuiWrappedObjectProcessor({
      address: options.objectId,
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      ownerType: MoveOnIntervalConfig_OwnerType.WRAPPED_OBJECT,
      baseLabels: options.baseLabels,
    })
  }

  protected doHandle(
    handler: (dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectsContext
  ): PromiseOrVoid {
    return handler(data.objects as SuiMoveObject[], ctx)
  }
}
