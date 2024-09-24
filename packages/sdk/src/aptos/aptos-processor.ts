import { defaultMoveCoder, MoveCoder } from './index.js'

import {
  Event,
  WriteSetChangeWriteResource,
  MoveResource,
  UserTransactionResponse,
  EntryFunctionPayloadResponse,
  WriteSetChangeDeleteResource,
  MultisigPayloadResponse
} from '@aptos-labs/ts-sdk'

import { AptosBindOptions, AptosNetwork } from './network.js'
import { AptosContext, AptosResourcesContext } from './context.js'
import { ListStateStorage, mergeProcessResults } from '@sentio/runtime'
import {
  MoveFetchConfig,
  Data_AptResource,
  HandleInterval,
  ProcessResult,
  Data_AptEvent,
  Data_AptCall,
  MoveAccountFetchConfig
} from '@sentio/protos'
import { ServerError, Status } from 'nice-grpc'
import {
  accountTypeString,
  CallHandler,
  EventFilter,
  EventHandler,
  FunctionNameAndCallFilter,
  parseMoveType,
  ResourceChangeHandler
} from '../move/index.js'
import { Labels, PromiseOrVoid } from '../core/index.js'

const DEFAULT_FETCH_CONFIG: MoveFetchConfig = {
  resourceChanges: false,
  allEvents: true,
  inputs: false,
  // for backward compatibility
  supportMultisigFunc: true
}

export const DEFAULT_RESOURCE_FETCH_CONFIG: MoveAccountFetchConfig = {
  owned: true
}

export type ResourceChange = WriteSetChangeWriteResource | WriteSetChangeDeleteResource

type IndexConfigure = {
  address: string
  network: AptosNetwork
  startVersion: bigint
  baseLabels?: Labels
  // endSeqNumber?: Long
}

class ResourceHandlder {
  type?: string
  versionInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handler: (resource: Data_AptResource) => Promise<ProcessResult>
  fetchConfig: MoveAccountFetchConfig
}

export class AptosProcessorState extends ListStateStorage<AptosBaseProcessor> {
  static INSTANCE = new AptosProcessorState()
}

export class AptosBaseProcessor {
  readonly moduleName: string
  config: IndexConfigure
  eventHandlers: EventHandler<Data_AptEvent>[] = []
  callHandlers: CallHandler<Data_AptCall>[] = []
  resourceHandlers: ResourceChangeHandler<Data_AptResource>[] = []
  coder: MoveCoder

  constructor(moduleName: string, options: AptosBindOptions) {
    this.moduleName = moduleName
    this.config = configure(options)
    AptosProcessorState.INSTANCE.addValue(this)
    this.coder = defaultMoveCoder(this.config.network)
    // this.loadTypes(this.coder)
  }

  protected onMoveEvent(
    handler: (event: Event, ctx: AptosContext) => void,
    filter: EventFilter | EventFilter[],
    fetchConfig?: Partial<MoveFetchConfig>
  ): this {
    let _filters: EventFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...fetchConfig })

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const moduleName = this.moduleName

    const processor = this
    const allEventType = new Set(_filters.map((f) => accountTypeString(processor.config.address) + '::' + f.type))

    this.eventHandlers.push({
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'event is null')
        }
        const txn = data.transaction as UserTransactionResponse
        if (!txn.events.length) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'no event in the transactions')
        }

        const processResults = []
        for (const [idx, evt] of txn.events.entries()) {
          const typeQname = parseMoveType(evt.type).qname
          if (!allEventType.has(typeQname)) {
            continue
          }

          const ctx = new AptosContext(
            processor.moduleName,
            processor.config.network,
            processor.config.address,
            BigInt(txn.version),
            txn,
            idx,
            processor.config.baseLabels
          )

          const decoded = await processor.coder.decodeEvent<any>(evt)
          await handler(decoded || evt, ctx)
          processResults.push(ctx.stopAndGetResult())
        }

        return mergeProcessResults(processResults)
      },
      filters: _filters,
      fetchConfig: _fetchConfig
    })
    return this
  }

  protected onEntryFunctionCall(
    handler: (call: EntryFunctionPayloadResponse, ctx: AptosContext) => PromiseOrVoid,
    filter: FunctionNameAndCallFilter | FunctionNameAndCallFilter[],
    fetchConfig?: Partial<MoveFetchConfig>
  ): this {
    let _filters: FunctionNameAndCallFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...fetchConfig })

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const address = this.config.address
    // const moduleName = this.moduleName
    const processor = this

    this.callHandlers.push({
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'call is null')
        }
        const tx = data.transaction as UserTransactionResponse

        const ctx = new AptosContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          BigInt(tx.version),
          tx,
          0,
          processor.config.baseLabels
        )
        if (tx) {
          let payload = tx.payload
          if (payload.type === 'multisig_payload') {
            payload = (payload as MultisigPayloadResponse).transaction_payload ?? payload
          }

          const decoded = await processor.coder.decodeFunctionPayload(payload as EntryFunctionPayloadResponse)
          await handler(decoded, ctx)
        }
        return ctx.stopAndGetResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig
    })
    return this
  }

  public onTransaction(
    handler: (transaction: UserTransactionResponse, ctx: AptosContext) => PromiseOrVoid,
    includedFailed = false,
    fetchConfig?: Partial<MoveFetchConfig>
  ): this {
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...fetchConfig })

    const processor = this
    this.callHandlers.push({
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'call is null')
        }
        const call = data.transaction as UserTransactionResponse
        const ctx = new AptosContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          BigInt(data.transaction.version),
          call,
          0,
          processor.config.baseLabels
        )
        await handler(call, ctx)
        return ctx.stopAndGetResult()
      },
      filters: [{ function: '', includeFailed: includedFailed }],
      fetchConfig: _fetchConfig
    })
    return this
  }

  public onEvent(handler: (event: Event, ctx: AptosContext) => void, fetchConfig?: Partial<MoveFetchConfig>): this {
    this.onMoveEvent(handler, { type: '' }, fetchConfig)
    return this
  }

  public onResourceChange(
    handler: (changes: ResourceChange[], ctx: AptosResourcesContext) => PromiseOrVoid,
    type: string
  ): this {
    const processor = this
    this.resourceHandlers.push({
      handler: async function (data) {
        if (!data.resources || !data.version) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'resource is null')
        }
        const resources = data.resources as ResourceChange[]
        const timestamp = Number(data.timestampMicros)

        const ctx = new AptosResourcesContext(
          processor.config.network,
          processor.config.address,
          data.version,
          timestamp,
          processor.config.baseLabels
        )
        await handler(resources, ctx)
        return ctx.stopAndGetResult()
      },
      type
    })
    return this
  }

  getChainId(): string {
    return this.config.network
  }
}

export class AptosModulesProcessor extends AptosBaseProcessor {
  private constructor(options: AptosBindOptions) {
    super('*', options)
  }

  static bind(options: AptosBindOptions): AptosModulesProcessor {
    return new AptosModulesProcessor(options)
  }
}

export class AptosResourceProcessorState extends ListStateStorage<AptosResourcesProcessor> {
  static INSTANCE = new AptosResourceProcessorState()
}

export class AptosResourcesProcessor {
  config: IndexConfigure

  resourcesHandlers: ResourceHandlder[] = []

  static bind(options: AptosBindOptions): AptosResourcesProcessor {
    return new AptosResourcesProcessor(options)
  }

  protected constructor(options: AptosBindOptions) {
    this.config = configure(options)
    AptosResourceProcessorState.INSTANCE.addValue(this)
  }

  getChainId(): string {
    return this.config.network
  }

  onInterval(
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    versionInterval: HandleInterval | undefined,
    type: string | undefined,
    fetchConfig: Partial<MoveAccountFetchConfig> | undefined
  ): this {
    const processor = this
    this.resourcesHandlers.push({
      handler: async function (data) {
        if (data.timestampMicros > Number.MAX_SAFE_INTEGER) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'timestamp is too large')
        }
        const timestamp = Number(data.timestampMicros)

        const ctx = new AptosResourcesContext(
          processor.config.network,
          processor.config.address,
          data.version,
          timestamp,
          processor.config.baseLabels
        )
        await handler(data.resources as MoveResource[], ctx)
        return ctx.stopAndGetResult()
      },
      timeIntervalInMinutes: timeInterval,
      versionInterval: versionInterval,
      type: type,
      fetchConfig: { ...DEFAULT_RESOURCE_FETCH_CONFIG, ...fetchConfig }
    })
    return this
  }

  public onTimeInterval(
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => PromiseOrVoid,
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

  public onVersionInterval(
    handler: (resources: MoveResource[], ctx: AptosResourcesContext) => PromiseOrVoid,
    versionInterval = 100000,
    backfillVersionInterval = 400000,
    typePrefix?: string,
    fetchConfig?: Partial<MoveAccountFetchConfig>
  ): this {
    return this.onInterval(
      handler,
      undefined,
      { recentInterval: versionInterval, backfillInterval: backfillVersionInterval },
      typePrefix,
      fetchConfig
    )
  }

  public onResourceChange(
    handler: (changes: ResourceChange[], ctx: AptosResourcesContext) => PromiseOrVoid,
    typeOrPrefix: string
  ): this {
    const processor = this
    this.resourcesHandlers.push({
      fetchConfig: DEFAULT_RESOURCE_FETCH_CONFIG,
      handler: async function (data) {
        const timestamp = Number(data.timestampMicros)

        if (!data.resources || !data.version) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'resource is null')
        }
        const resources = data.resources as ResourceChange[]
        const ctx = new AptosResourcesContext(
          processor.config.network,
          processor.config.address,
          data.version,
          timestamp,
          processor.config.baseLabels
        )
        await handler(resources, ctx)
        return ctx.stopAndGetResult()
      },
      type: typeOrPrefix
    })
    return this
  }
}

function configure(options: AptosBindOptions): IndexConfigure {
  let startVersion = 0n
  if (options.startVersion !== undefined) {
    if (typeof options.startVersion === 'number') {
      startVersion = BigInt(options.startVersion)
    } else {
      startVersion = options.startVersion
    }
  }

  return {
    startVersion: startVersion,
    address: options.address === '*' ? '*' : accountTypeString(options.address), // aptos don't use address string in api, so only use type string
    network: options.network || AptosNetwork.MAIN_NET,
    baseLabels: options.baseLabels
  }
}
