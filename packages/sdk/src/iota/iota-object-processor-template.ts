import { HandleInterval, MoveAccountFetchConfig, MoveFetchConfig, TemplateInstance } from '@sentio/protos'
import { ListStateStorage, processMetrics } from '@sentio/runtime'
import { IotaAddressContext, IotaContext, IotaObjectContext } from './context.js'
import { IotaMoveObject, IotaTransactionBlockResponse } from '@iota/iota-sdk/client'
import { PromiseOrVoid } from '../core/index.js'
import {
  DEFAULT_ACCOUNT_FETCH_CONFIG,
  IotaAccountProcessorState,
  IotaAddressProcessor,
  IotaBaseObjectOrAddressProcessor,
  IotaObjectBindOptions,
  IotaObjectProcessor,
  IotaWrappedObjectProcessor
} from './iota-object-processor.js'
import { IotaBindOptions } from './iota-processor.js'
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

export class IotaAccountProcessorTemplateState extends ListStateStorage<
  IotaObjectOrAddressProcessorTemplate<any, any, any>
> {
  static INSTANCE = new IotaAccountProcessorTemplateState()
}

export abstract class IotaObjectOrAddressProcessorTemplate<
  HandlerType,
  OptionType extends IotaObjectBindOptions | IotaBindOptions,
  ProcessorType extends IotaBaseObjectOrAddressProcessor<HandlerType>
> {
  id: number
  objectHandlers: ObjectHandler<HandlerType>[] = []
  instances = new Set<string>()

  constructor() {
    this.id = IotaAccountProcessorTemplateState.INSTANCE.getValues().length
    IotaAccountProcessorTemplateState.INSTANCE.addValue(this)
    return proxyProcessor(this)
  }

  protected abstract createProcessor(options: IotaObjectBindOptions | IotaBindOptions): ProcessorType

  bind(options: OptionType, ctx: IotaContext): void {
    options.network = options.network || ctx.network
    options.startCheckpoint = options.startCheckpoint || ctx.checkpoint
    let id = (options as IotaObjectBindOptions).objectId || (options as IotaBindOptions).address

    if (id === '*') {
      throw new ServerError(Status.INVALID_ARGUMENT, "can't bind template instance with *")
    }
    id = accountAddressString(id)

    const instance: TemplateInstance = {
      templateId: this.id,
      contract: {
        name: '',
        chainId: options.network,
        address: id,
        abi: ''
      },
      startBlock: options.startCheckpoint || 0n,
      endBlock: options.endCheckpoint || 0n,
      baseLabels: options.baseLabels
    }

    ctx.sendTemplateInstance(instance)

    ctx.update({
      states: {
        configUpdated: true
      }
    })

    processMetrics.processor_template_instance_count.add(1, {
      chain_id: options.network,
      template: this.constructor.name
    })
  }

  startInstance(options: OptionType, ctx: IotaContext): void {
    options.network = options.network || ctx.network
    options.startCheckpoint = options.startCheckpoint || ctx.checkpoint
    let id = (options as IotaObjectBindOptions).objectId || (options as IotaBindOptions).address

    if (id === '*') {
      throw new ServerError(Status.INVALID_ARGUMENT, "can't bind template instance with *")
    }
    id = accountAddressString(id)

    const sig = [options.network, id].join('_')
    if (this.instances.has(sig)) {
      console.debug(`Same object id can be bind to one template only once, ignore duplicate bind: ${sig}`)
      return
    }
    this.instances.add(sig)

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
    console.log(`successfully bind template ${sig}`)
  }

  unbind(options: OptionType, ctx: IotaContext): void {
    options.network = options.network || ctx.network
    options.startCheckpoint = options.startCheckpoint || ctx.checkpoint
    let id = (options as IotaObjectBindOptions).objectId || (options as IotaBindOptions).address

    if (id === '*') {
      throw new ServerError(Status.INVALID_ARGUMENT, "can't delete template instance bind with *")
    }
    id = accountAddressString(id)

    const sig = [options.network, id].join('_')
    if (!this.instances.has(sig)) {
      console.log(`the template instance ${sig} not existed or already unbind`)
      return
    }
    this.instances.delete(sig)

    const oldProcessors = IotaAccountProcessorState.INSTANCE.unregister()
    let deleted = 0
    for (const processor of oldProcessors) {
      if (processor.templateId === this.id) {
        if (processor.config.network == options.network && processor.config.address === id) {
          deleted++
          continue
        }
      }
      IotaAccountProcessorState.INSTANCE.addValue(processor)
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
    ctx.sendTemplateInstance(
      {
        templateId: this.id,
        contract: {
          name: '',
          chainId: options.network,
          address: id,
          abi: ''
        },
        startBlock: options.startCheckpoint || 0n,
        endBlock: options.endCheckpoint || 0n,
        baseLabels: options.baseLabels
      },
      true
    )
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
  handler: (transaction: IotaTransactionBlockResponse, ctx: IotaContext) => void
  filter?: TransactionFilter
  fetchConfig?: Partial<MoveFetchConfig>
}

export class IotaAddressProcessorTemplate extends IotaObjectOrAddressProcessorTemplate<
  (objects: IotaMoveObject[], ctx: IotaAddressContext) => PromiseOrVoid,
  IotaBindOptions,
  IotaAddressProcessor
> {
  private handlers: AddressTransactionHandler[] = []

  createProcessor(options: IotaBindOptions): IotaAddressProcessor {
    const p = IotaAddressProcessor.bind(options)
    for (const handler of this.handlers) {
      p.onTransactionBlock(handler.handler, handler.filter, handler.fetchConfig)
    }
    p.templateId = this.id
    return p
  }

  onTransactionBlock(
    handler: (transaction: IotaTransactionBlockResponse, ctx: IotaContext) => void,
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

export class IotaObjectProcessorTemplate extends IotaObjectOrAddressProcessorTemplate<
  (self: IotaMoveObject, dynamicFieldObjects: IotaMoveObject[], ctx: IotaObjectContext) => PromiseOrVoid,
  IotaObjectBindOptions,
  IotaObjectProcessor
> {
  createProcessor(options: IotaObjectBindOptions): IotaObjectProcessor {
    const p = IotaObjectProcessor.bind(options)
    p.templateId = this.id
    return p
  }
}

export class IotaWrappedObjectProcessorTemplate extends IotaObjectOrAddressProcessorTemplate<
  (dynamicFieldObjects: IotaMoveObject[], ctx: IotaObjectContext) => PromiseOrVoid,
  IotaObjectBindOptions,
  IotaWrappedObjectProcessor
> {
  createProcessor(options: IotaObjectBindOptions): IotaWrappedObjectProcessor {
    const p = IotaWrappedObjectProcessor.bind(options)
    p.templateId = this.id
    return p
  }
}
