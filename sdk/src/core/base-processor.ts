import { Event } from '@ethersproject/contracts'
import { BytesLike } from '@ethersproject/bytes'
import { Block, Log, getNetwork } from '@ethersproject/providers'
import { BaseContract, EventFilter } from '@ethersproject/contracts'
import Long from 'long'

import { BoundContractView, ContractContext, ContractView } from './context'
import { ProcessResult } from '../gen'
import { BindInternalOptions, BindOptions } from './bind-options'
import { PromiseOrVoid } from '../promise-or-void'
import { Trace } from './trace'

export class EventsHandler {
  filters: EventFilter[]
  handler: (event: Log) => Promise<ProcessResult>
}

export class TraceHandler {
  signature: string
  handler: (trace: Trace) => Promise<ProcessResult>
}

export abstract class BaseProcessor<
  TContract extends BaseContract,
  TBoundContractView extends BoundContractView<TContract, ContractView<TContract>>
> {
  blockHandlers: ((block: Block) => Promise<ProcessResult>)[] = []
  eventHandlers: EventsHandler[] = []
  traceHandlers: TraceHandler[] = []

  config: BindInternalOptions

  constructor(config: BindOptions) {
    this.config = {
      address: config.address,
      name: config.name || '',
      network: config.network ? config.network : 1,
      startBlock: new Long(0),
    }
    if (config.startBlock) {
      if (typeof config.startBlock === 'number') {
        this.config.startBlock = Long.fromNumber(config.startBlock)
      } else {
        this.config.startBlock = config.startBlock
      }
    }
    if (config.endBlock) {
      if (typeof config.endBlock === 'number') {
        this.config.endBlock = Long.fromNumber(config.endBlock)
      } else {
        this.config.endBlock = config.endBlock
      }
    }
  }

  protected abstract CreateBoundContractView(): TBoundContractView

  public getChainId(): number {
    return getNetwork(this.config.network).chainId
  }

  public onEvent(
    handler: (event: Event, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid,
    filter: EventFilter | EventFilter[]
  ) {
    const chainId = this.getChainId()

    let _filters: EventFilter[] = []

    if (Array.isArray(filter)) {
      _filters = filter
    } else {
      _filters.push(filter)
    }

    const contractView = this.CreateBoundContractView()
    const contractName = this.config.name
    this.eventHandlers.push({
      filters: _filters,
      handler: async function (log) {
        const ctx = new ContractContext<TContract, TBoundContractView>(
          contractName,
          contractView,
          chainId,
          undefined,
          log
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
    const chainId = this.getChainId()
    const contractView = this.CreateBoundContractView()
    const contractName = this.config.name

    this.blockHandlers.push(async function (block: Block) {
      const ctx = new ContractContext<TContract, TBoundContractView>(
        contractName,
        contractView,
        chainId,
        block,
        undefined
      )
      await handler(block, ctx)
      return ctx.getProcessResult()
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

  protected onTrace(
    signature: string,
    handler: (trace: Trace, ctx: ContractContext<TContract, TBoundContractView>) => PromiseOrVoid
  ) {
    const chainId = this.getChainId()
    const contractView = this.CreateBoundContractView()
    const contractName = this.config.name

    this.traceHandlers.push({
      signature,
      handler: async function (trace: Trace) {
        const contractInterface = contractView.rawContract.interface
        const fragment = contractInterface.getFunction(signature)
        if (!trace.action.input) {
          return ProcessResult.fromPartial({})
        }
        const traceData = '0x' + trace.action.input.slice(10)
        trace.args = contractInterface._abiCoder.decode(fragment.inputs, traceData)

        const ctx = new ContractContext<TContract, TBoundContractView>(
          contractName,
          contractView,
          chainId,
          undefined,
          undefined,
          trace
        )
        await handler(trace, ctx)
        return ctx.getProcessResult()
      },
    })
    return this
  }
}
