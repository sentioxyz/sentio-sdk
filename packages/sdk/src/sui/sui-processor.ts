import {
  Data_SuiCall,
  Data_SuiEvent,
  Data_SuiObject,
  HandleInterval,
  MoveFetchConfig,
  MoveOnIntervalConfig_OwnerType,
  ProcessResult,
} from '@sentio/protos'
import { ListStateStorage } from '@sentio/runtime'
import { getChainId, SuiNetwork } from './network.js'
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
import { CallHandler, EventFilter, EventHandler, FunctionNameAndCallFilter } from '../move/index.js'
import { getMoveCalls } from './utils.js'
import { defaultMoveCoder } from './move-coder.js'
// import { dynamic_field } from './builtin/0x2.js'

class IndexConfigure {
  address: string
  network: SuiNetwork
  startTimestamp: number
}

export class SuiBindOptions {
  address: string
  network?: SuiNetwork
  startTimestamp?: number
}

export class SuiObjectBindOptions {
  objectId: string
  network?: SuiNetwork
  startTimestamp?: number
}

export class SuiProcessorState extends ListStateStorage<SuiBaseProcessor> {
  static INSTANCE = new SuiProcessorState()
}

export class SuiBaseProcessor {
  readonly moduleName: string
  config: IndexConfigure

  eventHandlers: EventHandler<Data_SuiEvent>[] = []
  callHandlers: CallHandler<Data_SuiCall>[] = []

  constructor(name: string, options: SuiBindOptions) {
    this.moduleName = name
    this.config = configure(options)
    SuiProcessorState.INSTANCE.addValue(this)
  }

  getChainId(): string {
    return getChainId(this.config.network)
  }

  public onMoveEvent(
    handler: (event: SuiEvent, ctx: SuiContext) => void,
    filter: EventFilter | EventFilter[],
    fetchConfig?: MoveFetchConfig
  ): SuiBaseProcessor {
    let _filters: EventFilter[] = []
    const _fetchConfig = fetchConfig || MoveFetchConfig.fromPartial({})

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const address = this.config.address
    // const moduleName = this.moduleName

    const processor = this

    this.eventHandlers.push({
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'event is null')
        }
        const txn = data.transaction as SuiTransactionBlockResponse
        if (!txn.events || !txn.events.length) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'no event in the transactions')
        }

        const ctx = new SuiContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          data.timestamp || new Date(0),
          data.slot,
          txn
        )

        const events = txn.events
        txn.events = []
        for (const evt of events) {
          // if ('moveEvent' in evt) {
          //   const eventInstance = evt.moveEvent as SuiEvent
          const decoded = defaultMoveCoder().decodeEvent<any>(evt)
          await handler(decoded || evt, ctx)
          // }
        }

        return ctx.getProcessResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
    })
    return this
  }

  public onEntryFunctionCall(
    handler: (call: MoveCallSuiTransaction, ctx: SuiContext) => void,
    filter: FunctionNameAndCallFilter | FunctionNameAndCallFilter[],
    fetchConfig?: MoveFetchConfig
  ): SuiBaseProcessor {
    let _filters: FunctionNameAndCallFilter[] = []
    const _fetchConfig = fetchConfig || MoveFetchConfig.fromPartial({})

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const address = this.config.address
    // const moduleName = this.moduleName
    const processor = this

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
          tx
        )
        if (tx) {
          const calls: MoveCallSuiTransaction[] = getMoveCalls(tx)
          if (calls.length !== 1) {
            throw new ServerError(Status.INVALID_ARGUMENT, 'Unexpected number of call transactions ' + calls.length)
          }
          const txKind = getTransactionKind(tx)
          if (!txKind) {
            throw new ServerError(Status.INVALID_ARGUMENT, 'Unexpected getTransactionKind get empty')
          }
          const programmableTx = getProgrammableTransaction(txKind)

          const payload = calls[0]
          const decoded = defaultMoveCoder().decodeFunctionPayload(payload, programmableTx?.inputs || [])
          await handler(decoded, ctx)
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
    return getChainId(this.config.network)
  }

  protected abstract transformObjects(objects: SuiMoveObject[]): HandlerType[]

  protected onInterval(
    handler: (resources: HandlerType[], ctx: SuiObjectsContext) => void,
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
          data.timestamp || new Date(0)
        )
        await handler(processor.transformObjects(data.objects as SuiMoveObject[]), ctx)
        return ctx.getProcessResult()
      },
      timeIntervalInMinutes: timeInterval,
      versionInterval: versionInterval,
      type,
    })
    return this
  }

  public onTimeInterval(
    handler: (objects: HandlerType[], ctx: SuiObjectsContext) => void,
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
    handler: (objects: HandlerType[], ctx: SuiObjectsContext) => void,
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
    startTimestamp: options.startTimestamp || 0,
    address: options.address,
    network: options.network || SuiNetwork.MAIN_NET,
  }
}

export class SuiAddressObjectsProcessor extends SuiBaseObjectsProcessor<SuiMoveObject> {
  static bind(options: SuiBindOptions): SuiAddressObjectsProcessor {
    return new SuiAddressObjectsProcessor({ ...options, ownerType: MoveOnIntervalConfig_OwnerType.ADDRESS })
  }

  protected transformObjects(objects: SuiMoveObject[]): SuiMoveObject[] {
    return objects
  }
}
// export class SuiDynamicFieldObjectsProcessor extends SuiBaseObjectsProcessor<dynamic_field.Field<any, any>> {
export class SuiDynamicFieldObjectsProcessor extends SuiBaseObjectsProcessor<SuiMoveObject> {
  static bind(options: SuiObjectBindOptions): SuiDynamicFieldObjectsProcessor {
    return new SuiDynamicFieldObjectsProcessor({
      address: options.objectId,
      network: options.network,
      startTimestamp: options.startTimestamp,
      ownerType: MoveOnIntervalConfig_OwnerType.OBJECT,
    })
  }

  protected transformObjects(objects: SuiMoveObject[]) {
    return objects
    // return defaultMoveCoder().getObjectsFromDynamicFields(objects)
  }
}
