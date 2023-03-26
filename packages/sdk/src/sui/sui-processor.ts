import {
  Data_SuiCall,
  Data_SuiEvent,
  MoveFetchConfig,
  Data_SuiObject,
  ProcessResult,
  HandleInterval,
  MoveOnIntervalConfig_OwnerType,
} from '@sentio/protos'
import { ListStateStorage } from '@sentio/runtime'
import { SuiNetwork, getChainId } from './network.js'
import { ServerError, Status } from 'nice-grpc'
import { SuiContext, SuiObjectsContext } from './context.js'
import { MoveEvent, SuiTransactionResponse, MoveCall, SuiMoveObject } from '@mysten/sui.js'
import { CallHandler, EventFilter, EventHandler, FunctionNameAndCallFilter } from '../move/index.js'
import { getMoveCalls } from './utils.js'
import { defaultMoveCoder } from './move-coder.js'

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
    handler: (event: MoveEvent, ctx: SuiContext) => void,
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
        const txn = data.transaction as SuiTransactionResponse
        if (!txn.effects.events || !txn.effects.events.length) {
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

        const events = txn.effects.events
        txn.effects.events = []
        for (const evt of events) {
          if ('moveEvent' in evt) {
            const eventInstance = evt.moveEvent as MoveEvent
            const decoded = defaultMoveCoder().decodeEvent<any>(eventInstance)
            await handler(decoded || eventInstance, ctx)
          }
        }

        return ctx.getProcessResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
    })
    return this
  }

  public onEntryFunctionCall(
    handler: (call: MoveCall, ctx: SuiContext) => void,
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
        const tx = data.transaction as SuiTransactionResponse

        const ctx = new SuiContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          data.timestamp || new Date(0),
          data.slot,
          tx
        )
        if (tx) {
          const calls: MoveCall[] = getMoveCalls(tx)
          if (calls.length !== 1) {
            throw new ServerError(Status.INVALID_ARGUMENT, 'Unexpected number of call transactions ' + calls.length)
          }
          const payload = calls[0]
          const decoded = defaultMoveCoder().decodeFunctionPayload(payload)
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

export class SuiAccountProcessorState extends ListStateStorage<SuiObjectsProcessor> {
  static INSTANCE = new SuiAccountProcessorState()
}

class SuiObjectsBindOptions extends SuiBindOptions {
  ownerType: MoveOnIntervalConfig_OwnerType
}

export class SuiObjectsProcessor {
  config: IndexConfigure
  ownerType: MoveOnIntervalConfig_OwnerType

  objectHandlers: ObjectHandler[] = []

  static bind(options: SuiObjectsBindOptions): SuiObjectsProcessor {
    return new SuiObjectsProcessor(options)
  }

  protected constructor(options: SuiObjectsBindOptions) {
    this.config = configure(options)
    this.ownerType = options.ownerType
    SuiAccountProcessorState.INSTANCE.addValue(this)
  }

  getChainId(): string {
    return getChainId(this.config.network)
  }

  private onInterval(
    handler: (resources: SuiMoveObject[], ctx: SuiObjectsContext) => void,
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
        await handler(data.objects as SuiMoveObject[], ctx)
        return ctx.getProcessResult()
      },
      timeIntervalInMinutes: timeInterval,
      versionInterval: versionInterval,
      type,
    })
    return this
  }

  public onTimeInterval(
    handler: (objects: SuiMoveObject[], ctx: SuiObjectsContext) => void,
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
    handler: (objects: SuiMoveObject[], ctx: SuiObjectsContext) => void,
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
