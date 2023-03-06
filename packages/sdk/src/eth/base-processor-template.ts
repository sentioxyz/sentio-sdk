import { BoundContractView, ContractContext, ContractView } from './context.js'
import { BaseContract } from 'ethers'
import { BaseProcessor } from './base-processor.js'
import { BindOptions, getOptionsSignature } from './bind-options.js'
import { EthFetchConfig, HandleInterval, TemplateInstance } from '@sentio/protos'
import { PromiseOrVoid } from '../promise-or-void.js'
import { Trace } from './trace.js'
import { ListStateStorage } from '@sentio/runtime'
import { BlockParams, Network } from 'ethers/providers'
import { DeferredTopicFilter } from 'ethers/contract'
import { EthEvent } from './eth.js'

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
  }[] = []
  traceHandlers: {
    signature: string
    handler: (trace: Trace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
    fetchConfig?: EthFetchConfig
  }[] = []
  eventHandlers: {
    handler: (event: EthEvent, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
    filter: DeferredTopicFilter | DeferredTopicFilter[]
    fetchConfig?: EthFetchConfig
  }[] = []

  constructor() {
    this.id = ProcessorTemplateProcessorState.INSTANCE.getValues().length
    ProcessorTemplateProcessorState.INSTANCE.addValue(this)
  }

  public bind(options: BindOptions) {
    const sig = getOptionsSignature(options)
    if (this.binds.has(sig)) {
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
      processor.onInterval(bh.handler, bh.timeIntervalInMinutes, bh.blockInterval)
    }

    const instance: TemplateInstance = {
      templateId: this.id,
      contract: {
        address: options.address,
        name: options.name || '',
        chainId: options.network ? Network.from(options.network).chainId.toString() : '1',
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
    return processor
  }

  public onEvent(
    handler: (event: EthEvent, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
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
    backfillBlockInterval = 4000
  ) {
    return this.onInterval(handler, undefined, {
      recentInterval: blockInterval,
      backfillInterval: backfillBlockInterval,
    })
  }

  public onTimeInterval(
    handler: (block: BlockParams, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillBlockInterval = 240
  ) {
    return this.onInterval(
      handler,
      { recentInterval: timeIntervalInMinutes, backfillInterval: backfillBlockInterval },
      undefined
    )
  }

  public onInterval(
    handler: (block: BlockParams, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    blockInterval: HandleInterval | undefined
  ) {
    this.blockHandlers.push({ handler, timeIntervalInMinutes: timeInterval, blockInterval: blockInterval })
    return this
  }

  public onTrace(
    signature: string,
    handler: (trace: Trace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    fetchConfig?: Partial<EthFetchConfig>
  ) {
    this.traceHandlers.push({ signature, handler, fetchConfig: EthFetchConfig.fromPartial(fetchConfig || {}) })
    return this
  }

  protected abstract bindInternal(options: BindOptions): BaseProcessor<TContract, TBoundContractView>
}
