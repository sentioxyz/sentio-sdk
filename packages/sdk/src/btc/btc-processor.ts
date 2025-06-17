import { ListStateStorage } from '@sentio/runtime'
import { BlockHandler, BTCBlock, BTCBlockContext, BTCContext, BTCOnIntervalFetchConfig, Transaction } from './types.js'
import { Data_BTCBlock, Data_BTCTransaction, HandleInterval, ProcessResult } from '@sentio/protos'
import { TransactionFilters } from './filter.js'
import { HandlerOptions, PromiseOrVoid } from '../core/index.js'
import { ServerError, Status } from 'nice-grpc'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'

export class BTCProcessorState extends ListStateStorage<BTCProcessor> {
  static INSTANCE = new BTCProcessorState()
}

export class BTCProcessor {
  callHandlers: CallHandler<Data_BTCTransaction>[] = []
  blockHandlers: BlockHandler[] = []

  constructor(readonly config: BTCProcessorConfig) {
    return proxyProcessor(this)
  }

  static bind(config: BTCProcessorConfig): BTCProcessor {
    const processor = new BTCProcessor(config)
    BTCProcessorState.INSTANCE.addValue(processor)
    return processor
  }

  public onTransaction(
    handler: (transaction: Transaction, ctx: BTCContext) => void | Promise<void>,
    filter?: TransactionFilters,
    handlerOptions?: HandlerOptions<object, Transaction>
  ) {
    const callHandler = {
      handlerName: getHandlerName(),
      handler: async (call: Data_BTCTransaction) => {
        const tx = call.transaction as Transaction

        const ctx = new BTCContext(
          this.config.chainId,
          this.config.name ?? this.config.address ?? '',
          tx,
          this.config.address ?? tx.vout?.[0]?.scriptPubKey?.address
        )
        await handler(tx, ctx)
        return ctx.stopAndGetResult()
      },
      filter,
      partitionHandler: async (call: Data_BTCTransaction): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const tx = call.transaction as Transaction
          return p(tx)
        }
        return p
      }
    }
    this.callHandlers.push(callHandler)
    return this
  }

  public onInterval(
    handler: (block: BTCBlock, ctx: BTCBlockContext) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    blockInterval: HandleInterval | undefined,
    handlerOptions?: HandlerOptions<BTCOnIntervalFetchConfig, BTCBlock>
  ): this {
    if (timeInterval) {
      if (timeInterval.backfillInterval < timeInterval.recentInterval) {
        timeInterval.backfillInterval = timeInterval.recentInterval
      }
    }

    const processor = this

    this.blockHandlers.push({
      blockInterval,
      timeIntervalInMinutes: timeInterval,
      handlerName: getHandlerName(),
      handler: async function (data: Data_BTCBlock) {
        const header = data.block
        if (!header) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Block is empty')
        }

        const block = {
          ...header
        } as BTCBlock
        if (handlerOptions?.getTransactions) {
          block.tx = header.rawtx?.map((tx: any) => tx as Transaction)
        }

        const ctx = new BTCBlockContext(
          processor.config.chainId,
          processor.config.name ?? processor.config.address ?? '',
          block,
          processor.config.address
        )
        await handler(block, ctx)
        return ctx.stopAndGetResult()
      },
      fetchConfig: handlerOptions,
      partitionHandler: async (data: Data_BTCBlock): Promise<string | undefined> => {
        const p = handlerOptions?.partitionKey
        if (!p) return undefined
        if (typeof p === 'function') {
          const header = data.block
          if (!header) return undefined
          const block = { ...header } as BTCBlock
          if (handlerOptions?.getTransactions) {
            block.tx = header.rawtx?.map((tx: any) => tx as Transaction)
          }
          return p(block)
        }
        return p
      }
    })
    return this
  }

  public onBlockInterval(
    handler: (block: BTCBlock, ctx: BTCBlockContext) => PromiseOrVoid,
    blockInterval = 250,
    backfillBlockInterval = 1000,
    handlerOptions?: HandlerOptions<BTCOnIntervalFetchConfig, BTCBlock>
  ): this {
    return this.onInterval(
      handler,
      undefined,
      {
        recentInterval: blockInterval,
        backfillInterval: backfillBlockInterval
      },
      handlerOptions
    )
  }

  public onTimeInterval(
    handler: (block: BTCBlock, ctx: BTCBlockContext) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    handlerOptions?: HandlerOptions<BTCOnIntervalFetchConfig, BTCBlock>
  ): this {
    return this.onInterval(
      handler,
      { recentInterval: timeIntervalInMinutes, backfillInterval: backfillTimeIntervalInMinutes },
      undefined,
      handlerOptions
    )
  }
}

interface BTCProcessorConfig {
  chainId: string
  name?: string
  address?: string
  startBlock?: bigint
  endBlock?: bigint
}

export type CallHandler<T> = {
  handlerName: string
  handler: (call: T) => Promise<ProcessResult>
  filter?: TransactionFilters
  partitionHandler?: (call: T) => Promise<string | undefined>
}
