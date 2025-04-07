import {
  Data_SuiCall,
  Data_SuiObject,
  Data_SuiObjectChange,
  HandleInterval,
  MoveAccountFetchConfig,
  MoveFetchConfig,
  MoveOwnerType,
  ProcessResult
} from '@sentio/protos'
import { ListStateStorage } from '@sentio/runtime'
import { SuiNetwork } from './network.js'
import { SuiAddressContext, SuiContext, SuiObjectChangeContext, SuiObjectContext } from './context.js'
import { SuiMoveObject, SuiObjectChange, SuiTransactionBlockResponse } from '@mysten/sui/client'
import { ALL_ADDRESS, PromiseOrVoid } from '../core/index.js'
import { configure, DEFAULT_FETCH_CONFIG, IndexConfigure, SuiBindOptions } from './sui-processor.js'
import { CallHandler, TransactionFilter, accountTypeString, ObjectChangeHandler } from '../move/index.js'
import { ServerError, Status } from 'nice-grpc'
import { TypeDescriptor } from '@typemove/move'
import { TypedSuiMoveObject } from './models.js'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'

export interface SuiObjectBindOptions {
  objectId: string
  network?: SuiNetwork
  startCheckpoint?: bigint
  baseLabels?: { [key: string]: string }
}

export interface SuiObjectTypeBindOptions<T> {
  objectType: TypeDescriptor<T>
  network?: SuiNetwork
  startCheckpoint?: bigint
  baseLabels?: { [key: string]: string }
}

interface ObjectHandler {
  type?: string
  checkPointInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  fetchConfig: MoveAccountFetchConfig
  handler: (resource: Data_SuiObject) => Promise<ProcessResult>
  handlerName: string
}

export const DEFAULT_ACCOUNT_FETCH_CONFIG: MoveAccountFetchConfig = {
  owned: false
}

export class SuiAccountProcessorState extends ListStateStorage<SuiBaseObjectOrAddressProcessor<any>> {
  static INSTANCE = new SuiAccountProcessorState()
}

export interface SuiInternalObjectsBindOptions extends SuiBindOptions {
  ownerType: MoveOwnerType
}

export abstract class SuiBaseObjectOrAddressProcessor<HandlerType> {
  config: IndexConfigure
  ownerType: MoveOwnerType
  templateId: number | undefined

  objectHandlers: ObjectHandler[] = []
  objectChangeHandlers: ObjectChangeHandler<Data_SuiObjectChange>[] = []

  // static bind(options: SuiObjectsBindOptions): SuiBaseObjectsProcessor<any> {
  //   return new SuiBaseObjectsProcessor(options)
  // }

  protected constructor(options: SuiInternalObjectsBindOptions) {
    if (options.ownerType === MoveOwnerType.TYPE) {
      this.config = {
        startCheckpoint: options.startCheckpoint || 0n,
        address: options.address === '*' ? '*' : accountTypeString(options.address),
        network: options.network || SuiNetwork.MAIN_NET,
        baseLabels: options.baseLabels
      }
    } else {
      this.config = configure(options)
    }
    this.ownerType = options.ownerType
    SuiAccountProcessorState.INSTANCE.addValue(this)

    return proxyProcessor(this)
  }

  getChainId(): string {
    return this.config.network
  }

  // protected abstract transformObjects(objects: SuiMoveObject[]): SuiMoveObject[]

  protected abstract doHandle(handler: HandlerType, data: Data_SuiObject, ctx: SuiObjectContext): Promise<any>

  public onInterval(
    handler: HandlerType, //(resources: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    checkpointInterval: HandleInterval | undefined,
    type: string | undefined,
    fetchConfig: Partial<MoveAccountFetchConfig> | undefined,
    handlerName = getHandlerName()
  ): this {
    const processor = this
    this.objectHandlers.push({
      handlerName,
      handler: async function (data) {
        const ctx = new SuiObjectContext(
          processor.config.network,
          data.objectId,
          data.objectVersion,
          data.slot,
          data.timestamp || new Date(0),
          processor.config.baseLabels
        )
        await processor.doHandle(handler, data, ctx)
        return ctx.stopAndGetResult()
      },
      timeIntervalInMinutes: timeInterval,
      checkPointInterval: checkpointInterval,
      type,
      fetchConfig: { ...DEFAULT_ACCOUNT_FETCH_CONFIG, ...fetchConfig }
    })
    return this
  }
}

abstract class SuiBaseObjectOrAddressProcessorInternal<
  HandlerType
> extends SuiBaseObjectOrAddressProcessor<HandlerType> {
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

export class SuiAddressProcessor extends SuiBaseObjectOrAddressProcessorInternal<
  (objects: SuiMoveObject[], ctx: SuiAddressContext) => PromiseOrVoid
> {
  callHandlers: CallHandler<Data_SuiCall>[] = []

  static bind(options: SuiBindOptions): SuiAddressProcessor {
    return new SuiAddressProcessor({ ...options, ownerType: MoveOwnerType.ADDRESS })
  }

  protected async doHandle(
    handler: (objects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectContext
  ) {
    return handler(data.rawObjects.map((o) => JSON.parse(o)) as SuiMoveObject[], ctx)
  }

  onTransactionBlock(
    handler: (transaction: SuiTransactionBlockResponse, ctx: SuiContext) => PromiseOrVoid,
    filter?: TransactionFilter,
    fetchConfig?: Partial<MoveFetchConfig>
  ) {
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...fetchConfig })
    const _filter: TransactionFilter = {
      fromAndToAddress: {
        from: '',
        to: this.config.address
      },
      ...filter
    }

    const processor = this

    this.callHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data) {
        if (!data.rawTransaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'transaction is null')
        }
        const tx = JSON.parse(data.rawTransaction) as SuiTransactionBlockResponse

        const ctx = new SuiContext(
          'object',
          processor.config.network,
          processor.config.address,
          data.timestamp || new Date(0),
          data.slot,
          tx,
          0,
          processor.config.baseLabels
        )
        if (tx) {
          await handler(tx, ctx)
        }
        return ctx.stopAndGetResult()
      },
      filters: [{ ..._filter, function: '' }],
      fetchConfig: _fetchConfig
    })
    return this
  }
}

export class SuiObjectProcessor extends SuiBaseObjectOrAddressProcessorInternal<
  (self: SuiMoveObject, dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid
> {
  static bind(options: SuiObjectBindOptions): SuiObjectProcessor {
    return new SuiObjectProcessor({
      address: options.objectId,
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      ownerType: MoveOwnerType.OBJECT,
      baseLabels: options.baseLabels
    })
  }

  protected async doHandle(
    handler: (self: SuiMoveObject, dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectContext
  ) {
    if (!data.rawSelf) {
      console.log(`Sui object not existed in ${ctx.checkpoint}, please specific a start time`)
      return
    }
    return handler(
      JSON.parse(data.rawSelf) as SuiMoveObject,
      data.rawObjects.map((o) => JSON.parse(o)) as SuiMoveObject[],
      ctx
    )
  }
}

export class SuiObjectTypeProcessor<T> extends SuiBaseObjectOrAddressProcessor<
  (self: TypedSuiMoveObject<T>, dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid
> {
  objectType: TypeDescriptor<T>

  static bind<T>(options: SuiObjectTypeBindOptions<T>): SuiObjectTypeProcessor<T> {
    const processor = new SuiObjectTypeProcessor<T>({
      address: ALL_ADDRESS, // current only support on all address
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      ownerType: MoveOwnerType.TYPE,
      baseLabels: options.baseLabels
    })
    processor.objectType = options.objectType
    return processor
  }

  protected async doHandle(
    handler: (
      self: TypedSuiMoveObject<T>,
      dynamicFieldObjects: SuiMoveObject[],
      ctx: SuiObjectContext
    ) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectContext
  ) {
    if (!data.rawSelf) {
      console.log(`Sui object not existed in ${ctx.checkpoint}, please specific a start time`)
      return
    }
    const object = await ctx.coder.filterAndDecodeObjects(this.objectType, [JSON.parse(data.rawSelf) as SuiMoveObject])
    return handler(object[0], data.rawObjects.map((o) => JSON.parse(o)) as SuiMoveObject[], ctx)
  }

  public onObjectChange(handler: (changes: SuiObjectChange[], ctx: SuiObjectChangeContext) => PromiseOrVoid): this {
    if (this.config.network === SuiNetwork.TEST_NET) {
      throw new ServerError(Status.INVALID_ARGUMENT, 'object change not supported in testnet')
    }
    const processor = this
    this.objectChangeHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data: Data_SuiObjectChange) {
        const ctx = new SuiObjectChangeContext(
          processor.config.network,
          processor.config.address,
          data.timestamp || new Date(0),
          data.slot,
          data.txDigest,
          processor.config.baseLabels
        )
        await handler(data.rawChanges.map((r) => JSON.parse(r)) as SuiObjectChange[], ctx)
        return ctx.stopAndGetResult()
      },
      type: this.objectType.getSignature()
    })

    return this
  }

  public onTimeInterval(
    handler: (
      self: TypedSuiMoveObject<T>,
      dynamicFieldObjects: SuiMoveObject[],
      ctx: SuiObjectContext
    ) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    fetchConfig?: Partial<MoveAccountFetchConfig>
  ): this {
    return this.onInterval(
      handler,
      {
        recentInterval: timeIntervalInMinutes,
        backfillInterval: backfillTimeIntervalInMinutes
      },
      undefined,
      this.objectType.getSignature(),
      fetchConfig
    )
  }

  public onCheckpointInterval(
    handler: (
      self: TypedSuiMoveObject<T>,
      dynamicFieldObjects: SuiMoveObject[],
      ctx: SuiObjectContext
    ) => PromiseOrVoid,
    checkpointInterval = 100000,
    backfillCheckpointInterval = 400000,
    fetchConfig?: Partial<MoveAccountFetchConfig>
  ): this {
    return this.onInterval(
      handler,
      undefined,
      { recentInterval: checkpointInterval, backfillInterval: backfillCheckpointInterval },
      this.objectType.qname,
      fetchConfig
    )
  }
}

export class SuiWrappedObjectProcessor extends SuiBaseObjectOrAddressProcessorInternal<
  (dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid
> {
  static bind(options: SuiObjectBindOptions): SuiWrappedObjectProcessor {
    return new SuiWrappedObjectProcessor({
      address: options.objectId,
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      ownerType: MoveOwnerType.WRAPPED_OBJECT,
      baseLabels: options.baseLabels
    })
  }

  protected async doHandle(
    handler: (dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectContext
  ) {
    return handler(data.rawObjects.map((o) => JSON.parse(o)) as SuiMoveObject[], ctx)
  }
}
