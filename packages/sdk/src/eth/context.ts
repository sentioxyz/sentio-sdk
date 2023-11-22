import { BaseContract } from 'ethers'
import { LogParams, BlockParams, TransactionReceiptParams, TransactionResponseParams } from 'ethers/providers'

import { RecordMetaData } from '@sentio/protos'
import { Trace } from './eth.js'
import { Labels, normalizeLabels } from '../core/index.js'
import { BaseContext } from '../core/base-context.js'
import { EthChainId } from '@sentio/chain'

export abstract class EthContext extends BaseContext {
  readonly chainId: EthChainId
  readonly address: string
  private readonly log?: LogParams
  readonly block?: BlockParams
  private readonly trace?: Trace
  readonly blockNumber: number
  readonly transactionHash?: string
  readonly transaction?: TransactionResponseParams
  readonly transactionReceipt?: TransactionReceiptParams
  readonly timestamp: Date

  constructor(
    chainId: EthChainId,
    address: string,
    timestamp?: Date,
    block?: BlockParams,
    log?: LogParams,
    trace?: Trace,
    transaction?: TransactionResponseParams,
    transactionReceipt?: TransactionReceiptParams,
    baseLabels?: Labels
  ) {
    super(baseLabels)
    this.chainId = chainId
    this.log = log
    this.block = block
    this.trace = trace
    this.address = address.toLowerCase()
    this.transaction = transaction
    this.transactionReceipt = transactionReceipt
    this.timestamp = timestamp || new Date(0)
    if (log) {
      this.blockNumber = log.blockNumber
      this.transactionHash = log.transactionHash
    } else if (block) {
      this.blockNumber = block.number
    } else if (trace) {
      this.blockNumber = trace.blockNumber
      this.transactionHash = trace.transactionHash
    }
  }

  protected abstract getContractName(): string

  getChainId(): EthChainId {
    return this.chainId
  }

  getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    if (this.log) {
      return {
        address: this.address,
        contractName: this.getContractName(),
        blockNumber: BigInt(this.blockNumber),
        transactionIndex: this.log.transactionIndex,
        transactionHash: this.transactionHash || '',
        logIndex: this.log.index,
        chainId: this.chainId,
        name: name,
        labels: normalizeLabels(labels)
      }
    }
    if (this.block) {
      return {
        address: this.address,
        contractName: this.getContractName(),
        blockNumber: BigInt(this.blockNumber),
        transactionIndex: -1,
        transactionHash: '',
        logIndex: -1,
        chainId: this.chainId.toString(),
        name: name,
        labels: normalizeLabels(labels)
      }
    }
    if (this.trace) {
      return {
        address: this.address,
        contractName: this.getContractName(),
        blockNumber: BigInt(this.blockNumber),
        transactionIndex: this.trace.transactionPosition,
        transactionHash: this.transactionHash || '',
        logIndex: -1,
        chainId: this.chainId.toString(),
        name: name,
        labels: normalizeLabels(labels)
      }
    }
    if (this.transaction) {
      return {
        address: this.address,
        contractName: this.getContractName(),
        blockNumber: BigInt(this.blockNumber),
        transactionIndex: this.transaction.index || 0,
        transactionHash: this.transaction.hash || '',
        logIndex: -1,
        chainId: this.chainId.toString(),
        name: name,
        labels: normalizeLabels(labels)
      }
    }
    throw new Error("Invaid ctx argument can't happen")
  }
}

export class AccountContext extends EthContext {
  // constructor(chainId: number, address: string, block?: Block, log?: Log, trace?: Trace) {
  //   super(chainId, address, new Date(0), block, log, trace)
  // }
  protected getContractName(): string {
    return 'account'
  }
}

export class GlobalContext extends EthContext {
  constructor(
    chainId: EthChainId,
    timestamp?: Date,
    block?: BlockParams,
    log?: LogParams,
    trace?: Trace,
    transaction?: TransactionResponseParams,
    transactionReceipt?: TransactionReceiptParams
  ) {
    super(chainId, '*', timestamp, block, log, trace, transaction, transactionReceipt)
  }
  protected getContractName(): string {
    return '*'
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
    chainId: EthChainId,
    timestamp?: Date,
    block?: BlockParams,
    log?: LogParams,
    trace?: Trace,
    transaction?: TransactionResponseParams,
    transactionReceipt?: TransactionReceiptParams,
    baseLabels?: Labels
  ) {
    super(chainId, view.address, timestamp, block, log, trace, transaction, transactionReceipt, baseLabels)
    view.context = this
    if (view.callStatic) {
      view.callStatic.context = this
    }
    this.contractName = contractName
    this.contract = view
  }

  protected getContractName(): string {
    return this.contractName
  }
}

export class ContractView<TContract extends BaseContract> {
  protected contract: TContract

  constructor(contract: TContract) {
    this.contract = contract
  }

  get rawContract() {
    return this.contract
  }

  get provider() {
    if (this.contract.runner?.provider) {
      return this.contract.runner.provider
    }
    throw Error("Can't find provider for contract" + this.contract.toString())
  }
}

export class BoundContractView<TContract extends BaseContract, TContractView extends ContractView<TContract>> {
  protected view: TContractView
  readonly address: string
  // context will be set right after context creation (in context's constructor)
  // context: ContractContext<TContract, BoundContractView<TContract, TContractView>>
  context: EthContext
  callStatic: {
    context: EthContext
    view: TContractView
  }

  constructor(address: string, view: TContractView) {
    this.address = address
    this.view = view
  }

  get rawContract() {
    return this.view.rawContract
  }

  get provider() {
    return this.view.provider
  }

  get filters() {
    return this.view.rawContract.filters
  }
}
