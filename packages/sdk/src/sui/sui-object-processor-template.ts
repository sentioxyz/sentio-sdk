import { HandleInterval, MoveAccountFetchConfig } from '@sentio/protos'
import { ListStateStorage } from '@sentio/runtime'
import { SuiContext, SuiObjectContext } from './context.js'
import { SuiMoveObject } from '@mysten/sui.js'
import { PromiseOrVoid } from '../core/index.js'
import {
  DEFAULT_FETCH_CONFIG,
  SuiBaseObjectOrAddressProcessor,
  SuiObjectBindOptions,
  SuiObjectProcessor,
  SuiWrappedObjectProcessor,
} from './sui-object-processor.js'
import { TemplateInstanceState } from '../core/template.js'

class ObjectHandler<HandlerType> {
  type?: string
  checkpointInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handler: HandlerType
  fetchConfig: MoveAccountFetchConfig
}

export class SuiAccountProcessorTemplateState extends ListStateStorage<SuiObjectOrAddressProcessorTemplate<any, any>> {
  static INSTANCE = new SuiAccountProcessorTemplateState()
}

export abstract class SuiObjectOrAddressProcessorTemplate<
  HandlerType,
  // OptionType,
  ProcessorType extends SuiBaseObjectOrAddressProcessor<HandlerType>
> {
  id: number
  objectHandlers: ObjectHandler<HandlerType>[] = []
  binds = new Set<string>()

  constructor() {
    this.id = SuiAccountProcessorTemplateState.INSTANCE.getValues().length
    SuiAccountProcessorTemplateState.INSTANCE.addValue(this)
  }

  protected abstract createProcessor(options: SuiObjectBindOptions): ProcessorType

  bind(options: SuiObjectBindOptions, ctx: SuiContext): void {
    options.network = options.network || ctx.network
    options.startCheckpoint = options.startCheckpoint || ctx.checkpoint
    const sig = [options.network, options.objectId].join('_')
    if (this.binds.has(sig)) {
      console.log(`Same object id can be bind to one template only once, ignore duplicate bind: ${sig}`)
      return
    }
    this.binds.add(sig)

    const processor = this.createProcessor(options)
    for (const h of this.objectHandlers) {
      processor.onInterval(h.handler, h.timeIntervalInMinutes, h.checkpointInterval, h.type, h.fetchConfig)
    }
    const config = processor.config

    ctx.update({
      states: {
        configUpdated: true,
      },
    })
    TemplateInstanceState.INSTANCE.addValue({
      templateId: this.id,
      contract: {
        name: '',
        chainId: config.network,
        address: config.address,
        abi: '',
      },
      startBlock: config.startCheckpoint,
      endBlock: 0n,
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
      handler: handler,
      timeIntervalInMinutes: timeInterval,
      checkpointInterval: checkpointInterval,
      type,
      fetchConfig: { ...DEFAULT_FETCH_CONFIG, ...fetchConfig },
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
        backfillInterval: backfillTimeIntervalInMinutes,
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

// export class SuiAddressProcessorTemplate extends SuiBaseObjectsProcessorTemplate<
//   (objects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
//   SuiBindOptions,
//   SuiAddressProcessor
// > {
//   bind(options: SuiBindOptions, ctx: SuiContext): SuiAddressProcessor {
//     return this.bindInternal(SuiAddressProcessorTemplate.bind(options), ctx)
//   }
// }

export class SuiObjectProcessorTemplate extends SuiObjectOrAddressProcessorTemplate<
  (self: SuiMoveObject, dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid,
  // SuiObjectBindOptions,
  SuiObjectProcessor
> {
  createProcessor(options: SuiObjectBindOptions): SuiObjectProcessor {
    return SuiObjectProcessor.bind(options)
  }
}

export class SuiWrappedObjectProcessorTemplate extends SuiObjectOrAddressProcessorTemplate<
  (dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid,
  // SuiObjectBindOptions,
  SuiWrappedObjectProcessor
> {
  createProcessor(options: SuiObjectBindOptions): SuiWrappedObjectProcessor {
    return SuiWrappedObjectProcessor.bind(options)
  }
}
