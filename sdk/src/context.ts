import { CounterResult, GaugeResult } from './gen/processor/protos/processor'
import { BaseContract, EventFilter } from 'ethers'
import { Block, Log } from '@ethersproject/abstract-provider'
import { Meter } from './meter'
import Long from 'long'
import { Provider } from '@ethersproject/providers'

export class Context<TContract extends BaseContract, TContractWrapper extends ContractWrapper<TContract>> {
  contract: TContractWrapper
  chainId: string
  log?: Log
  block?: Block
  blockNumber: Long
  gauges: GaugeResult[] = []
  counters: CounterResult[] = []
  meter: Meter

  constructor(contract: TContractWrapper, chainId: string, block?: Block, log?: Log) {
    this.contract = contract
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

export class ContractWrapper<TContract extends BaseContract> {
  filters: { [name: string]: (...args: Array<any>) => EventFilter }
  context: Context<any, any>
  provider: Provider
  protected contract: TContract

  constructor(contract: TContract) {
    this.contract = contract
    this.provider = contract.provider
    this.filters = contract.filters
  }

  get _underlineContract() {
    return this.contract
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
