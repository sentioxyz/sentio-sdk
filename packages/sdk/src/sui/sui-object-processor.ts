import { Data_SuiObject, HandleInterval, MoveAccountFetchConfig, MoveOwnerType, ProcessResult } from '@sentio/protos'
import { ListStateStorage } from '@sentio/runtime'
import { SuiNetwork } from './network.js'
import { SuiObjectsContext } from './context.js'
import { SuiMoveObject } from '@mysten/sui.js'
import { PromiseOrVoid } from '../core/index.js'
import { configure, IndexConfigure, SuiBindOptions } from './sui-processor.js'

export interface SuiObjectBindOptions {
  objectId: string
  network?: SuiNetwork
  startCheckpoint?: bigint
  baseLabels?: { [key: string]: string }
}

interface ObjectHandler {
  type?: string
  versionInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  fetchConfig: MoveAccountFetchConfig
  handler: (resource: Data_SuiObject) => Promise<ProcessResult>
}

export const DEFAULT_FETCH_CONFIG: MoveAccountFetchConfig = {
  owned: true,
}

export class SuiAccountProcessorState extends ListStateStorage<SuiBaseObjectsProcessor<any>> {
  static INSTANCE = new SuiAccountProcessorState()
}

export interface SuiInternalObjectsBindOptions extends SuiBindOptions {
  ownerType: MoveOwnerType
}

export abstract class SuiBaseObjectsProcessor<HandlerType> {
  config: IndexConfigure
  ownerType: MoveOwnerType

  objectHandlers: ObjectHandler[] = []

  // static bind(options: SuiObjectsBindOptions): SuiBaseObjectsProcessor<any> {
  //   return new SuiBaseObjectsProcessor(options)
  // }

  protected constructor(options: SuiInternalObjectsBindOptions) {
    this.config = configure(options)
    this.ownerType = options.ownerType
    SuiAccountProcessorState.INSTANCE.addValue(this)
  }

  getChainId(): string {
    return this.config.network
  }

  // protected abstract transformObjects(objects: SuiMoveObject[]): SuiMoveObject[]

  protected abstract doHandle(handler: HandlerType, data: Data_SuiObject, ctx: SuiObjectsContext): PromiseOrVoid

  public onInterval(
    handler: HandlerType, //(resources: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    versionInterval: HandleInterval | undefined,
    type: string | undefined,
    fetchConfig: Partial<MoveAccountFetchConfig> | undefined
  ): this {
    const processor = this
    this.objectHandlers.push({
      handler: async function (data) {
        const ctx = new SuiObjectsContext(
          processor.config.network,
          processor.config.address,
          data.slot,
          data.timestamp || new Date(0),
          processor.config.baseLabels
        )
        await processor.doHandle(handler, data, ctx)
        return ctx.getProcessResult()
      },
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

export class SuiAddressProcessor extends SuiBaseObjectsProcessor<
  (objects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid
> {
  static bind(options: SuiBindOptions): SuiAddressProcessor {
    return new SuiAddressProcessor({ ...options, ownerType: MoveOwnerType.ADDRESS })
  }

  protected doHandle(
    handler: (objects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectsContext
  ): PromiseOrVoid {
    return handler(data.objects as SuiMoveObject[], ctx)
  }
}

export class SuiObjectProcessor extends SuiBaseObjectsProcessor<
  (self: SuiMoveObject, dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid
> {
  static bind(options: SuiObjectBindOptions): SuiObjectProcessor {
    return new SuiObjectProcessor({
      address: options.objectId,
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      ownerType: MoveOwnerType.OBJECT,
      baseLabels: options.baseLabels,
    })
  }

  protected doHandle(
    handler: (self: SuiMoveObject, dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectsContext
  ): PromiseOrVoid {
    if (!data.self) {
      console.log(`Sui object not existed in ${ctx.slot}, please specific a start time`)
      return
    }
    return handler(data.self as SuiMoveObject, data.objects as SuiMoveObject[], ctx)
  }
}

export class SuiWrappedObjectProcessor extends SuiBaseObjectsProcessor<
  (dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid
> {
  static bind(options: SuiObjectBindOptions): SuiWrappedObjectProcessor {
    return new SuiWrappedObjectProcessor({
      address: options.objectId,
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      ownerType: MoveOwnerType.WRAPPED_OBJECT,
      baseLabels: options.baseLabels,
    })
  }

  protected doHandle(
    handler: (dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectsContext
  ): PromiseOrVoid {
    return handler(data.objects as SuiMoveObject[], ctx)
  }
}
