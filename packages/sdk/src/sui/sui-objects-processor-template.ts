import { HandleInterval, MoveAccountFetchConfig } from '@sentio/protos'
import { ListStateStorage } from '@sentio/runtime'
import { SuiContext, SuiObjectsContext } from './context.js'
import { SuiMoveObject } from '@mysten/sui.js'
import { PromiseOrVoid } from '../core/index.js'
import {
  DEFAULT_FETCH_CONFIG,
  SuiBaseObjectsProcessor,
  SuiObjectBindOptions,
  SuiObjectProcessor,
  SuiWrappedObjectProcessor,
} from './sui-object-processor.js'
import { TemplateInstanceState } from '../core/template.js'

class ObjectHandler<HandlerType> {
  type?: string
  versionInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handler: HandlerType
  fetchConfig: MoveAccountFetchConfig
}

export class SuiAccountProcessorTemplateState extends ListStateStorage<SuiBaseObjectsProcessorTemplate<any, any>> {
  static INSTANCE = new SuiAccountProcessorTemplateState()
}

export abstract class SuiBaseObjectsProcessorTemplate<
  HandlerType,
  // OptionType,
  ProcessorType extends SuiBaseObjectsProcessor<HandlerType>
> {
  id: number
  objectHandlers: ObjectHandler<HandlerType>[] = []
  binds = new Set<string>()

  protected constructor() {
    this.id = SuiAccountProcessorTemplateState.INSTANCE.getValues().length
    SuiAccountProcessorTemplateState.INSTANCE.addValue(this)
  }

  abstract createProcessor(options: SuiObjectBindOptions): ProcessorType

  bind(options: SuiObjectBindOptions, ctx: SuiContext): void {
    options.network = options.network || ctx.network
    const sig = [options.network, options.objectId].join('_')
    if (this.binds.has(sig)) {
      console.log(`Same object id can be bind to one template only once, ignore duplicate bind: ${sig}`)
      return
    }
    this.binds.add(sig)

    const processor = this.createProcessor(options)
    for (const h of this.objectHandlers) {
      processor.onInterval(h.handler, h.timeIntervalInMinutes, h.versionInterval, h.type, h.fetchConfig)
    }
    const config = processor.config

    ctx._res.states.configUpdated = true
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
    versionInterval: HandleInterval | undefined,
    type: string | undefined,
    fetchConfig: Partial<MoveAccountFetchConfig> | undefined
  ): this {
    this.objectHandlers.push({
      handler: handler,
      timeIntervalInMinutes: timeInterval,
      versionInterval: versionInterval,
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

  public onSlotInterval(
    handler: HandlerType,
    slotInterval = 100000,
    backfillSlotInterval = 400000,
    type?: string,
    fetchConfig?: Partial<MoveAccountFetchConfig>
  ): this {
    return this.onInterval(
      handler,
      undefined,
      { recentInterval: slotInterval, backfillInterval: backfillSlotInterval },
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

export class SuiObjectsProcessorTemplate extends SuiBaseObjectsProcessorTemplate<
  (self: SuiMoveObject, dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
  // SuiObjectBindOptions,
  SuiObjectProcessor
> {
  createProcessor(options: SuiObjectBindOptions): SuiObjectProcessor {
    return SuiObjectProcessor.bind(options)
  }
}

export class SuiWrappedObjectProcessorTemplate extends SuiBaseObjectsProcessorTemplate<
  (dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
  // SuiObjectBindOptions,
  SuiWrappedObjectProcessor
> {
  createProcessor(options: SuiObjectBindOptions): SuiWrappedObjectProcessor {
    return SuiWrappedObjectProcessor.bind(options)
  }
}
