import { BaseContext, Labels, normalizeLabels } from '../core/index.js'
import { ChainId } from '@sentio/chain'
import { RecordMetaData } from '@sentio/protos'
import { InvocationCallResult } from '@fuel-ts/program'
import { FuelTransaction } from './transaction.js'

export type FuelCall = InvocationCallResult

export class FuelContext extends BaseContext {
  constructor(
    readonly chainId: ChainId,
    readonly contractAddress: string,
    readonly contractName: string,
    readonly transaction: FuelTransaction | null
  ) {
    super({})
  }

  getChainId(): ChainId {
    return this.chainId
  }

  protected getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.contractAddress,
      contractName: this.contractName,
      blockNumber: BigInt(this.transaction?.blockNumber || 0),
      transactionIndex: 0,
      transactionHash: this.transaction?.id || '', // TODO
      chainId: this.getChainId(),
      name: name,
      logIndex: -1,
      labels: normalizeLabels(labels)
    }
  }
}
