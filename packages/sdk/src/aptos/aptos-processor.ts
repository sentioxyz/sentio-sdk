import { MoveResource, Transaction_UserTransaction, TransactionPayload_EntryFunctionPayload } from './move-types.js'

import { MOVE_CODER, MoveCoder } from './move-coder.js'
import { AptosBindOptions, AptosNetwork, getChainId } from './network.js'
import { AptosContext, AptosResourceContext } from './context.js'
import { EventInstance } from './models.js'
import { ListStateStorage } from '@sentio/runtime'
import {
  MoveFetchConfig,
  Data_AptResource,
  HandleInterval,
  ProcessResult,
  Data_AptEvent,
  Data_AptCall,
} from '@sentio/protos'
import { ServerError, Status } from 'nice-grpc'
import { CallHandler, EventFilter, EventHandler, FunctionNameAndCallFilter } from '../move/index.js'

type IndexConfigure = {
  address: string
  network: AptosNetwork
  startVersion: bigint
  // endSeqNumber?: Long
}

class ResourceHandlder {
  type?: string
  versionInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handler: (resource: Data_AptResource) => Promise<ProcessResult>
}

export class AptosProcessorState extends ListStateStorage<AptosBaseProcessor> {
  static INSTANCE = new AptosProcessorState()
}

export class AptosBaseProcessor {
  readonly moduleName: string
  config: IndexConfigure
  eventHandlers: EventHandler<Data_AptEvent>[] = []
  callHandlers: CallHandler<Data_AptCall>[] = []

  constructor(moduleName: string, options: AptosBindOptions) {
    this.moduleName = moduleName
    this.config = configure(options)
    AptosProcessorState.INSTANCE.addValue(this)
    this.loadTypes(MOVE_CODER)
  }

  // getABI(): MoveModule | undefined {
  //   return undefined
  // }

  public onTransaction(
    handler: (transaction: Transaction_UserTransaction, ctx: AptosContext) => void,
    includedFailed = false,
    fetchConfig?: MoveFetchConfig
  ): this {
    const _fetchConfig = fetchConfig || MoveFetchConfig.fromPartial({})

    // const address = this.config.address
    // const moduleName = this.moduleName
    const processor = this
    this.callHandlers.push({
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'call is null')
        }
        const call = data.transaction as Transaction_UserTransaction
        const ctx = new AptosContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          BigInt(data.transaction.version),
          call
        )
        await handler(call, ctx)
        return ctx.getProcessResult()
      },
      filters: [{ function: '', includeFailed: includedFailed }],
      fetchConfig: _fetchConfig,
    })
    return this
  }

  public onMoveEvent(
    handler: (event: EventInstance, ctx: AptosContext) => void,
    filter: EventFilter | EventFilter[],
    fetchConfig?: MoveFetchConfig
  ): this {
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
        const txn = data.transaction as Transaction_UserTransaction
        if (!txn.events.length) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'no event in the transactions')
        }

        const ctx = new AptosContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          BigInt(txn.version),
          txn
        )

        const events = txn.events
        txn.events = []
        for (const evt of events) {
          const eventInstance = evt as EventInstance
          const decoded = MOVE_CODER.decodeEvent<any>(eventInstance)
          await handler(decoded || eventInstance, ctx)
        }

        return ctx.getProcessResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
    })
    return this
  }

  public onEntryFunctionCall(
    handler: (call: TransactionPayload_EntryFunctionPayload, ctx: AptosContext) => void,
    filter: FunctionNameAndCallFilter | FunctionNameAndCallFilter[],
    fetchConfig?: MoveFetchConfig
  ): this {
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
        const tx = data.transaction as Transaction_UserTransaction

        const ctx = new AptosContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          BigInt(tx.version),
          tx
        )
        if (tx) {
          const payload = tx.payload as TransactionPayload_EntryFunctionPayload
          const decoded = MOVE_CODER.decodeFunctionPayload(payload)
          await handler(decoded, ctx)
        }
        return ctx.getProcessResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
    })
    return this
  }

  getChainId(): string {
    return getChainId(this.config.network)
  }

  loadTypes(registry: MoveCoder) {
    if (registry.contains(this.config.address, this.moduleName)) {
      return
    }
    this.loadTypesInternal(registry)
  }

  protected loadTypesInternal(registry: MoveCoder) {
    // should be override by subclass
    console.log('')
  }
}

export class AptosAccountProcessorState extends ListStateStorage<AptosAccountProcessor> {
  static INSTANCE = new AptosAccountProcessorState()
}

export class AptosAccountProcessor {
  config: IndexConfigure

  resourcesHandlers: ResourceHandlder[] = []

  static bind(options: AptosBindOptions): AptosAccountProcessor {
    return new AptosAccountProcessor(options)
  }

  protected constructor(options: AptosBindOptions) {
    this.config = configure(options)
    AptosAccountProcessorState.INSTANCE.addValue(this)
  }

  getChainId(): string {
    return getChainId(this.config.network)
  }

  private onInterval(
    handler: (resources: MoveResource[], ctx: AptosResourceContext) => void,
    timeInterval: HandleInterval | undefined,
    versionInterval: HandleInterval | undefined,
    type: string | undefined
  ): this {
    const processor = this
    this.resourcesHandlers.push({
      handler: async function (data) {
        if (data.timestampMicros > Number.MAX_SAFE_INTEGER) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'timestamp is too large')
        }
        const timestamp = Number(data.timestampMicros)

        const ctx = new AptosResourceContext(
          processor.config.network,
          processor.config.address,
          data.version,
          timestamp
        )
        await handler(data.resources as MoveResource[], ctx)
        return ctx.getProcessResult()
      },
      timeIntervalInMinutes: timeInterval,
      versionInterval: versionInterval,
      type: type,
    })
    return this
  }

  public onTimeInterval(
    handler: (resources: MoveResource[], ctx: AptosResourceContext) => void,
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

  public onVersionInterval(
    handler: (resources: MoveResource[], ctx: AptosResourceContext) => void,
    versionInterval = 100000,
    backfillVersionInterval = 400000,
    typePrefix?: string
  ): this {
    return this.onInterval(
      handler,
      undefined,
      { recentInterval: versionInterval, backfillInterval: backfillVersionInterval },
      typePrefix
    )
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
    address: options.address,
    network: options.network || AptosNetwork.MAIN_NET,
  }
}
