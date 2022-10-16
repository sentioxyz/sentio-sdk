import { ProcessResult, RecordMetaData } from '../gen'
import {
  AptosBindOptions,
  AptosContext,
  AptosNetwork,
  Transaction_UserTransaction,
  TransactionPayload_EntryFunctionPayload,
  TypedEntryFunctionPayload,
  TypedEventInstance,
  TypeRegistry,
} from '.'

import Long from 'long'
import { APTOS_MAINNET_ID, APTOS_TESTNET_ID } from '../utils/chain'
import { EventInstance, GLOBAL_TYPE_REGISTRY } from './types'
import { parseMoveType } from '../aptos-codegen/typegen'

type IndexConfigure = {
  address: string
  network: AptosNetwork
  startVersion: Long
  // endSeqNumber?: Long
}

// TODO extends ArgumentsFilter
export interface EventFilter {
  type: string
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
  handler: (event: EventInstance) => Promise<ProcessResult>
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
  }

  // getABI(): MoveModule | undefined {
  //   return undefined
  // }

  public onTransaction(
    handler: (transaction: Transaction_UserTransaction, ctx: AptosContext) => void
  ): AptosBaseProcessor {
    const address = this.config.address
    const moduleName = this.moduleName
    this.callHandlers.push({
      handler: async function (tx) {
        const ctx = new AptosContext(moduleName, address, Long.fromString(tx.version), tx)
        if (tx) {
          handler(tx, ctx)
        }
        return {
          gauges: ctx.gauges,
          counters: ctx.counters,
          logs: ctx.logs,
        }
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
      handler: async function (event) {
        const ctx = new AptosContext(processor.moduleName, processor.config.address, Long.fromString(event.version))
        if (event) {
          const decoded = processor.decodeEvent(event)
          handler(decoded, ctx)
        }
        return {
          gauges: ctx.gauges,
          counters: ctx.counters,
          logs: ctx.logs,
        }
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
        const ctx = new AptosContext(processor.moduleName, processor.config.address, Long.fromString(tx.version), tx)
        if (tx) {
          const payload = tx.payload as TransactionPayload_EntryFunctionPayload
          const decoded = processor.decodeFunctionPayload(payload)
          handler(decoded, ctx)
        }
        return {
          gauges: ctx.gauges,
          counters: ctx.counters,
          logs: ctx.logs,
        }
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
      network: options.network || AptosNetwork.TEST_NET,
    }
  }

  getChainId(): string {
    switch (this.config.network) {
      case AptosNetwork.TEST_NET:
        return APTOS_TESTNET_ID
      case AptosNetwork.MAIN_NET:
        return APTOS_MAINNET_ID
    }
  }

  loadTypes(registry: TypeRegistry) {
    if (registry.contains(this.config.address, this.moduleName)) {
      return
    }
    this.loadTypesInternal(registry)
  }

  protected loadTypesInternal(registry: TypeRegistry) {
    // should be override by subclass
  }

  private decodeEvent(event: EventInstance): EventInstance {
    const registry = GLOBAL_TYPE_REGISTRY
    this.loadTypes(registry)
    // TODO check if module is not loaded

    let dataTyped = undefined
    try {
      dataTyped = registry.decode(event.data, parseMoveType(event.type))
    } catch (e) {
      console.warn('Decoding error for ', event.type)
      return event
    }

    return { ...event, data_typed: dataTyped } as TypedEventInstance<any>
  }

  private decodeFunctionPayload(
    payload: TransactionPayload_EntryFunctionPayload
  ): TransactionPayload_EntryFunctionPayload {
    const registry = GLOBAL_TYPE_REGISTRY
    this.loadTypes(registry)
    const argumentsTyped: any[] = []

    try {
      const func = registry.getMoveFunction(payload.function)
      for (const [idx, arg] of payload.arguments.entries()) {
        // TODO consider apply payload.type_arguments, but this might be hard since we don't code gen for them
        const argType = parseMoveType(func.params[idx + 1])
        argumentsTyped.push(registry.decode(arg, argType))
      }
    } catch (e) {
      console.warn('Decoding error for ', payload.function)
      return payload
    }

    return { ...payload, arguments_typed: argumentsTyped } as TypedEntryFunctionPayload<any>
  }
}
