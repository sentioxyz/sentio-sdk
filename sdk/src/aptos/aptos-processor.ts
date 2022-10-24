import { ProcessResult } from '../gen'
import {
  AptosBindOptions,
  AptosContext,
  AptosNetwork,
  Transaction_UserTransaction,
  TransactionPayload_EntryFunctionPayload,
  TypeRegistry,
} from '.'

import Long from 'long'
import { EventInstance, DEFAULT_TYPE_REGISTRY } from './types'
import { getChainId } from './network'

type IndexConfigure = {
  address: string
  network: AptosNetwork
  startVersion: Long
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

export class AptosBaseProcessor {
  readonly moduleName: string
  config: IndexConfigure
  eventHandlers: EventHandler[] = []
  callHandlers: CallHandler[] = []

  constructor(moduleName: string, options: AptosBindOptions) {
    this.moduleName = moduleName
    this.configure(options)
    global.PROCESSOR_STATE.aptosProcessors.push(this)
    this.loadTypes(DEFAULT_TYPE_REGISTRY)
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
          Long.fromString(tx.version),
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
          Long.fromString(txn.version),
          txn
        )
        if (txn && txn.events) {
          const events = txn.events
          txn.events = []
          for (const evt of events) {
            const eventInstance = evt as EventInstance
            const decoded = DEFAULT_TYPE_REGISTRY.decodeEvent<any>(eventInstance)
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
          Long.fromString(tx.version),
          tx
        )
        if (tx) {
          const payload = tx.payload as TransactionPayload_EntryFunctionPayload
          const decoded = DEFAULT_TYPE_REGISTRY.decodeFunctionPayload(payload)
          await handler(decoded, ctx)
        }
        return ctx.getProcessResult()
      },
      filters: _filters,
    })
    return this
  }

  private configure(options: AptosBindOptions) {
    let startVersion = Long.ZERO
    if (options.startVersion) {
      startVersion = Long.fromValue(options.startVersion)
    }

    this.config = {
      startVersion: startVersion,
      address: options.address,
      network: options.network || AptosNetwork.MAIN_NET,
    }
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
