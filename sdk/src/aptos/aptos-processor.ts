import { ProcessResult } from '../gen'
import {
  AptosBindOptions,
  AptosContext,
  AptosNetwork,
  Transaction_UserTransaction,
  TransactionPayload_EntryFunctionPayload,
} from '.'
import type { Event as OldEvent } from 'aptos/src/generated'

import Long from 'long'
import { APTOS_MAINNET_ID, APTOS_TESTNET_ID } from '../utils/chain'

export type Event = OldEvent & { version: string }

type IndexConfigure = {
  address: string
  network: AptosNetwork
  startVersion: Long
  // endSeqNumber?: Long
}

export interface EventFilter {
  type: string
}

export interface CallFilter {
  function: string
  typeArguments?: string[]
}

class EventHandler {
  filters: EventFilter[]
  handler: (event: Event) => Promise<ProcessResult>
}

class CallHandler {
  filters: CallFilter[]
  handler: (call: Transaction_UserTransaction) => Promise<ProcessResult>
}

export class AptosBaseProcessor {
  name: string
  config: IndexConfigure
  eventHandlers: EventHandler[] = []
  callHandlers: CallHandler[] = []

  constructor(options: AptosBindOptions) {
    this.name = options.name || options.address
    this.configure(options)
    global.PROCESSOR_STATE.aptosProcessors.push(this)
  }

  static bind(options: AptosBindOptions): AptosBaseProcessor {
    return new AptosBaseProcessor(options)
  }

  public onTransaction(
    handler: (transaction: Transaction_UserTransaction, ctx: AptosContext) => void
  ): AptosBaseProcessor {
    const address = this.config.address
    this.callHandlers.push({
      handler: async function (tx) {
        const ctx = new AptosContext(address, Long.fromString(tx.version), tx)
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
    handler: (event: Event, ctx: AptosContext) => void,
    filter: EventFilter | EventFilter[]
  ): AptosBaseProcessor {
    let _filters: EventFilter[] = []

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    const address = this.config.address

    this.eventHandlers.push({
      handler: async function (event) {
        const ctx = new AptosContext(address, Long.fromString(event.version))
        if (event) {
          handler(event, ctx)
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
    filter: CallFilter | CallFilter[]
  ): AptosBaseProcessor {
    let _filters: CallFilter[] = []

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    const address = this.config.address

    this.callHandlers.push({
      handler: async function (tx) {
        const ctx = new AptosContext(address, Long.fromString(tx.version), tx)
        if (tx) {
          const payload = tx.payload as TransactionPayload_EntryFunctionPayload
          handler(payload, ctx)
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
}
