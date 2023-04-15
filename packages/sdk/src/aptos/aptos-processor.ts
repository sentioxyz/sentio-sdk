import { MoveResource, Transaction_UserTransaction, TransactionPayload_EntryFunctionPayload } from './move-types.js'

import { MOVE_CODER, MoveCoder } from './move-coder.js'
import { AptosBindOptions, AptosNetwork, getChainId } from './network.js'
import { AptosContext, AptosResourcesContext } from './context.js'
import { EventInstance } from './models.js'
import { ListStateStorage, mergeProcessResults } from '@sentio/runtime'
import {
  MoveFetchConfig,
  Data_AptResource,
  HandleInterval,
  ProcessResult,
  Data_AptEvent,
  Data_AptCall,
} from '@sentio/protos'
import { ServerError, Status } from 'nice-grpc'
import { CallHandler, EventFilter, EventHandler, FunctionNameAndCallFilter, parseMoveType } from '../move/index.js'

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
    fetchConfig?: Partial<MoveFetchConfig>
  ): this {
    const _fetchConfig = MoveFetchConfig.fromPartial(fetchConfig || {})

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
          call,
          0
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
    fetchConfig?: Partial<MoveFetchConfig>
  ): this {
    let _filters: EventFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial(fetchConfig || {})

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const moduleName = this.moduleName

    const processor = this
    const allEventType = new Set(_filters.map((f) => processor.config.address + '::' + f.type))

    this.eventHandlers.push({
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'event is null')
        }
        const txn = data.transaction as Transaction_UserTransaction
        if (!txn.events.length) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'no event in the transactions')
        }

        const processResults = []
        for (const [idx, evt] of txn.events.entries()) {
          const typeQname = parseMoveType(evt.type).qname
          if (!allEventType.has(typeQname)) {
            continue
          }

          const ctx = new AptosContext(
            processor.moduleName,
            processor.config.network,
            processor.config.address,
            BigInt(txn.version),
            txn,
            idx
          )
          const eventInstance = evt as EventInstance
          const decoded = MOVE_CODER.decodeEvent<any>(eventInstance)
          await handler(decoded || eventInstance, ctx)
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
    handler: (call: TransactionPayload_EntryFunctionPayload, ctx: AptosContext) => void,
    filter: FunctionNameAndCallFilter | FunctionNameAndCallFilter[],
    fetchConfig?: Partial<MoveFetchConfig>
  ): this {
    let _filters: FunctionNameAndCallFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial(fetchConfig || {})

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
          tx,
          0
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

export class AptosAccountProcessorState extends ListStateStorage<AptosResourcesProcessor> {
  static INSTANCE = new AptosAccountProcessorState()
}

export class AptosResourcesProcessor {
  config: IndexConfigure

  resourcesHandlers: ResourceHandlder[] = []

  static bind(options: AptosBindOptions): AptosResourcesProcessor {
    return new AptosResourcesProcessor(options)
  }

  protected constructor(options: AptosBindOptions) {
    this.config = configure(options)
    AptosAccountProcessorState.INSTANCE.addValue(this)
  }

  getChainId(): string {
    return getChainId(this.config.network)
  }

  private onInterval(
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => void,
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

        const ctx = new AptosResourcesContext(
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
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => void,
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
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => void,
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
