import {
  MoveResource,
  Transaction_UserTransaction,
  TransactionPayload_EntryFunctionPayload,
} from 'aptos-sdk/src/generated'

import { TYPE_REGISTRY, TypeRegistry } from './type-registry'
import { AptosBindOptions, AptosNetwork, getChainId } from './network'
import { AptosContext, AptosResourceContext } from './context'
import { EventInstance } from './models'
import { ListStateStorage } from '@sentio/runtime'
import {
  AptosFetchConfig,
  Data_AptCall,
  Data_AptEvent,
  Data_AptResource,
  HandleInterval,
  ProcessResult,
} from '@sentio/protos'
import { ServerError, Status } from 'nice-grpc'

type IndexConfigure = {
  address: string
  network: AptosNetwork
  startVersion: bigint
  // endSeqNumber?: Long
}

// TODO extends ArgumentsFilter
export interface EventFilter {
  type: string
  account?: string
}

export interface FunctionNameAndCallFilter extends CallFilter {
  function: string
}

// TODO extends ArgumentsFilter
export interface CallFilter {
  includeFailed?: boolean
  typeArguments?: string[]
}

export interface ArgumentsFilter {
  arguments?: string[]
}

class EventHandler {
  filters: EventFilter[]
  handler: (event: Data_AptEvent) => Promise<ProcessResult>
  fetchConfig: AptosFetchConfig
}

class CallHandler {
  filters: FunctionNameAndCallFilter[]
  handler: (call: Data_AptCall) => Promise<ProcessResult>
  fetchConfig: AptosFetchConfig
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
  eventHandlers: EventHandler[] = []
  callHandlers: CallHandler[] = []

  constructor(moduleName: string, options: AptosBindOptions) {
    this.moduleName = moduleName
    this.config = configure(options)
    AptosProcessorState.INSTANCE.addValue(this)
    this.loadTypes(TYPE_REGISTRY)
  }

  // getABI(): MoveModule | undefined {
  //   return undefined
  // }

  public onTransaction(
    handler: (transaction: Transaction_UserTransaction, ctx: AptosContext) => void,
    includedFailed = false,
    fetchConfig?: AptosFetchConfig
  ): AptosBaseProcessor {
    const _fetchConfig = fetchConfig || AptosFetchConfig.fromPartial({})

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

  public onEvent(
    handler: (event: EventInstance, ctx: AptosContext) => void,
    filter: EventFilter | EventFilter[],
    fetchConfig?: AptosFetchConfig
  ): AptosBaseProcessor {
    let _filters: EventFilter[] = []
    const _fetchConfig = fetchConfig || AptosFetchConfig.fromPartial({})

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

        const ctx = new AptosContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          BigInt(txn.version),
          txn
        )
        if (txn && txn.events) {
          const events = txn.events
          txn.events = []
          for (const evt of events) {
            const eventInstance = evt as EventInstance
            const decoded = TYPE_REGISTRY.decodeEvent<any>(eventInstance)
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
    handler: (call: TransactionPayload_EntryFunctionPayload, ctx: AptosContext) => void,
    filter: FunctionNameAndCallFilter | FunctionNameAndCallFilter[],
    fetchConfig?: AptosFetchConfig
  ): AptosBaseProcessor {
    let _filters: FunctionNameAndCallFilter[] = []
    const _fetchConfig = fetchConfig || AptosFetchConfig.fromPartial({})

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
          const decoded = TYPE_REGISTRY.decodeFunctionPayload(payload)
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

  loadTypes(registry: TypeRegistry) {
    if (registry.contains(this.config.address, this.moduleName)) {
      return
    }
    this.loadTypesInternal(registry)
  }

  protected loadTypesInternal(registry: TypeRegistry) {
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
  ) {
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
  ) {
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
  ) {
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
