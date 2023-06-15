import { Data_SuiCall, Data_SuiEvent, MoveFetchConfig } from '@sentio/protos'
import { ListStateStorage, mergeProcessResults } from '@sentio/runtime'
import { SuiNetwork } from './network.js'
import { ServerError, Status } from 'nice-grpc'
import { SuiContext } from './context.js'
import {
  getProgrammableTransaction,
  getTransactionKind,
  MoveCallSuiTransaction,
  SuiEvent,
  SuiTransactionBlockResponse,
} from '@mysten/sui.js'
import {
  CallHandler,
  EventFilter,
  EventHandler,
  FunctionNameAndCallFilter,
  parseMoveType,
  SPLITTER,
} from '../move/index.js'
import { getMoveCalls } from './utils.js'
import { defaultMoveCoder, MoveCoder } from './move-coder.js'
import { Labels } from '../core/index.js'
import { Required } from 'utility-types'

const DEFAULT_FETCH_CONFIG: MoveFetchConfig = {
  resourceChanges: false,
  allEvents: true,
}

export type IndexConfigure = Required<SuiBindOptions, 'startCheckpoint' | 'network'>

export function configure(options: SuiBindOptions): IndexConfigure {
  let addressNoPrefix = options.address

  if (addressNoPrefix.startsWith('0x')) {
    addressNoPrefix = addressNoPrefix.slice(2)
  }
  for (let i = 0; i < addressNoPrefix.length; i++) {
    if (addressNoPrefix[i] !== '0') {
      addressNoPrefix = addressNoPrefix.slice(i)
      break
    }
  }

  return {
    startCheckpoint: options.startCheckpoint || 0n,
    address: '0x' + addressNoPrefix,
    network: options.network || SuiNetwork.MAIN_NET,
    baseLabels: options.baseLabels,
  }
}

export interface SuiBindOptions {
  address: string
  network?: SuiNetwork
  startCheckpoint?: bigint
  baseLabels?: Labels
}

export class SuiProcessorState extends ListStateStorage<SuiBaseProcessor> {
  static INSTANCE = new SuiProcessorState()
}

export class SuiBaseProcessor {
  readonly moduleName: string
  config: IndexConfigure

  eventHandlers: EventHandler<Data_SuiEvent>[] = []
  callHandlers: CallHandler<Data_SuiCall>[] = []
  coder: MoveCoder

  constructor(name: string, options: SuiBindOptions) {
    this.moduleName = name
    this.config = configure(options)
    SuiProcessorState.INSTANCE.addValue(this)
    this.coder = defaultMoveCoder(this.config.network)
  }

  getChainId(): string {
    return this.config.network
  }

  protected onMoveEvent(
    handler: (event: SuiEvent, ctx: SuiContext) => void,
    filter: EventFilter | EventFilter[],
    fetchConfig?: Partial<MoveFetchConfig>
  ): SuiBaseProcessor {
    let _filters: EventFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...fetchConfig })

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    // const address = this.config.address
    // const moduleName = this.moduleName

    const processor = this
    const allEventType = new Set(_filters.map((f) => processor.config.address + '::' + f.type))

    this.eventHandlers.push({
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'event is null')
        }
        const txn = data.transaction as SuiTransactionBlockResponse
        if (!txn.events || !txn.events.length) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'no event in the transactions')
        }

        const processResults = []
        for (const [idx, evt] of (txn.events as SuiEvent[]).entries()) {
          const typeQname = parseMoveType(evt.type).qname
          if (!allEventType.has(typeQname)) {
            continue
          }

          const ctx = new SuiContext(
            processor.moduleName,
            processor.config.network,
            processor.config.address,
            data.timestamp || new Date(0),
            data.slot,
            txn,
            idx,
            processor.config.baseLabels
          )

          const decoded = await processor.coder.decodeEvent<any>(evt)
          await handler(decoded || evt, ctx)
          processResults.push(ctx.getProcessResult())
        }

        return mergeProcessResults(processResults)
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
    })
    return this
  }

  protected onEntryFunctionCall(
    handler: (call: MoveCallSuiTransaction, ctx: SuiContext) => void,
    filter: FunctionNameAndCallFilter | FunctionNameAndCallFilter[],
    fetchConfig?: Partial<MoveFetchConfig>
  ): SuiBaseProcessor {
    let _filters: FunctionNameAndCallFilter[] = []
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...fetchConfig })

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    const processor = this
    const allFunctionType = new Set(_filters.map((f) => processor.config.address + '::' + f.function))

    this.callHandlers.push({
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'call is null')
        }
        const tx = data.transaction as SuiTransactionBlockResponse

        const ctx = new SuiContext(
          processor.moduleName,
          processor.config.network,
          processor.config.address,
          data.timestamp || new Date(0),
          data.slot,
          tx,
          0,
          processor.config.baseLabels
        )
        if (tx) {
          const calls: MoveCallSuiTransaction[] = getMoveCalls(tx)
          const txKind = getTransactionKind(tx)
          if (!txKind) {
            throw new ServerError(Status.INVALID_ARGUMENT, 'Unexpected getTransactionKind get empty')
          }
          const programmableTx = getProgrammableTransaction(txKind)

          // TODO potential pass index
          for (const call of calls) {
            const functionType = [call.package, call.module, call.function].join(SPLITTER)
            if (!allFunctionType.has(functionType)) {
              continue
            }

            // TODO maybe do in parallel
            const decoded = await processor.coder.decodeFunctionPayload(call, programmableTx?.inputs || [])
            await handler(decoded, ctx)
          }
        }
        return ctx.getProcessResult()
      },
      filters: _filters,
      fetchConfig: _fetchConfig,
    })
    return this
  }

  onEvent(handler: (event: SuiEvent, ctx: SuiContext) => void, fetchConfig?: Partial<MoveFetchConfig>): this {
    this.onMoveEvent(handler, { type: '' }, fetchConfig)
    return this
  }

  onTransactionBlock(
    handler: (call: SuiTransactionBlockResponse, ctx: SuiContext) => void,
    includeFailed = false,
    fetchConfig?: Partial<MoveFetchConfig>
  ): this {
    const _fetchConfig = MoveFetchConfig.fromPartial({ ...DEFAULT_FETCH_CONFIG, ...fetchConfig })

    const processor = this

    this.callHandlers.push({
      handler: async function (data) {
        if (!data.transaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'call is null')
        }
        const tx = data.transaction as SuiTransactionBlockResponse

        const ctx = new SuiContext(
          processor.moduleName,
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
        return ctx.getProcessResult()
      },
      filters: [{ function: '', includeFailed }],
      fetchConfig: _fetchConfig,
    })
    return this
  }
}

export class SuiModulesProcessor extends SuiBaseProcessor {
  protected constructor(options: SuiBindOptions) {
    super('*', options)
  }

  static bind(options: SuiBindOptions): SuiModulesProcessor {
    return new SuiModulesProcessor(options)
  }
}
