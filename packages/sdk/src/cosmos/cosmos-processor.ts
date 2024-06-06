import { CallHandler, CosmosProcessorConfig, CosmosProcessorState } from './types.js'
import { Data_CosmosCall } from '@sentio/protos'
import { CosmosContext } from './context.js'
import { CosmosEvent, CosmosTransaction, CosmosTxLog } from './transaction.js'

export class CosmosProcessor {
  callHandlers: CallHandler<Data_CosmosCall>[] = []

  constructor(readonly config: CosmosProcessorConfig) {}

  static bind(config: CosmosProcessorConfig): CosmosProcessor {
    const processor = new CosmosProcessor(config)
    CosmosProcessorState.INSTANCE.addValue(processor)
    return processor
  }

  public onLogEvent(
    logFilters: string[] | string,
    handler: (log: CosmosTxLog, event: CosmosEvent, context: CosmosContext) => void | Promise<void>
  ) {
    const filter = Array.isArray(logFilters) ? logFilters : [logFilters]
    const callHandler = {
      handler: async (call: Data_CosmosCall) => {
        const transaction = call.transaction as CosmosTransaction

        const ctx = new CosmosContext(this.config.chainId, this.config.address, transaction)

        for (const log of transaction.logs) {
          const event = log.events.filter((e) => filter.includes(e.type))
          for (const e of event) {
            await handler(log, e, ctx)
          }
        }
        return ctx.stopAndGetResult()
      },
      logConfig: {
        logFilters: filter
      }
    }
    this.callHandlers.push(callHandler)
    return this
  }
}
