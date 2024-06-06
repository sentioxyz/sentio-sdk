import { BaseContext, Labels, normalizeLabels } from '../core/index.js'
import { ChainId, CosmosChainId } from '@sentio/chain'
import { RecordMetaData } from '@sentio/protos'
import { CosmosTransaction } from './transaction.js'

export class CosmosContext extends BaseContext {
  private logIndex: number = -1

  constructor(
    readonly chainId: CosmosChainId,
    readonly contractAddress: string,
    readonly transaction: CosmosTransaction
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
      contractName: labels['name'] || '',
      blockNumber: BigInt(this.transaction?.height || 0),
      transactionIndex: 0,
      transactionHash: this.transaction?.txhash || '',
      chainId: this.getChainId(),
      name: name,
      logIndex: this.logIndex,
      labels: normalizeLabels(labels)
    }
  }
}
