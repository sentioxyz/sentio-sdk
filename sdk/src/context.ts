import { CounterResult, GaugeResult } from './gen/processor/protos/processor'
import { BaseContract, EventFilter } from 'ethers'
import { Block, Log } from '@ethersproject/abstract-provider'
import { Meter } from './meter'
import Long from 'long'

export class Context<
  TContract extends BaseContract,
  TContractBoundView extends BoundContractView<TContract, ContractView<TContract>>
> {
  contract: TContractBoundView
  chainId: string
  log?: Log
  block?: Block
  blockNumber: Long
  gauges: GaugeResult[] = []
  counters: CounterResult[] = []
  meter: Meter

  constructor(view: TContractBoundView, chainId: string, block?: Block, log?: Log) {
    view.context = this
    this.contract = view

    this.chainId = chainId
    this.log = log
    this.block = block
    if (log) {
      this.blockNumber = Long.fromNumber(log.blockNumber)
    } else if (block) {
      this.blockNumber = Long.fromNumber(block.number)
    }
    this.meter = new Meter(this)
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
}

export class SolanaContext {
  gauges: GaugeResult[] = []
  counters: CounterResult[] = []
  meter: Meter

  address: string

  constructor(address: string) {
    this.meter = new Meter(this)
    this.address = address
  }
}
