import { Data_SuiCall, Data_SuiEvent, MoveFetchConfig } from '@sentio/protos'
import { ListStateStorage } from '@sentio/runtime'
import { SuiNetwork, getChainId } from './network.js'
import { ServerError, Status } from 'nice-grpc'
import { SuiContext } from './context.js'
import { MoveEvent, SuiTransactionResponse, getMoveCallTransaction, MoveCall } from '@mysten/sui.js'
import { CallHandler, EventFilter, EventHandler, FunctionNameAndCallFilter } from '../move/index.js'
import { getMoveCalls } from './utils.js'

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
            const decoded = eventInstance // TODO
            // const decoded = MOVE_CODER.decodeEvent<any>(eventInstance)
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
          const decoded = payload // MOVE_CODER.decodeFunctionPayload(payload)
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

function configure(options: SuiBindOptions): IndexConfigure {
  return {
    startTimestamp: options.startTimestamp || 0,
    address: options.address,
    network: options.network || SuiNetwork.MAIN_NET,
  }
}
