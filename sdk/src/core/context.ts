import { CounterResult, GaugeResult, LogResult } from '../gen/processor/protos/processor'
import { BaseContract, EventFilter } from 'ethers'
import { Block, Log } from '@ethersproject/abstract-provider'
import { Meter } from './meter'
import Long from 'long'
import { Trace } from './trace'

export class BaseContext {
  gauges: GaugeResult[] = []
  counters: CounterResult[] = []
  logs: LogResult[] = []
  meter: Meter

  constructor() {
    this.meter = new Meter(this)
  }
}

export class EthContext extends BaseContext {
  chainId: number
  log?: Log
  block?: Block
  trace?: Trace
  blockNumber: Long
  transactionHash?: string

  constructor(chainId: number, block?: Block, log?: Log, trace?: Trace) {
    super()
    this.chainId = chainId
    this.log = log
    this.block = block
    this.trace = trace
    if (log) {
      this.blockNumber = Long.fromNumber(log.blockNumber)
      this.transactionHash = log.transactionHash
    } else if (block) {
      this.blockNumber = Long.fromNumber(block.number)
    }
    if (trace) {
      this.blockNumber = Long.fromNumber(trace.blockNumber)
      this.transactionHash = trace.transactionHash
    }
  }
}

export class Context<
  TContract extends BaseContract,
  TContractBoundView extends BoundContractView<TContract, ContractView<TContract>>
> extends EthContext {
  contract: TContractBoundView
  address: string

  constructor(view: TContractBoundView, chainId: number, block?: Block, log?: Log, trace?: Trace) {
    super(chainId, block, log, trace)
    view.context = this
    this.contract = view
    this.address = view.rawContract.address
  }
}

export class ContractView<TContract extends BaseContract> {
  filters: { [name: string]: (...args: Array<any>) => EventFilter }
  protected contract: TContract

  constructor(contract: TContract) {
    this.contract = contract
    this.filters = contract.filters
  }

  get rawContract() {
    return this.contract
  }

  get provider() {
    return this.contract.provider
  }
}

export class BoundContractView<TContract extends BaseContract, TContractView extends ContractView<TContract>> {
  protected view: TContractView
  // context will be set right after context creation (in context's constructor)
  context: Context<TContract, BoundContractView<TContract, TContractView>>

  constructor(view: TContractView) {
    this.view = view
  }

  get rawContract() {
    return this.view.rawContract
  }

  get provider() {
    return this.view.provider
  }

  get filters() {
    return this.view.filters
  }
}

export class SolanaContext extends BaseContext {
  address: string

  constructor(address: string) {
    super()
    this.address = address
  }
}

export class SuiContext extends BaseContext {
  address: string

  constructor(address: string) {
    super()
    this.address = address
  }
}

export class AptosContext extends BaseContext {
  address: string

  constructor(address: string) {
    super()
    this.address = address
  }
}
