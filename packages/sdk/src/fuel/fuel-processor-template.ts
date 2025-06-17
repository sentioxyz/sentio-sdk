import { FuelContext, FuelContractContext } from './context.js'
import { HandleInterval, TemplateInstance } from '@sentio/protos'
import { PromiseOrVoid } from '../core/promises.js'
import { ListStateStorage } from '@sentio/runtime'
import { TemplateInstanceState } from '../core/template.js'
import { Contract } from 'fuels'
import { FuelBlock, FuelLog, FuelTransaction } from './types.js'
import { DEFAULT_FUEL_FETCH_CONFIG, FuelFetchConfig } from './transaction.js'
import { FuelProcessor, FuelProcessorConfig, getOptionsSignature } from './fuel-processor.js'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'
import { HandlerOptions } from '../core/index.js'

export class FuelProcessorTemplateProcessorState extends ListStateStorage<FuelBaseProcessorTemplate<Contract>> {
  static INSTANCE = new FuelProcessorTemplateProcessorState()
}

export abstract class FuelBaseProcessorTemplate<TContract extends Contract> {
  id: number
  binds = new Set<string>()
  blockHandlers: {
    handlerName: string
    handler: (block: FuelBlock, ctx: FuelContractContext<TContract>) => PromiseOrVoid
    blockInterval?: HandleInterval
    timeIntervalInMinutes?: HandleInterval
    handlerOptions?: HandlerOptions<object, FuelBlock>
    // fetchConfig?: FuelFetchConfig
  }[] = []

  logHandlers: {
    logIdFilter: string | string[]
    handlerName: string
    handler: (logs: FuelLog<any>, ctx: FuelContractContext<TContract>) => PromiseOrVoid
    handlerOptions?: HandlerOptions<object, FuelLog<any>>
    // fetchConfig?: FuelFetchConfig
  }[] = []

  transactionHandlers: {
    handlerName: string
    handler: (transaction: FuelTransaction, ctx: FuelContractContext<TContract>) => PromiseOrVoid
    handlerOptions?: HandlerOptions<FuelFetchConfig, FuelTransaction>
  }[] = []

  constructor() {
    this.id = FuelProcessorTemplateProcessorState.INSTANCE.getValues().length
    FuelProcessorTemplateProcessorState.INSTANCE.addValue(this)
    return proxyProcessor(this)
  }

  /**
   * Bind template using {@param options}, using {@param ctx}'s network value if not provided in the option
   * @param options
   * @param ctx
   */
  public bind(options: Omit<Omit<FuelProcessorConfig, 'chainId'>, 'abi'>, ctx: FuelContext): void {
    const sig = getOptionsSignature({
      address: options.address,
      chainId: ctx.chainId
    })
    if (this.binds.has(sig)) {
      console.log(`Same address can be bind to one template only once, ignore duplicate bind: ${sig}`)
      return
    }
    this.binds.add(sig)

    const processor = this.bindInternal({ ...options, chainId: ctx.chainId })

    for (const eh of this.logHandlers) {
      processor.onLog(eh.logIdFilter, eh.handler, eh.handlerOptions, eh.handlerName)
    }
    for (const bh of this.blockHandlers) {
      processor.onInterval(bh.handler, bh.timeIntervalInMinutes, bh.blockInterval, bh.handlerOptions, bh.handlerName)
    }
    for (const th of this.transactionHandlers) {
      processor.onTransaction(th.handler, th.handlerOptions, th.handlerName)
    }

    const instance: TemplateInstance = {
      templateId: this.id,
      contract: {
        address: options.address,
        name: options.name || '',
        chainId: ctx.chainId,
        abi: ''
      },
      startBlock: BigInt(options.startBlock || 0),
      endBlock: BigInt(options.endBlock || 0),
      baseLabels: {}
      // baseLabels: options.baseLabels
    }
    TemplateInstanceState.INSTANCE.addValue(instance)
    ctx.update({
      states: {
        configUpdated: true
      }
    })
  }

  protected onLog<T>(
    logIdFilter: string | string[],
    handler: (logs: FuelLog<T>, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    handlerOptions: HandlerOptions<object, FuelLog<T>> = {}
    // fetchConfig?: Partial<FuelFetchConfig>
  ) {
    this.logHandlers.push({
      logIdFilter,
      handlerName: getHandlerName(),
      handler,
      handlerOptions
      // fetchConfig: { ...fetchConfig}
    })
    return this
  }

  public onBlockInterval(
    handler: (block: FuelBlock, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    blockInterval = 1000,
    backfillBlockInterval = 4000
    // fetchConfig?: Partial<FuelFetchConfig>
  ) {
    return this.onInterval(
      handler,
      undefined,
      {
        recentInterval: blockInterval,
        backfillInterval: backfillBlockInterval
      }
      // fetchConfig
    )
  }

  public onTimeInterval(
    handler: (block: FuelBlock, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillBlockInterval = 240
    // fetchConfig?: Partial<FuelFetchConfig>
  ) {
    return this.onInterval(
      handler,
      { recentInterval: timeIntervalInMinutes, backfillInterval: backfillBlockInterval },
      undefined
      // fetchConfig
    )
  }

  public onInterval(
    handler: (block: FuelBlock, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    blockInterval: HandleInterval | undefined,
    handlerOptions: HandlerOptions<object, FuelBlock> = {}
    // fetchConfig?: FuelFetchConfig
  ) {
    this.blockHandlers.push({
      handlerName: getHandlerName(),
      handler,
      timeIntervalInMinutes: timeInterval,
      blockInterval,
      handlerOptions
      // fetchConfig: { ...fetchConfig }
    })
    return this
  }

  protected onTransaction(
    handler: (transaction: FuelTransaction, ctx: FuelContractContext<TContract>) => PromiseOrVoid,
    handlerOptions: HandlerOptions<FuelFetchConfig, FuelTransaction> = DEFAULT_FUEL_FETCH_CONFIG
  ) {
    this.transactionHandlers.push({
      handlerName: getHandlerName(),
      handler,
      handlerOptions
    })
    return this
  }

  protected abstract bindInternal(options: Omit<FuelProcessorConfig, 'abi'>): FuelProcessor<TContract>
}
