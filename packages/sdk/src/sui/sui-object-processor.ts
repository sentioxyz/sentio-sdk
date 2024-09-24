import {
  Data_SuiCall,
  Data_SuiObject,
  HandleInterval,
  MoveAccountFetchConfig,
  MoveFetchConfig,
  MoveOwnerType,
  ProcessResult
} from '@sentio/protos'
import { ListStateStorage } from '@sentio/runtime'
import { SuiNetwork } from './network.js'
import { SuiAddressContext, SuiContext, SuiObjectContext } from './context.js'
import { SuiMoveObject, SuiTransactionBlockResponse } from '@mysten/sui.js/client'
import { PromiseOrVoid } from '../core/index.js'
import { configure, DEFAULT_FETCH_CONFIG, IndexConfigure, SuiBindOptions } from './sui-processor.js'
import { CallHandler, TransactionFilter } from '../move/index.js'
import { ServerError, Status } from 'nice-grpc'

export interface SuiObjectBindOptions {
  objectId: string
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

  protected abstract doHandle(handler: HandlerType, data: Data_SuiObject, ctx: SuiObjectContext): PromiseOrVoid

  public onInterval(
    handler: HandlerType, //(resources: SuiMoveObject[], ctx: SuiObjectsContext) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    checkpointInterval: HandleInterval | undefined,
    type: string | undefined,
    fetchConfig: Partial<MoveAccountFetchConfig> | undefined
  ): this {
    const processor = this
    this.objectHandlers.push({
      handler: async function (data) {
        const ctx = new SuiObjectContext(
          processor.config.network,
          processor.config.address,
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

export class SuiAddressProcessor extends SuiBaseObjectOrAddressProcessor<
  (objects: SuiMoveObject[], ctx: SuiAddressContext) => PromiseOrVoid
> {
  callHandlers: CallHandler<Data_SuiCall>[] = []

  static bind(options: SuiBindOptions): SuiAddressProcessor {
    return new SuiAddressProcessor({ ...options, ownerType: MoveOwnerType.ADDRESS })
  }

  protected doHandle(
    handler: (objects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectContext
  ): PromiseOrVoid {
    return handler(data.objects as SuiMoveObject[], ctx)
  }

  onTransactionBlock(
    handler: (transaction: SuiTransactionBlockResponse, ctx: SuiContext) => void,
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
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'transaction is null')
        }
        const tx = data.transaction as SuiTransactionBlockResponse

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

export class SuiObjectProcessor extends SuiBaseObjectOrAddressProcessor<
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

  protected doHandle(
    handler: (self: SuiMoveObject, dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectContext
  ): PromiseOrVoid {
    if (!data.self) {
      console.log(`Sui object not existed in ${ctx.checkpoint}, please specific a start time`)
      return
    }
    return handler(data.self as SuiMoveObject, data.objects as SuiMoveObject[], ctx)
  }
}

export class SuiWrappedObjectProcessor extends SuiBaseObjectOrAddressProcessor<
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

  protected doHandle(
    handler: (dynamicFieldObjects: SuiMoveObject[], ctx: SuiObjectContext) => PromiseOrVoid,
    data: Data_SuiObject,
    ctx: SuiObjectContext
  ): PromiseOrVoid {
    return handler(data.objects as SuiMoveObject[], ctx)
  }
}
