import { ListStateStorage } from '@sentio/runtime'
import { BTCContext, Transaction } from './types.js'
import { Data_BTCTransaction, ProcessResult } from '@sentio/protos'

export class BTCProcessorState extends ListStateStorage<BTCProcessor> {
  static INSTANCE = new BTCProcessorState()
}

export class BTCProcessor {
  callHandlers: CallHandler<Data_BTCTransaction>[] = []

  constructor(readonly config: BTCProcessorConfig) {}

  static bind(config: BTCProcessorConfig): BTCProcessor {
    const processor = new BTCProcessor(config)
    BTCProcessorState.INSTANCE.addValue(processor)
    return processor
  }

  public onTransaction(handler: (transaction: Transaction, ctx: BTCContext) => void | Promise<void>) {
    const callHandler = {
      handler: async (call: Data_BTCTransaction) => {
        const tx = call.transaction as Transaction

        const ctx = new BTCContext(
          this.config.chainId,
          this.config.name ?? this.config.address ?? '',
          tx,
          this.config.address
        )
        await handler(tx, ctx)
        return ctx.stopAndGetResult()
      }
    }
    this.callHandlers.push(callHandler)
    return this
  }
}

interface BTCProcessorConfig {
  chainId: string
  name?: string
  address: string
  startBlock?: bigint
  endBlock?: bigint
}

export type CallHandler<T> = {
  handler: (call: T) => Promise<ProcessResult>
}
