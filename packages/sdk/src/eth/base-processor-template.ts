import { BoundContractView, ContractContext, ContractView, EthContext } from './context.js'
import { BaseContract } from 'ethers'
import { BaseProcessor } from './base-processor.js'
import { BindOptions, getOptionsSignature } from './bind-options.js'
import { EthFetchConfig, HandleInterval, TemplateInstance } from '@sentio/protos'
import { PromiseOrVoid } from '../core/promises.js'
import { ListStateStorage } from '@sentio/runtime'
import { BlockParams } from 'ethers/providers'
import { DeferredTopicFilter } from 'ethers/contract'
import { TypedEvent, TypedCallTrace } from './eth.js'

export class ProcessorTemplateProcessorState extends ListStateStorage<
  BaseProcessorTemplate<BaseContract, BoundContractView<BaseContract, any>>
> {
  static INSTANCE = new ProcessorTemplateProcessorState()
}

export class TemplateInstanceState extends ListStateStorage<TemplateInstance> {
  static INSTANCE = new TemplateInstanceState()
}

export abstract class BaseProcessorTemplate<
  TContract extends BaseContract,
  TBoundContractView extends BoundContractView<TContract, ContractView<TContract>>
> {
  id: number
  binds = new Set<string>()
  blockHandlers: {
    handler: (block: BlockParams, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
    blockInterval?: HandleInterval
    timeIntervalInMinutes?: HandleInterval
    fetchConfig?: EthFetchConfig
  }[] = []
  traceHandlers: {
    signature: string
    handler: (trace: TypedCallTrace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
    fetchConfig?: EthFetchConfig
  }[] = []
  eventHandlers: {
    handler: (event: TypedEvent, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
    filter: DeferredTopicFilter | DeferredTopicFilter[]
    fetchConfig?: EthFetchConfig
  }[] = []

  constructor() {
    this.id = ProcessorTemplateProcessorState.INSTANCE.getValues().length
    ProcessorTemplateProcessorState.INSTANCE.addValue(this)
  }

  /**
   * Bind template using {@param options}, using {@param ctx}'s network value if not provided in the option
   * @param options
   * @param ctx
   */
  public bind(options: BindOptions, ctx: EthContext): void {
    if (!options.network) {
      options.network = ctx.getChainId()
    }
    const sig = getOptionsSignature({
      address: options.address,
      network: options.network,
    })
    if (this.binds.has(sig)) {
      console.log(`Same address can be bind to one template only once, ignore duplicate bind: ${sig}`)
      return
    }
    this.binds.add(sig)

    const processor = this.bindInternal(options)

    for (const eh of this.eventHandlers) {
      processor.onEvent(eh.handler, eh.filter, eh.fetchConfig)
    }
    for (const th of this.traceHandlers) {
      processor.onTrace(th.signature, th.handler, th.fetchConfig)
    }
    for (const bh of this.blockHandlers) {
      processor.onInterval(bh.handler, bh.timeIntervalInMinutes, bh.blockInterval, bh.fetchConfig)
    }

    const instance: TemplateInstance = {
      templateId: this.id,
      contract: {
        address: options.address,
        name: options.name || '',
        chainId: options.network,
        abi: '',
      },
      startBlock: 0n,
      endBlock: 0n,
    }
    if (options.startBlock) {
      instance.startBlock = BigInt(options.startBlock)
    }
    if (options.endBlock) {
      instance.endBlock = BigInt(options.endBlock)
    }
    TemplateInstanceState.INSTANCE.addValue(instance)
    ctx._res.states.configUpdated = true
  }

  public onEvent(
    handler: (event: TypedEvent, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    filter: DeferredTopicFilter | DeferredTopicFilter[],
    fetchConfig?: Partial<EthFetchConfig>
  ) {
    this.eventHandlers.push({
      handler: handler,
      filter: filter,
      fetchConfig: EthFetchConfig.fromPartial(fetchConfig || {}),
    })
    return this
  }

  public onBlockInterval(
    handler: (block: BlockParams, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    blockInterval = 1000,
    backfillBlockInterval = 4000,
    fetchConfig?: EthFetchConfig
  ) {
    return this.onInterval(
      handler,
      undefined,
      {
        recentInterval: blockInterval,
        backfillInterval: backfillBlockInterval,
      },
      fetchConfig
    )
  }

  public onTimeInterval(
    handler: (block: BlockParams, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillBlockInterval = 240,
    fetchConfig?: EthFetchConfig
  ) {
    return this.onInterval(
      handler,
      { recentInterval: timeIntervalInMinutes, backfillInterval: backfillBlockInterval },
      undefined,
      fetchConfig
    )
  }

  public onInterval(
    handler: (block: BlockParams, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    blockInterval: HandleInterval | undefined,
    fetchConfig: EthFetchConfig | undefined
  ) {
    this.blockHandlers.push({ handler, timeIntervalInMinutes: timeInterval, blockInterval, fetchConfig })
    return this
  }

  public onTrace(
    signature: string,
    handler: (trace: TypedCallTrace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    fetchConfig?: Partial<EthFetchConfig>
  ) {
    this.traceHandlers.push({ signature, handler, fetchConfig: EthFetchConfig.fromPartial(fetchConfig || {}) })
    return this
  }

  protected abstract bindInternal(options: BindOptions): BaseProcessor<TContract, TBoundContractView>
}
