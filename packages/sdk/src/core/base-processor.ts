import { BytesLike } from '@ethersproject/bytes'
import { Block, Log, getNetwork, TransactionReceipt } from '@ethersproject/providers'
import { BaseContract, Event, EventFilter } from '@ethersproject/contracts'

import { BoundContractView, ContractContext, ContractView } from './context'
import {
  AddressType,
  Data_EthBlock,
  Data_EthLog,
  Data_EthTrace,
  EthFetchConfig,
  HandleInterval,
  ProcessResult,
} from '@sentio/protos'
import { BindInternalOptions, BindOptions } from './bind-options'
import { PromiseOrVoid } from '../promise-or-void'
import { Trace } from './trace'
import { ServerError, Status } from 'nice-grpc'
import { Transaction } from 'ethers'

export interface AddressOrTypeEventFilter extends EventFilter {
  addressType?: AddressType
}

export class EventsHandler {
  filters: AddressOrTypeEventFilter[]
  handler: (event: Data_EthLog) => Promise<ProcessResult>
  fetchConfig: EthFetchConfig
}

export class TraceHandler {
  signature: string
  handler: (trace: Data_EthTrace) => Promise<ProcessResult>
  fetchConfig: EthFetchConfig
}

export class BlockHandlder {
  blockInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handler: (block: Data_EthBlock) => Promise<ProcessResult>
}

export abstract class BaseProcessor<
  TContract extends BaseContract,
  TBoundContractView extends BoundContractView<TContract, ContractView<TContract>>
> {
  blockHandlers: BlockHandlder[] = []
  eventHandlers: EventsHandler[] = []
  traceHandlers: TraceHandler[] = []

  config: BindInternalOptions

  constructor(config: BindOptions) {
    this.config = {
      address: config.address,
      name: config.name || '',
      network: config.network ? config.network : 1,
      startBlock: 0n,
    }
    if (typeof this.config.network === 'string') {
      const asInt = parseInt(this.config.network)
      if (Number.isFinite(asInt)) {
        this.config.network = asInt
      }
    }
    if (config.startBlock) {
      this.config.startBlock = BigInt(config.startBlock)
    }
    if (config.endBlock) {
      this.config.endBlock = BigInt(config.endBlock)
    }
  }

  protected abstract CreateBoundContractView(): TBoundContractView

  public getChainId(): number {
    return getNetwork(this.config.network).chainId
  }

  public onEvent(
    handler: (event: Event, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    filter: EventFilter | EventFilter[],
    fetchConfig?: EthFetchConfig
  ) {
    const chainId = this.getChainId()

    let _filters: EventFilter[] = []

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    const contractName = this.config.name
    const processor = this
    this.eventHandlers.push({
      filters: _filters,
      fetchConfig: fetchConfig || EthFetchConfig.fromPartial({}),
      handler: async function (data: Data_EthLog) {
        if (!data.log) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Log is empty')
        }
        const log = data.log as Log

        const contractView = processor.CreateBoundContractView()

        const ctx = new ContractContext<TContract, TBoundContractView>(
          contractName,
          contractView,
          chainId,
          data.timestamp,
          data.block as Block,
          log,
          undefined,
          data.transaction as Transaction,
          data.transactionReceipt as TransactionReceipt
        )
        // let event: Event = <Event>deepCopy(log);
        const event: Event = <Event>log
        const parsed = contractView.rawContract.interface.parseLog(log)
        if (parsed) {
          event.args = parsed.args
          event.decode = (data: BytesLike, topics?: Array<any>) => {
            return contractView.rawContract.interface.decodeEventLog(parsed.eventFragment, data, topics)
          }
          event.event = parsed.name
          event.eventSignature = parsed.signature

          // TODO fix this bug
          await handler(event, ctx)
          return ctx.getProcessResult()
        }
        return ProcessResult.fromPartial({})
      },
    })
    return this
  }

  public onBlock(handler: (block: Block, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid) {
    return this.onBlockInterval(handler)
  }

  public onBlockInterval(
    handler: (block: Block, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    blockInterval = 1000,
    backfillBlockInterval = 4000
  ) {
    return this.onInterval(handler, undefined, {
      recentInterval: blockInterval,
      backfillInterval: backfillBlockInterval,
    })
  }

  public onTimeInterval(
    handler: (block: Block, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeIntervalInMinutes = 60,
    backfillTimeIntervalInMinutes = 240
  ) {
    return this.onInterval(
      handler,
      { recentInterval: timeIntervalInMinutes, backfillInterval: backfillTimeIntervalInMinutes },
      undefined
    )
  }

  public onInterval(
    handler: (block: Block, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    timeInterval: HandleInterval | undefined,
    blockInterval: HandleInterval | undefined
  ) {
    const chainId = this.getChainId()
    const processor = this
    const contractName = this.config.name

    this.blockHandlers.push({
      handler: async function (data: Data_EthBlock) {
        if (!data.block) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'Block is empty')
        }
        const block = data.block as Block

        const contractView = processor.CreateBoundContractView()

        const ctx = new ContractContext<TContract, TBoundContractView>(
          contractName,
          contractView,
          chainId,
          new Date(block.timestamp * 1000),
          block,
          undefined,
          undefined
        )
        await handler(block, ctx)
        return ctx.getProcessResult()
      },
      timeIntervalInMinutes: timeInterval,
      blockInterval: blockInterval,
    })
    return this
  }

  public onAllEvents(handler: (event: Log, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid) {
    const _filters: EventFilter[] = []
    const tmpContract = this.CreateBoundContractView()

    for (const key in tmpContract.filters) {
      _filters.push(tmpContract.filters[key]())
    }
    return this.onEvent(function (log, ctx) {
      return handler(log, ctx)
    }, _filters)
  }

  public onTrace(
    signature: string,
    handler: (trace: Trace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    fetchConfig?: EthFetchConfig
  ) {
    const chainId = this.getChainId()
    const contractName = this.config.name
    const processor = this

    this.traceHandlers.push({
      signature,
      fetchConfig: fetchConfig || EthFetchConfig.fromPartial({}),
      handler: async function (data: Data_EthTrace) {
        const contractView = processor.CreateBoundContractView()
        const contractInterface = contractView.rawContract.interface
        const fragment = contractInterface.getFunction(signature)
        if (!data.trace) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'trace is null')
        }
        const trace = data.trace as Trace
        if (!trace.action.input) {
          return ProcessResult.fromPartial({})
        }
        const traceData = '0x' + trace.action.input.slice(10)
        trace.args = contractInterface._abiCoder.decode(fragment.inputs, traceData)

        const ctx = new ContractContext<TContract, TBoundContractView>(
          contractName,
          contractView,
          chainId,
          data.timestamp,
          data.block as Block,
          undefined,
          trace,
          data.transaction as Transaction,
          data.transactionReceipt as TransactionReceipt
        )
        await handler(trace, ctx)
        return ctx.getProcessResult()
      },
    })
    return this
  }
}
