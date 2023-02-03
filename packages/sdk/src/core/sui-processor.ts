import { SuiContext } from './context.js'
import { ProcessResult } from '@sentio/protos'
import { ListStateStorage } from '@sentio/runtime'

type IndexConfigure = {
  startSeqNumber: bigint
  endSeqNumber?: bigint
}

export class SuiBindOptions {
  address: string
  // network?: Networkish = 1
  // name?: string
  startBlock?: bigint | number
  // endBlock?: Long | number
}

export class SuiProcessorState extends ListStateStorage<SuiBaseProcessor> {
  static INSTANCE = new SuiProcessorState()
}

export class SuiBaseProcessor {
  public transactionHanlder: (transaction: any, ctx: SuiContext) => void
  address: string
  config: IndexConfigure = { startSeqNumber: 0n }

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

  public handleTransaction(txn: any, slot: bigint): ProcessResult | null {
    const ctx = new SuiContext(this.address, slot)

    if (txn) {
      this.transactionHanlder(txn, ctx)
    }
    return ctx.getProcessResult()
  }

  public startSlot(startSlot: bigint | number) {
    this.config.startSeqNumber = BigInt(startSlot)
    return this
  }

  public endBlock(endBlock: bigint | number) {
    this.config.endSeqNumber = BigInt(endBlock)
    return this
  }
}
