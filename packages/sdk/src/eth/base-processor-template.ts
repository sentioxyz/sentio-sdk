import { BoundContractView, ContractContext, ContractView, EthContext } from './context.js'
import { BaseContract } from 'ethers'
import { BaseProcessor, defaultPreprocessHandler } from './base-processor.js'
import { BindOptions, getOptionsSignature } from './bind-options.js'
import { EthFetchConfig, HandleInterval, TemplateInstance, PreprocessResult } from '@sentio/protos'
import { PromiseOrVoid } from '../core/promises.js'
import { ListStateStorage } from '@sentio/runtime'
import { BlockParams } from 'ethers/providers'
import { DeferredTopicFilter } from 'ethers/contract'
import { TypedEvent, TypedCallTrace } from './eth.js'
import { TemplateInstanceState } from '../core/template.js'

export class ProcessorTemplateProcessorState extends ListStateStorage<
  BaseProcessorTemplate<BaseContract, BoundContractView<BaseContract, any>>
> {
  static INSTANCE = new ProcessorTemplateProcessorState()
}

export abstract class BaseProcessorTemplate<
  TContract extends BaseContract,
  TBoundContractView extends BoundContractView<TContract, ContractView<TContract>>
> {
  id: number
  binds = new Set<string>()
  blockHandlers: {
    handler: (block: BlockParams, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
    preprocessHandler: (
      block: BlockParams,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult>
    blockInterval?: HandleInterval
    timeIntervalInMinutes?: HandleInterval
    fetchConfig?: EthFetchConfig
  }[] = []
  traceHandlers: {
    signature: string
    handler: (trace: TypedCallTrace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
    preprocessHandler: (
      trace: TypedCallTrace,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult>
    fetchConfig?: EthFetchConfig
  }[] = []
  eventHandlers: {
    handler: (event: TypedEvent, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
    preprocessHandler: (
      event: TypedEvent,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult>
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
  public bind(options: Omit<BindOptions, 'network'>, ctx: EthContext): void {
    const sig = getOptionsSignature({
      address: options.address,
      network: ctx.chainId
    })
    if (this.binds.has(sig)) {
      console.log(`Same address can be bind to one template only once, ignore duplicate bind: ${sig}`)
      return
    }
    this.binds.add(sig)

    const processor = this.bindInternal({ ...options, network: ctx.chainId })

    for (const eh of this.eventHandlers) {
      // @ts-ignore friendly
      processor.onEthEvent(eh.handler, eh.filter, eh.fetchConfig, eh.preprocessHandler)
    }
    for (const th of this.traceHandlers) {
      // @ts-ignore friendly
      processor.onEthTrace(th.signature, th.handler, th.fetchConfig, th.preprocessHandler)
    }
    for (const bh of this.blockHandlers) {
      processor.onInterval(bh.handler, bh.timeIntervalInMinutes, bh.blockInterval, bh.fetchConfig, bh.preprocessHandler)
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
      baseLabels: options.baseLabels
    }
    TemplateInstanceState.INSTANCE.addValue(instance)
    ctx.update({
      states: {
        configUpdated: true
      }
    })
  }

  protected onEthEvent(
    handler: (event: TypedEvent, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    filter: DeferredTopicFilter | DeferredTopicFilter[],
    fetchConfig?: Partial<EthFetchConfig>,
    preprocessHandler: (
      event: TypedEvent,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ) {
    this.eventHandlers.push({
      handler: handler,
      preprocessHandler,
      filter: filter,
      fetchConfig: EthFetchConfig.fromPartial(fetchConfig || {})
    })
    return this
  }

  public onBlockInterval(
    handler: (block: BlockParams, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    blockInterval = 1000,
    backfillBlockInterval = 4000,
    fetchConfig?: EthFetchConfig,
    preprocessHandler: (
      block: BlockParams,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ) {
    return this.onInterval(
      handler,
      undefined,
      {
        recentInterval: blockInterval,
        backfillInterval: backfillBlockInterval
      },
      fetchConfig,
      preprocessHandler
    )
  }

  public onTimeInterval(
    handler: (block: BlockParams, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillBlockInterval = 240,
    fetchConfig?: EthFetchConfig,
    preprocessHandler: (
      block: BlockParams,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ) {
    return this.onInterval(
      handler,
      { recentInterval: timeIntervalInMinutes, backfillInterval: backfillBlockInterval },
      undefined,
      fetchConfig,
      preprocessHandler
    )
  }

  public onInterval(
    handler: (block: BlockParams, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    blockInterval: HandleInterval | undefined,
    fetchConfig: EthFetchConfig | undefined,
    preprocessHandler: (
      block: BlockParams,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ) {
    this.blockHandlers.push({
      handler,
      preprocessHandler,
      timeIntervalInMinutes: timeInterval,
      blockInterval,
      fetchConfig
    })
    return this
  }

  public onTrace(
    signature: string,
    handler: (trace: TypedCallTrace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    fetchConfig?: Partial<EthFetchConfig>,
    preprocessHandler: (
      trace: TypedCallTrace,
      ctx: ContractContext<TContract, TBoundContractView>,
      preprocessStore: { [k: string]: any }
    ) => Promise<PreprocessResult> = defaultPreprocessHandler
  ) {
    this.traceHandlers.push({
      signature,
      handler,
      preprocessHandler,
      fetchConfig: EthFetchConfig.fromPartial(fetchConfig || {})
    })
    return this
  }

  protected abstract bindInternal(options: BindOptions): BaseProcessor<TContract, TBoundContractView>
}
