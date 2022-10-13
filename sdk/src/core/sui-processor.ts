import { SuiContext } from './context'
import { ProcessResult } from '../gen'
import Long from 'long'

type IndexConfigure = {
  startSeqNumber: Long
  endSeqNumber?: Long
}

export class SuiBindOptions {
  address: string
  // network?: Networkish = 1
  // name?: string
  startBlock?: Long | number
  // endBlock?: Long | number
}

export class SuiBaseProcessor {
  public transactionHanlder: (transaction: any, ctx: SuiContext) => void
  address: string
  config: IndexConfigure = { startSeqNumber: new Long(0) }

  constructor(name: string, options: SuiBindOptions) {
    this.address = options.address
    if (options.startBlock) {
      this.startSlot(options.startBlock)
    }
    global.PROCESSOR_STATE.suiProcessors.push(this)
  }

  public onTransaction(handler: (transaction: any, ctx: SuiContext) => void) {
    this.transactionHanlder = handler
    return this
  }

  public handleTransaction(txn: any, slot: Long): ProcessResult | null {
    const ctx = new SuiContext(this.address, slot)

    if (txn) {
      this.transactionHanlder(txn, ctx)
    }
    return {
      gauges: ctx.gauges,
      counters: ctx.counters,
      logs: ctx.logs,
    }
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
