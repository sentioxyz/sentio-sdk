import { SuiContext } from './context'
import { ProcessResult } from '@sentio/protos'
import Long from 'long'
import { ListStateStorage } from '@sentio/base'

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

export class SuiProcessorState extends ListStateStorage<SuiBaseProcessor> {
  static INSTANCE = new SuiProcessorState()
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
    SuiProcessorState.INSTANCE.addValue(this)
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
    return ctx.getProcessResult()
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
