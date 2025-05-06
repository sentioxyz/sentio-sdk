import { BaseContext, Labels, normalizeLabels } from '../core/index.js'
import { FuelChainId } from '@sentio/chain'
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
    readonly chainId: FuelChainId,
    readonly contractAddress: string,
    readonly contractName: string,
    readonly timestamp: Date,
    readonly transaction: FuelTransaction | null,
    readonly block: FuelBlock | null
  ) {
    super({})
  }

  getChainId(): FuelChainId {
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
    chainId: FuelChainId,
    readonly contract: TContract | undefined,
    contractAddress: string,
    contractName: string,
    timestamp: Date,
    transaction: FuelTransaction | null,
    block: FuelBlock | null
  ) {
    super(chainId, contract?.id?.toString() ?? contractAddress, contractName, timestamp, transaction, block)
  }

  get provider() {
    return this.contract?.provider
  }
}
