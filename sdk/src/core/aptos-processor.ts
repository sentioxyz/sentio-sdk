import { AptosBindOptions } from './bind-options'
import { AptosContext } from './context'
import { ProcessResult } from '..'
import Long from 'long'

type IndexConfigure = {
  startSeqNumber: Long
  endSeqNumber?: Long
}

export class AptosBaseProcessor {
  public transactionHanlder: (transaction: any, ctx: AptosContext) => void
  address: string
  name: string
  config: IndexConfigure = { startSeqNumber: new Long(0) }

  constructor(options: AptosBindOptions) {
    if (options) {
      this.bind(options)
    }
    global.PROCESSOR_STATE.aptosProcessors.push(this)
  }

  bind(options: AptosBindOptions) {
    this.address = options.address
    this.name = options.name || this.address
    if (options.startBlock) {
      this.startSlot(options.startBlock)
    }
    if (options.endBlock) {
      this.endBlock(options.endBlock)
    }
  }

  public onTransaction(handler: (transaction: any, ctx: AptosContext) => void) {
    if (!this.isBind()) {
      throw new Error("Processor doesn't bind to an address")
    }

    this.transactionHanlder = handler

    return this
  }

  public handleTransaction(txn: any, slot: Long): ProcessResult | null {
    const ctx = new AptosContext(this.address, slot)

    if (txn) {
      this.transactionHanlder(txn, ctx)
    }
    return {
      gauges: ctx.gauges,
      counters: ctx.counters,
      logs: ctx.logs,
    }
  }

  public isBind() {
    return this.address !== null
  }

  public startSlot(startSlot: Long | number) {
    if (typeof startSlot === 'number') {
      startSlot = Long.fromNumber(startSlot)
    }
    this.config.startSeqNumber = startSlot
    return this
  }

  public endBlock(endBlock: Long | number) {
    if (typeof endBlock === 'number') {
      endBlock = Long.fromNumber(endBlock)
    }
    this.config.endSeqNumber = endBlock
    return this
  }
}
