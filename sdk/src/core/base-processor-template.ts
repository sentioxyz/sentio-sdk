import { BoundContractView, ContractContext, ContractView } from './context'
import { Block } from '@ethersproject/abstract-provider'
import { BaseContract, EventFilter } from 'ethers'
import { Event } from '@ethersproject/contracts'
import { BaseProcessor } from './base-processor'
import { BindOptions, getOptionsSignature } from './bind-options'
import { TemplateInstance } from '../gen'
import Long from 'long'
import { getNetwork } from '@ethersproject/providers'
import { PromiseOrVoid } from '../promise-or-void'
import { Trace } from './trace'

export abstract class BaseProcessorTemplate<
  TContract extends BaseContract,
  TBoundContractView extends BoundContractView<TContract, ContractView<TContract>>
> {
  id: number
  binds = new Set<string>()
  blockHandlers: {
    handler: (block: Block, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
    blockInterval?: number
    timeIntervalInMinutes?: number
  }[] = []
  traceHandlers: {
    signature: string
    handler: (trace: Trace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
  }[] = []
  eventHandlers: {
    handler: (event: Event, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
    filter: EventFilter | EventFilter[]
  }[] = []

  constructor() {
    this.id = global.PROCESSOR_STATE.templates.length
    global.PROCESSOR_STATE.templates.push(this)
  }

  public bind(options: BindOptions) {
    const sig = getOptionsSignature(options)
    if (this.binds.has(sig)) {
      return
    }
    this.binds.add(sig)

    const processor = this.bindInternal(options)

    for (const eh of this.eventHandlers) {
      processor.onEvent(eh.handler, eh.filter)
    }
    for (const bh of this.blockHandlers) {
      processor.onInterval(bh.handler, bh.timeIntervalInMinutes, bh.blockInterval)
    }

    const instance: TemplateInstance = {
      templateId: this.id,
      contract: {
        address: options.address,
        name: options.name || '',
        chainId: options.network ? getNetwork(options.network).chainId.toString() : '1',
        abi: '',
      },
      startBlock: Long.ZERO,
      endBlock: Long.ZERO,
    }
    if (options.startBlock) {
      if (typeof options.startBlock === 'number') {
        instance.startBlock = Long.fromNumber(options.startBlock)
      } else {
        instance.startBlock = options.startBlock
      }
    }
    if (options.endBlock) {
      if (typeof options.endBlock === 'number') {
        instance.endBlock = Long.fromNumber(options.endBlock)
      } else {
        instance.endBlock = options.endBlock
      }
    }
    global.PROCESSOR_STATE.templatesInstances.push(instance)

    return processor
  }

  public onEvent(
    handler: (event: Event, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    filter: EventFilter | EventFilter[]
  ) {
    this.eventHandlers.push({
      handler: handler,
      filter: filter,
    })
    return this
  }

  public onBlock(handler: (block: Block, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid) {
    return this.onBlockInterval(handler)
  }

  public onBlockInterval(
    handler: (block: Block, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    blockInterval = 1000
  ) {
    return this.onInterval(handler, undefined, blockInterval)
  }

  public onTimeInterval(
    handler: (block: Block, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeIntervalInMinutes = 240
  ) {
    return this.onInterval(handler, timeIntervalInMinutes, undefined)
  }

  public onInterval(
    handler: (block: Block, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeInterval: number | undefined,
    blockInterval: number | undefined
  ) {
    this.blockHandlers.push({ handler, timeIntervalInMinutes: timeInterval, blockInterval: blockInterval })
    return this
  }

  public onTrace(
    signature: string,
    handler: (trace: Trace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
  ) {
    this.traceHandlers.push({ signature, handler })
    return this
  }

  protected abstract bindInternal(options: BindOptions): BaseProcessor<TContract, TBoundContractView>
}
