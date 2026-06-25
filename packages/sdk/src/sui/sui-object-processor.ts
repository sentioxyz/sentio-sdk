import {
  type Data_SuiCall,
  type Data_SuiObject,
  type Data_SuiObjectChange,
  type HandleInterval,
  HandleIntervalSchema,
  type MoveAccountFetchConfig,
  MoveAccountFetchConfigSchema,
  type MoveFetchConfig,
  MoveFetchConfigSchema,
  MoveOwnerType,
  type ProcessResult,
  timestampDate
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { ListStateStorage } from '@sentio/runtime'
import { SuiNetwork } from './network.js'
import { SuiAddressContext, SuiContext, SuiObjectChangeContext, SuiObjectContext } from './context.js'
import type { GrpcTypes } from '@mysten/sui/grpc'
import type { SuiClientTypes } from '@mysten/sui/client'
import type { SuiMoveObjectInput } from '@typemove/sui'
import { ALL_ADDRESS, PromiseOrVoid } from '../core/index.js'
import { configure, DEFAULT_FETCH_CONFIG, IndexConfigure, SuiBindOptions } from './sui-processor.js'
import { CallHandler, TransactionFilter, accountTypeString, ObjectChangeHandler } from '../move/index.js'
import { ConnectError, Code } from '@connectrpc/connect'
import { TypeDescriptor } from '@typemove/move'
import { TypedSuiMoveObject } from './models.js'
import { toSuiClientChangedObjects, toSuiClientObject } from './to-client-types.js'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'

export interface SuiObjectBindOptions {
  objectId: string
  network?: SuiNetwork
  startCheckpoint?: bigint
  endCheckpoint?: bigint
  baseLabels?: { [key: string]: string }
}

export interface SuiObjectTypeBindOptions<T> {
  objectType: TypeDescriptor<T>
  network?: SuiNetwork
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

export const DEFAULT_ACCOUNT_FETCH_CONFIG: MoveAccountFetchConfig = create(MoveAccountFetchConfigSchema, {
  owned: false
})

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
        endCheckpoint: options.endCheckpoint,
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

  // protected abstract transformObjects(objects: SuiMoveObjectInput[]): SuiMoveObjectInput[]

  protected abstract doHandle(handler: HandlerType, data: Data_SuiObject, ctx: SuiObjectContext): Promise<any>

  public onInterval(
    handler: HandlerType, //(resources: SuiMoveObjectInput[], ctx: SuiObjectsContext) => PromiseOrVoid,
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
          data.timestamp ? timestampDate(data.timestamp) : new Date(0),
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

export class SuiAddressProcessor extends SuiBaseObjectOrAddressProcessorInternal<
  (objects: SuiMoveObjectInput[], ctx: SuiAddressContext) => PromiseOrVoid
> {
  callHandlers: CallHandler<Data_SuiCall>[] = []

  static bind(options: SuiBindOptions): SuiAddressProcessor {
    return new SuiAddressProcessor({ ...options, ownerType: MoveOwnerType.ADDRESS })
  }

  protected async doHandle(
    handler: (objects: SuiMoveObjectInput[], ctx: SuiObjectContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectContext
  ) {
    return handler(
      data.rawObjects.map((o) => toSuiClientObject(JSON.parse(o))),
      ctx
    )
  }

  onTransactionBlock(
    handler: (transaction: GrpcTypes.ExecutedTransaction, ctx: SuiContext) => PromiseOrVoid,
    filter?: TransactionFilter,
    fetchConfig?: Partial<MoveFetchConfig>
  ) {
    const _fetchConfig = create(MoveFetchConfigSchema, { ...DEFAULT_FETCH_CONFIG, ...fetchConfig })
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
          throw new ConnectError('transaction is null', Code.InvalidArgument)
        }
        const tx = JSON.parse(data.rawTransaction) as GrpcTypes.ExecutedTransaction

        const ctx = new SuiContext(
          'object',
          processor.config.network,
          processor.config.address,
          data.timestamp ? timestampDate(data.timestamp) : new Date(0),
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
  (self: SuiMoveObjectInput, dynamicFieldObjects: SuiMoveObjectInput[], ctx: SuiObjectContext) => PromiseOrVoid
> {
  static bind(options: SuiObjectBindOptions): SuiObjectProcessor {
    return new SuiObjectProcessor({
      address: options.objectId,
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      endCheckpoint: options.endCheckpoint,
      ownerType: MoveOwnerType.OBJECT,
      baseLabels: options.baseLabels
    })
  }

  protected async doHandle(
    handler: (
      self: SuiMoveObjectInput,
      dynamicFieldObjects: SuiMoveObjectInput[],
      ctx: SuiObjectContext
    ) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectContext
  ) {
    if (!data.rawSelf) {
      console.log(`Sui object not existed in ${ctx.checkpoint}, please specific a start time`)
      return
    }
    return handler(
      toSuiClientObject(JSON.parse(data.rawSelf)),
      data.rawObjects.map((o) => toSuiClientObject(JSON.parse(o))),
      ctx
    )
  }
}

export class SuiObjectTypeProcessor<T> extends SuiBaseObjectOrAddressProcessor<
  (self: TypedSuiMoveObject<T>, dynamicFieldObjects: SuiMoveObjectInput[], ctx: SuiObjectContext) => PromiseOrVoid
> {
  objectType: TypeDescriptor<T>

  static bind<T>(options: SuiObjectTypeBindOptions<T>): SuiObjectTypeProcessor<T> {
    const processor = new SuiObjectTypeProcessor<T>({
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
      self: TypedSuiMoveObject<T>,
      dynamicFieldObjects: SuiMoveObjectInput[],
      ctx: SuiObjectContext
    ) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectContext
  ) {
    if (!data.rawSelf) {
      console.log(`Sui object not existed in ${ctx.checkpoint}, please specific a start time`)
      return
    }
    const object = await ctx.coder.filterAndDecodeObjects(this.objectType, [
      toSuiClientObject(JSON.parse(data.rawSelf))
    ])
    return handler(
      object[0],
      data.rawObjects.map((o) => toSuiClientObject(JSON.parse(o))),
      ctx
    )
  }

  public onObjectChange(
    handler: (changes: SuiClientTypes.ChangedObject[], ctx: SuiObjectChangeContext) => PromiseOrVoid
  ): this {
    if (this.config.network === SuiNetwork.TEST_NET) {
      throw new ConnectError('object change not supported in testnet', Code.InvalidArgument)
    }
    const processor = this
    this.objectChangeHandlers.push({
      handlerName: getHandlerName(),
      handler: async function (data: Data_SuiObjectChange) {
        const ctx = new SuiObjectChangeContext(
          processor.config.network,
          processor.config.address,
          data.timestamp ? timestampDate(data.timestamp) : new Date(0),
          data.slot,
          data.txDigest,
          processor.config.baseLabels
        )
        await handler(await toSuiClientChangedObjects(data.rawChanges.map((r) => JSON.parse(r))), ctx)
        return ctx.stopAndGetResult()
      },
      type: [this.objectType.getSignature()]
    })

    return this
  }

  public onTimeInterval(
    handler: (
      self: TypedSuiMoveObject<T>,
      dynamicFieldObjects: SuiMoveObjectInput[],
      ctx: SuiObjectContext
    ) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240,
    fetchConfig?: Partial<MoveAccountFetchConfig>
  ): this {
    return this.onInterval(
      handler,
      create(HandleIntervalSchema, {
        recentInterval: timeIntervalInMinutes,
        backfillInterval: backfillTimeIntervalInMinutes
      }),
      undefined,
      this.objectType.getSignature(),
      fetchConfig
    )
  }

  public onCheckpointInterval(
    handler: (
      self: TypedSuiMoveObject<T>,
      dynamicFieldObjects: SuiMoveObjectInput[],
      ctx: SuiObjectContext
    ) => PromiseOrVoid,
    checkpointInterval = 100000,
    backfillCheckpointInterval = 400000,
    fetchConfig?: Partial<MoveAccountFetchConfig>
  ): this {
    return this.onInterval(
      handler,
      undefined,
      create(HandleIntervalSchema, {
        recentInterval: checkpointInterval,
        backfillInterval: backfillCheckpointInterval
      }),
      this.objectType.qname,
      fetchConfig
    )
  }
}

export class SuiWrappedObjectProcessor extends SuiBaseObjectOrAddressProcessorInternal<
  (dynamicFieldObjects: SuiMoveObjectInput[], ctx: SuiObjectContext) => PromiseOrVoid
> {
  static bind(options: SuiObjectBindOptions): SuiWrappedObjectProcessor {
    return new SuiWrappedObjectProcessor({
      address: options.objectId,
      network: options.network,
      startCheckpoint: options.startCheckpoint,
      endCheckpoint: options.endCheckpoint,
      ownerType: MoveOwnerType.WRAPPED_OBJECT,
      baseLabels: options.baseLabels
    })
  }

  protected async doHandle(
    handler: (dynamicFieldObjects: SuiMoveObjectInput[], ctx: SuiObjectContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectContext
  ) {
    return handler(
      data.rawObjects.map((o) => toSuiClientObject(JSON.parse(o))),
      ctx
    )
  }
}
