import { ProcessResult } from '../gen'
import {
  AptosBindOptions,
  AptosContext,
  AptosNetwork,
  Transaction_UserTransaction,
  TransactionPayload_EntryFunctionPayload,
  TypeRegistry,
} from '.'

import { EventInstance, TYPE_REGISTRY } from './types'
import { getChainId } from './network'
import { MoveResource } from 'aptos-sdk/src/generated'
import { AptosResourceContext } from './context'

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
  handler: (event: Transaction_UserTransaction) => Promise<ProcessResult>
}

class CallHandler {
  filters: FunctionNameAndCallFilter[]
  handler: (call: Transaction_UserTransaction) => Promise<ProcessResult>
}

export class MoveResourcesWithVersionPayload {
  resources: MoveResource[]
  version: string
  timestamp: string
}

class ResourceHandlder {
  type?: string
  versionInterval?: number
  timeIntervalInMinutes?: number
  handler: (resource: MoveResourcesWithVersionPayload) => Promise<ProcessResult>
}

export class AptosBaseProcessor {
  readonly moduleName: string
  config: IndexConfigure
  eventHandlers: EventHandler[] = []
  callHandlers: CallHandler[] = []

  constructor(moduleName: string, options: AptosBindOptions) {
    this.moduleName = moduleName
    this.config = configure(options)
    global.PROCESSOR_STATE.aptosProcessors.push(this)
    this.loadTypes(TYPE_REGISTRY)
  }

  // getABI(): MoveModule | undefined {
  //   return undefined
  // }

  public onTransaction(
    handler: (transaction: Transaction_UserTransaction, ctx: AptosContext) => void
  ): AptosBaseProcessor {
    // const address = this.config.address
    // const moduleName = this.moduleName
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const processor = this
    this.callHandlers.push({
      handler: async function (tx) {
        const ctx = new AptosContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          BigInt(tx.version),
          tx
        )
        if (tx) {
          await handler(tx, ctx)
        }
        return ctx.getProcessResult()
      },
      filters: [],
    })
    return this
  }

  public onEvent(
    handler: (event: EventInstance, ctx: AptosContext) => void,
    filter: EventFilter | EventFilter[]
  ): AptosBaseProcessor {
    let _filters: EventFilter[] = []

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const address = this.config.address
    // const moduleName = this.moduleName

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const processor = this

    this.eventHandlers.push({
      handler: async function (txn) {
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
    })
    return this
  }

  public onEntryFunctionCall(
    handler: (call: TransactionPayload_EntryFunctionPayload, ctx: AptosContext) => void,
    filter: FunctionNameAndCallFilter | FunctionNameAndCallFilter[]
  ): AptosBaseProcessor {
    let _filters: FunctionNameAndCallFilter[] = []

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const address = this.config.address
    // const moduleName = this.moduleName
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const processor = this

    this.callHandlers.push({
      handler: async function (tx) {
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

export class AptosAccountProcessor {
  config: IndexConfigure

  resourcesHandlers: ResourceHandlder[] = []

  static bind(options: AptosBindOptions): AptosAccountProcessor {
    return new AptosAccountProcessor(options)
  }

  protected constructor(options: AptosBindOptions) {
    this.config = configure(options)
    global.PROCESSOR_STATE.aptosAccountProcessors.push(this)
  }

  getChainId(): string {
    return getChainId(this.config.network)
  }

  private onInterval(
    handler: (resources: MoveResource[], ctx: AptosResourceContext) => void,
    timeInterval: number | undefined,
    versionInterval: number | undefined,
    type: string | undefined
  ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const processor = this
    this.resourcesHandlers.push({
      handler: async function (arg) {
        const ctx = new AptosResourceContext(
          processor.config.network,
          processor.config.address,
          BigInt(arg.version),
          parseInt(arg.timestamp)
        )
        await handler(arg.resources, ctx)
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
    type?: string
  ) {
    return this.onInterval(handler, timeIntervalInMinutes, undefined, type)
  }

  public onVersionInterval(
    handler: (resources: MoveResource[], ctx: AptosResourceContext) => void,
    versionInterval = 100000,
    typePrefix?: string
  ) {
    return this.onInterval(handler, undefined, versionInterval, typePrefix)
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
