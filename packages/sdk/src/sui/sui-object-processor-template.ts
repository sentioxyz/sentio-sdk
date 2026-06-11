import {
  type HandleInterval,
  HandleIntervalSchema,
  type MoveAccountFetchConfig,
  type MoveFetchConfig,
  TemplateInstanceSchema
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { ListStateStorage, processMetrics } from '@sentio/runtime'
import { SuiAddressContext, SuiContext, SuiObjectContext } from './context.js'
import type { GrpcTypes } from '@mysten/sui/grpc'
import type { SuiMoveObjectInput } from '@typemove/sui'
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
import { SuiBindOptions } from './sui-processor.js'
import { accountAddressString, TransactionFilter } from '../move/index.js'
import { ConnectError, Code } from '@connectrpc/connect'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'

interface ObjectHandler<HandlerType> {
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
  instances = new Set<string>()

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
      throw new ConnectError("can't bind template instance with *", Code.InvalidArgument)
    }
    id = accountAddressString(id)

    const instance = create(TemplateInstanceSchema, {
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
    })

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

  startInstance(options: OptionType, ctx: SuiContext): void {
    options.network = options.network || ctx.network
    options.startCheckpoint = options.startCheckpoint || ctx.checkpoint
    let id = (options as SuiObjectBindOptions).objectId || (options as SuiBindOptions).address

    if (id === '*') {
      throw new ConnectError("can't bind template instance with *", Code.InvalidArgument)
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

  unbind(options: OptionType, ctx: SuiContext): void {
    options.network = options.network || ctx.network
    options.startCheckpoint = options.startCheckpoint || ctx.checkpoint
    let id = (options as SuiObjectBindOptions).objectId || (options as SuiBindOptions).address

    if (id === '*') {
      throw new ConnectError("can't delete template instance bind with *", Code.InvalidArgument)
    }
    id = accountAddressString(id)

    const sig = [options.network, id].join('_')
    if (!this.instances.has(sig)) {
      console.log(`the template instance ${sig} not existed or already unbind`)
      return
    }
    this.instances.delete(sig)

    const oldProcessors = SuiAccountProcessorState.INSTANCE.unregister()
    let deleted = 0
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
      throw new ConnectError(
        `Failed to delete processor for template ${this.id}, ${sig}. deleted ${deleted} times`,
        Code.InvalidArgument
      )
    }

    console.log(`successfully unbind template ${sig}`)

    ctx.update({
      states: {
        configUpdated: true
      }
    })

    ctx.sendTemplateInstance(
      create(TemplateInstanceSchema, {
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
      }),
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
      create(HandleIntervalSchema, {
        recentInterval: timeIntervalInMinutes,
        backfillInterval: backfillTimeIntervalInMinutes
      }),
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
      create(HandleIntervalSchema, {
        recentInterval: checkpointInterval,
        backfillInterval: backfillCheckpointInterval
      }),
      type,
      fetchConfig
    )
  }
}

interface AddressTransactionHandler {
  handler: (transaction: GrpcTypes.ExecutedTransaction, ctx: SuiContext) => void
  filter?: TransactionFilter
  fetchConfig?: Partial<MoveFetchConfig>
}

export class SuiAddressProcessorTemplate extends SuiObjectOrAddressProcessorTemplate<
  (objects: SuiMoveObjectInput[], ctx: SuiAddressContext) => PromiseOrVoid,
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
    handler: (transaction: GrpcTypes.ExecutedTransaction, ctx: SuiContext) => void,
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
  (self: SuiMoveObjectInput, dynamicFieldObjects: SuiMoveObjectInput[], ctx: SuiObjectContext) => PromiseOrVoid,
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
  (dynamicFieldObjects: SuiMoveObjectInput[], ctx: SuiObjectContext) => PromiseOrVoid,
  SuiObjectBindOptions,
  SuiWrappedObjectProcessor
> {
  createProcessor(options: SuiObjectBindOptions): SuiWrappedObjectProcessor {
    const p = SuiWrappedObjectProcessor.bind(options)
    p.templateId = this.id
    return p
  }
}
