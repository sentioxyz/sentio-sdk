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
import { IotaNetwork } from './network.js'
import { IotaAddressContext, IotaContext, IotaObjectChangeContext, IotaObjectContext } from './context.js'
import { IotaMoveObject, IotaObjectChange, IotaTransactionBlockResponse } from '@iota/iota-sdk/client'
import { ALL_ADDRESS, PromiseOrVoid } from '../core/index.js'
import { configure, DEFAULT_FETCH_CONFIG, IndexConfigure, IotaBindOptions } from './iota-processor.js'
import { CallHandler, TransactionFilter, accountTypeString, ObjectChangeHandler } from '../move/index.js'
import { ServerError, Status } from 'nice-grpc'
import { TypeDescriptor } from '@typemove/move'
import { TypedIotaMoveObject } from './models.js'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'

export interface IotaObjectBindOptions {
  objectId: string
  network?: IotaNetwork
  startCheckpoint?: bigint
  endCheckpoint?: bigint
  baseLabels?: { [key: string]: string }
}

export interface IotaObjectTypeBindOptions<T> {
  objectType: TypeDescriptor<T>
  network?: IotaNetwork
  startCheckpoint?: bigint
  endCheckpoint?: bigint
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

export class IotaAccountProcessorState extends ListStateStorage<IotaBaseObjectOrAddressProcessor<any>> {
  static INSTANCE = new IotaAccountProcessorState()
}

export interface IotaInternalObjectsBindOptions extends IotaBindOptions {
  ownerType: MoveOwnerType
}

export abstract class IotaBaseObjectOrAddressProcessor<HandlerType> {
  config: IndexConfigure
  ownerType: MoveOwnerType
  templateId: number | undefined

  objectHandlers: ObjectHandler[] = []
  objectChangeHandlers: ObjectChangeHandler<Data_SuiObjectChange>[] = []

  // static bind(options: IotaObjectsBindOptions): IotaBaseObjectsProcessor<any> {
  //   return new IotaBaseObjectsProcessor(options)
  // }

  protected constructor(options: IotaInternalObjectsBindOptions) {
    if (options.ownerType === MoveOwnerType.TYPE) {
      this.config = {
        startCheckpoint: options.startCheckpoint || 0n,
        endCheckpoint: options.endCheckpoint,
        address: options.address === '*' ? '*' : accountTypeString(options.address),
        network: options.network || IotaNetwork.MAIN_NET,
        baseLabels: options.baseLabels
      }
    } else {
      this.config = configure(options)
    }
    this.ownerType = options.ownerType
    IotaAccountProcessorState.INSTANCE.addValue(this)

    return proxyProcessor(this)
  }

  getChainId(): string {
    return this.config.network
  }

  // protected abstract transformObjects(objects: IotaMoveObject[]): IotaMoveObject[]

  protected abstract doHandle(handler: HandlerType, data: Data_SuiObject, ctx: IotaObjectContext): Promise<any>

  public onInterval(
    handler: HandlerType, //(resources: IotaMoveObject[], ctx: IotaObjectsContext) => PromiseOrVoid,
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
        const ctx = new IotaObjectContext(
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

abstract class IotaBaseObjectOrAddressProcessorInternal<
  HandlerType
> extends IotaBaseObjectOrAddressProcessor<HandlerType> {
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

export class IotaAddressProcessor extends IotaBaseObjectOrAddressProcessorInternal<
  (objects: IotaMoveObject[], ctx: IotaAddressContext) => PromiseOrVoid
> {
  callHandlers: CallHandler<Data_SuiCall>[] = []

  static bind(options: IotaBindOptions): IotaAddressProcessor {
    return new IotaAddressProcessor({ ...options, ownerType: MoveOwnerType.ADDRESS })
  }

  protected async doHandle(
    handler: (objects: IotaMoveObject[], ctx: IotaObjectContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: IotaObjectContext
  ) {
    return handler(data.rawObjects.map((o) => JSON.parse(o)) as IotaMoveObject[], ctx)
  }

  onTransactionBlock(
    handler: (transaction: IotaTransactionBlockResponse, ctx: IotaContext) => PromiseOrVoid,
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
        const tx = JSON.parse(data.rawTransaction) as IotaTransactionBlockResponse

        const ctx = new IotaContext(
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

export class IotaObjectProcessor extends IotaBaseObjectOrAddressProcessorInternal<
  (self: IotaMoveObject, dynamicFieldObjects: IotaMoveObject[], ctx: IotaObjectContext) => PromiseOrVoid
> {
  static bind(options: IotaObjectBindOptions): IotaObjectProcessor {
    return new IotaObjectProcessor({
      address: options.objectId,
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      endCheckpoint: options.endCheckpoint,
      ownerType: MoveOwnerType.OBJECT,
      baseLabels: options.baseLabels
    })
  }

  protected async doHandle(
    handler: (self: IotaMoveObject, dynamicFieldObjects: IotaMoveObject[], ctx: IotaObjectContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: IotaObjectContext
  ) {
    if (!data.rawSelf) {
      console.log(`Iota object not existed in ${ctx.checkpoint}, please specific a start time`)
      return
    }
    return handler(
      JSON.parse(data.rawSelf) as IotaMoveObject,
      data.rawObjects.map((o) => JSON.parse(o)) as IotaMoveObject[],
      ctx
    )
  }
}

export class IotaObjectTypeProcessor<T> extends IotaBaseObjectOrAddressProcessor<
  (self: TypedIotaMoveObject<T>, dynamicFieldObjects: IotaMoveObject[], ctx: IotaObjectContext) => PromiseOrVoid
> {
  objectType: TypeDescriptor<T>

  static bind<T>(options: IotaObjectTypeBindOptions<T>): IotaObjectTypeProcessor<T> {
    const processor = new IotaObjectTypeProcessor<T>({
      address: ALL_ADDRESS, // current only support on all address
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      endCheckpoint: options.endCheckpoint,
      ownerType: MoveOwnerType.TYPE,
      baseLabels: options.baseLabels
    })
    processor.objectType = options.objectType
    return processor
  }

  protected async doHandle(
    handler: (
      self: TypedIotaMoveObject<T>,
      dynamicFieldObjects: IotaMoveObject[],
      ctx: IotaObjectContext
    ) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: IotaObjectContext
  ) {
    if (!data.rawSelf) {
      console.log(`Iota object not existed in ${ctx.checkpoint}, please specific a start time`)
      return
    }
    const object = await ctx.coder.filterAndDecodeObjects(this.objectType, [JSON.parse(data.rawSelf) as IotaMoveObject])
    return handler(object[0], data.rawObjects.map((o) => JSON.parse(o)) as IotaMoveObject[], ctx)
  }

  public onObjectChange(handler: (changes: IotaObjectChange[], ctx: IotaObjectChangeContext) => PromiseOrVoid): this {
    if (this.config.network === IotaNetwork.TEST_NET) {
      throw new ServerError(Status.INVALID_ARGUMENT, 'object change not supported in testnet')
    }
    const processor = this
    this.objectChangeHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data: Data_SuiObjectChange) {
        const ctx = new IotaObjectChangeContext(
          processor.config.network,
          processor.config.address,
          data.timestamp || new Date(0),
          data.slot,
          data.txDigest,
          processor.config.baseLabels
        )
        await handler(data.rawChanges.map((r) => JSON.parse(r)) as IotaObjectChange[], ctx)
        return ctx.stopAndGetResult()
      },
      type: this.objectType.getSignature()
    })

    return this
  }

  public onTimeInterval(
    handler: (
      self: TypedIotaMoveObject<T>,
      dynamicFieldObjects: IotaMoveObject[],
      ctx: IotaObjectContext
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
      self: TypedIotaMoveObject<T>,
      dynamicFieldObjects: IotaMoveObject[],
      ctx: IotaObjectContext
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

export class IotaWrappedObjectProcessor extends IotaBaseObjectOrAddressProcessorInternal<
  (dynamicFieldObjects: IotaMoveObject[], ctx: IotaObjectContext) => PromiseOrVoid
> {
  static bind(options: IotaObjectBindOptions): IotaWrappedObjectProcessor {
    return new IotaWrappedObjectProcessor({
      address: options.objectId,
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      endCheckpoint: options.endCheckpoint,
      ownerType: MoveOwnerType.WRAPPED_OBJECT,
      baseLabels: options.baseLabels
    })
  }

  protected async doHandle(
    handler: (dynamicFieldObjects: IotaMoveObject[], ctx: IotaObjectContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: IotaObjectContext
  ) {
    return handler(data.rawObjects.map((o) => JSON.parse(o)) as IotaMoveObject[], ctx)
  }
}
