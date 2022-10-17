import { CounterResult, GaugeResult, LogResult, DataDescriptor, RecordMetaData } from '../gen'
import { BaseContract, EventFilter } from 'ethers'
import { Block, Log } from '@ethersproject/abstract-provider'
import { Meter, normalizeLabels } from './meter'
import Long from 'long'
import { Trace } from './trace'
import { Logger } from './logger'
import { Labels } from './metadata'
import { SOL_MAINMET_ID, SUI_DEVNET_ID } from '../utils/chain'

export abstract class BaseContext {
  gauges: GaugeResult[] = []
  counters: CounterResult[] = []
  logs: LogResult[] = []
  meter: Meter
  logger: Logger

  protected constructor() {
    this.meter = new Meter(this)
    this.logger = new Logger(this)
  }

  abstract getMetaData(descriptor: DataDescriptor | undefined, labels: Labels): RecordMetaData
}

export abstract class EthContext extends BaseContext {
  chainId: number
  address: string
  log?: Log
  block?: Block
  trace?: Trace
  blockNumber: Long
  transactionHash?: string

  protected constructor(chainId: number, address: string, block?: Block, log?: Log, trace?: Trace) {
    super()
    this.chainId = chainId
    this.log = log
    this.block = block
    this.trace = trace
    this.address = address
    if (log) {
      this.blockNumber = Long.fromNumber(log.blockNumber, true)
      this.transactionHash = log.transactionHash
    } else if (block) {
      this.blockNumber = Long.fromNumber(block.number, true)
    } else if (trace) {
      this.blockNumber = Long.fromNumber(trace.blockNumber, true)
      this.transactionHash = trace.transactionHash
    }
  }
}

export class ContractContext<
  TContract extends BaseContract,
  TContractBoundView extends BoundContractView<TContract, ContractView<TContract>>
> extends EthContext {
  contract: TContractBoundView
  contractName: string

  constructor(
    contractName: string,
    view: TContractBoundView,
    chainId: number,
    block?: Block,
    log?: Log,
    trace?: Trace
  ) {
    super(chainId, view.rawContract.address, block, log, trace)
    view.context = this
    this.contractName = contractName
    this.contract = view
  }

  getMetaData(descriptor: DataDescriptor | undefined, labels: Labels): RecordMetaData {
    if (this.log) {
      return {
        address: this.contract.rawContract.address,
        contractName: this.contractName,
        blockNumber: this.blockNumber,
        transactionIndex: this.log.transactionIndex,
        transactionHash: this.transactionHash || '',
        logIndex: this.log.logIndex,
        chainId: this.chainId.toString(),
        dataDescriptor: descriptor,
        labels: normalizeLabels(labels),
      }
    }
    if (this.block) {
      return {
        address: this.contract.rawContract.address,
        contractName: this.contractName,
        blockNumber: this.blockNumber,
        transactionIndex: -1,
        transactionHash: '',
        logIndex: -1,
        chainId: this.chainId.toString(),
        dataDescriptor: descriptor,
        labels: normalizeLabels(labels),
      }
    }
    if (this.trace) {
      return {
        address: this.contract.rawContract.address,
        contractName: this.contractName,
        blockNumber: this.blockNumber,
        transactionIndex: this.trace.transactionPosition,
        transactionHash: this.transactionHash || '',
        logIndex: -1,
        chainId: this.chainId.toString(),
        dataDescriptor: descriptor,
        labels: normalizeLabels(labels),
      }
    }
    throw new Error("Invaid ctx argument can't happen")
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
  context: ContractContext<TContract, BoundContractView<TContract, TContractView>>

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
  programName: string
  blockNumber: Long

  constructor(programName: string, address: string, slot: Long) {
    super()
    this.programName = programName
    this.address = address
    this.blockNumber = slot
  }

  getMetaData(descriptor: DataDescriptor | undefined, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.programName,
      blockNumber: this.blockNumber,
      transactionIndex: 0,
      transactionHash: '', // TODO add
      logIndex: 0,
      chainId: SOL_MAINMET_ID, // TODO set in context
      dataDescriptor: descriptor,
      labels: normalizeLabels(labels),
    }
  }
}

export class SuiContext extends BaseContext {
  address: string
  moduleName: string
  blockNumber: Long

  constructor(address: string, slot: Long) {
    super()
    this.address = address
    this.blockNumber = slot
  }

  getMetaData(descriptor: DataDescriptor | undefined, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.moduleName,
      blockNumber: this.blockNumber,
      transactionIndex: 0,
      transactionHash: '', // TODO
      logIndex: 0,
      chainId: SUI_DEVNET_ID, // TODO set in context
      dataDescriptor: descriptor,
      labels: normalizeLabels(labels),
    }
  }
}
