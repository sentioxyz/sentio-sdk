import { HandleInterval, MoveAccountFetchConfig, MoveFetchConfig } from '@sentio/protos'
import { ListStateStorage } from '@sentio/runtime'
import { SuiAddressContext, SuiContext, SuiObjectContext } from './context.js'
import { SuiMoveObject, SuiTransactionBlockResponse } from '@mysten/sui/client'
import { PromiseOrVoid } from '../core/index.js'
import {
  DEFAULT_ACCOUNT_FETCH_CONFIG,
  SuiAccountProcessorState,
  SuiAddressProcessor,
  SuiBaseObjectOrAddressProcessor,
  SuiObjectBindOptions,
  SuiObjectProcessor,
  SuiWrappedObjectProcessor
} from './sui-object-processor.js'
import { TemplateInstanceState } from '../core/template.js'
import { SuiBindOptions } from './sui-processor.js'
import { TransactionFilter, accountAddressString } from '../move/index.js'
import { ServerError, Status } from 'nice-grpc'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'

class ObjectHandler<HandlerType> {
  type?: string
  checkpointInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handlerName: string
  handler: HandlerType
  fetchConfig: MoveAccountFetchConfig
}

export class SuiAccountProcessorTemplateState extends ListStateStorage<
  SuiObjectOrAddressProcessorTemplate<any, any, any>
> {
  static INSTANCE = new SuiAccountProcessorTemplateState()
}

export abstract class SuiObjectOrAddressProcessorTemplate<
  HandlerType,
  OptionType extends SuiObjectBindOptions | SuiBindOptions,
  ProcessorType extends SuiBaseObjectOrAddressProcessor<HandlerType>
> {
  id: number
  objectHandlers: ObjectHandler<HandlerType>[] = []
  binds = new Set<string>()

  constructor() {
    this.id = SuiAccountProcessorTemplateState.INSTANCE.getValues().length
    SuiAccountProcessorTemplateState.INSTANCE.addValue(this)
    return proxyProcessor(this)
  }

  protected abstract createProcessor(options: SuiObjectBindOptions | SuiBindOptions): ProcessorType

  bind(options: OptionType, ctx: SuiContext): void {
    options.network = options.network || ctx.network
    options.startCheckpoint = options.startCheckpoint || ctx.checkpoint
    let id = (options as SuiObjectBindOptions).objectId || (options as SuiBindOptions).address

    if (id === '*') {
      throw new ServerError(Status.INVALID_ARGUMENT, "can't bind template instance with *")
    }
    id = accountAddressString(id)

    const sig = [options.network, id].join('_')
    if (this.binds.has(sig)) {
      console.log(`Same object id can be bind to one template only once, ignore duplicate bind: ${sig}`)
      return
    }
    this.binds.add(sig)

    const processor = this.createProcessor(options)
    for (const h of this.objectHandlers) {
      processor.onInterval(
        h.handler,
        h.timeIntervalInMinutes,
        h.checkpointInterval,
        h.type,
        h.fetchConfig,
        h.handlerName
      )
    }
    const config = processor.config

    ctx.update({
      states: {
        configUpdated: true
      }
    })
    TemplateInstanceState.INSTANCE.addValue({
      templateId: this.id,
      contract: {
        name: '',
        chainId: config.network,
        address: config.address,
        abi: ''
      },
      startBlock: config.startCheckpoint,
      endBlock: config.endCheckpoint || 0n,
      baseLabels: config.baseLabels
    })
    console.log(`successfully bind template ${sig}`)
  }

  unbind(options: OptionType, ctx: SuiContext): void {
    options.network = options.network || ctx.network
    options.startCheckpoint = options.startCheckpoint || ctx.checkpoint
    let id = (options as SuiObjectBindOptions).objectId || (options as SuiBindOptions).address

    if (id === '*') {
      throw new ServerError(Status.INVALID_ARGUMENT, "can't delete template instance bind with *")
    }
    id = accountAddressString(id)

    const sig = [options.network, id].join('_')
    if (!this.binds.has(sig)) {
      console.log(`the template instance ${sig} not existed or already unbind`)
      return
    }
    this.binds.delete(sig)

    let deleted = 0
    const oldTemplateInstances = TemplateInstanceState.INSTANCE.unregister()
    for (const templateInstance of oldTemplateInstances) {
      if (templateInstance.contract?.chainId === options.network && templateInstance.contract.address == id) {
        deleted++
        continue
      }
      TemplateInstanceState.INSTANCE.addValue(templateInstance)
    }

    if (deleted !== 1) {
      throw new ServerError(
        Status.INVALID_ARGUMENT,
        `Failed to delete template instance ${sig}, deleted ${deleted} times`
      )
    }

    const oldProcessors = SuiAccountProcessorState.INSTANCE.unregister()
    deleted = 0
    for (const processor of oldProcessors) {
      if (processor.templateId === this.id) {
        if (processor.config.network == options.network && processor.config.address === id) {
          deleted++
          continue
        }
      }
      SuiAccountProcessorState.INSTANCE.addValue(processor)
    }

    if (deleted !== 1) {
      throw new ServerError(
        Status.INVALID_ARGUMENT,
        `Failed to delete processor for template ${this.id}, ${sig}. deleted ${deleted} times`
      )
    }

    console.log(`successfully unbind template ${sig}`)

    ctx.update({
      states: {
        configUpdated: true
      }
    })
  }

  protected onInterval(
    handler: HandlerType,
    timeInterval: HandleInterval | undefined,
    checkpointInterval: HandleInterval | undefined,
    type: string | undefined,
    fetchConfig: Partial<MoveAccountFetchConfig> | undefined
  ): this {
    this.objectHandlers.push({
      handlerName: getHandlerName(),
      handler: handler,
      timeIntervalInMinutes: timeInterval,
      checkpointInterval: checkpointInterval,
      type,
      fetchConfig: { ...DEFAULT_ACCOUNT_FETCH_CONFIG, ...fetchConfig }
    })
    return this
  }

  public onTimeInterval(
    handler: HandlerType,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    type?: string,
    fetchConfig?: Partial<MoveAccountFetchConfig>
  ): this {
    return this.onInterval(
      handler,
      {
        recentInterval: timeIntervalInMinutes,
        backfillInterval: backfillTimeIntervalInMinutes
      },
      undefined,
      type,
      fetchConfig
    )
  }

  public onCheckpointInterval(
    handler: HandlerType,
    checkpointInterval = 100000,
    backfillCheckpointInterval = 400000,
    type?: string,
    fetchConfig?: Partial<MoveAccountFetchConfig>
  ): this {
    return this.onInterval(
      handler,
      undefined,
      { recentInterval: checkpointInterval, backfillInterval: backfillCheckpointInterval },
      type,
      fetchConfig
    )
  }
}

class AddressTransactionHandler {
  handler: (transaction: SuiTransactionBlockResponse, ctx: SuiContext) => void
  filter?: TransactionFilter
  fetchConfig?: Partial<MoveFetchConfig>
}

export class SuiAddressProcessorTemplate extends SuiObjectOrAddressProcessorTemplate<
  (objects: SuiMoveObject[], ctx: SuiAddressContext) => PromiseOrVoid,
  SuiBindOptions,
  SuiAddressProcessor
> {
  private handlers: AddressTransactionHandler[] = []

  createProcessor(options: SuiBindOptions): SuiAddressProcessor {
    const p = SuiAddressProcessor.bind(options)
    for (const handler of this.handlers) {
      p.onTransactionBlock(handler.handler, handler.filter, handler.fetchConfig)
    }
    p.templateId = this.id
    return p
  }

  onTransactionBlock(
    handler: (transaction: SuiTransactionBlockResponse, ctx: SuiContext) => void,
    filter?: TransactionFilter,
    fetchConfig?: Partial<MoveFetchConfig>
  ): this {
    this.handlers.push({
      handler,
      filter,
      fetchConfig
    })
    return this
  }
}

export class SuiObjectProcessorTemplate extends SuiObjectOrAddressProcessorTemplate<
  (self: SuiMoveObject, dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid,
  SuiObjectBindOptions,
  SuiObjectProcessor
> {
  createProcessor(options: SuiObjectBindOptions): SuiObjectProcessor {
    const p = SuiObjectProcessor.bind(options)
    p.templateId = this.id
    return p
  }
}

export class SuiWrappedObjectProcessorTemplate extends SuiObjectOrAddressProcessorTemplate<
  (dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid,
  SuiObjectBindOptions,
  SuiWrappedObjectProcessor
> {
  createProcessor(options: SuiObjectBindOptions): SuiWrappedObjectProcessor {
    const p = SuiWrappedObjectProcessor.bind(options)
    p.templateId = this.id
    return p
  }
}
