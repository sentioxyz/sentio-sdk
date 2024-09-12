import { BaseContext, Labels, normalizeLabels } from '../core/index.js'
import { ChainId } from '@sentio/chain'
import { RecordMetaData } from '@sentio/protos'
import type { CallResult, Contract } from 'fuels'
import { InvocationScopeLike } from 'fuels'
import { FuelBlock, FuelLog, FuelTransaction } from './types.js'

export class FuelCall {
  constructor(
    funcScopes: InvocationScopeLike | Array<InvocationScopeLike>,
    callResult: CallResult,
    isMultiCall: boolean,
    readonly args?: Record<string, any>,
    readonly logs?: FuelLog<unknown>[]
  ) {
    // super(funcScopes, callResult, isMultiCall)
  }
}

export class FuelContext extends BaseContext {
  private logIndex: number = -1
  constructor(
    readonly chainId: ChainId,
    readonly contractAddress: string,
    readonly contractName: string,
    readonly timestamp: Date,
    readonly transaction: FuelTransaction | null,
    readonly block: FuelBlock | null
  ) {
    super({})
  }

  getChainId(): ChainId {
    return this.chainId
  }

  setLogIndex(logIndex: number): void {
    this.logIndex = logIndex
  }

  protected getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.contractAddress,
      contractName: this.contractName,
      blockNumber: BigInt(this.block?.height?.toString() ?? (this.transaction?.blockNumber || 0)),
      transactionIndex: 0,
      transactionHash: this.transaction?.id || '', // TODO
      chainId: this.getChainId(),
      name: name,
      logIndex: this.logIndex,
      labels: normalizeLabels(labels)
    }
  }
}

export class FuelContractContext<TContract extends Contract> extends FuelContext {
  constructor(
    readonly chainId: ChainId,
    readonly contract: TContract,
    readonly contractAddress: string,
    readonly contractName: string,
    readonly timestamp: Date,
    readonly transaction: FuelTransaction | null,
    readonly block: FuelBlock | null
  ) {
    super(chainId, contractAddress, contractName, timestamp, transaction, block)
  }

  get provider() {
    return this.contract.provider
  }
}
