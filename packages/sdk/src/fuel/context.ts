import { BaseContext, Labels, normalizeLabels } from '../core/index.js'
import { ChainId } from '@sentio/chain'
import { RecordMetaData } from '@sentio/protos'
import { BaseAssetId, InputType, InvocationCallResult } from 'fuels'
import { FuelTransaction } from './transaction.js'

export type FuelCall = InvocationCallResult

export class FuelContext extends BaseContext {
  constructor(
    readonly transaction: FuelTransaction | null,
    readonly chainId: ChainId
  ) {
    super({})
  }

  getChainId(): ChainId {
    return this.chainId
  }

  protected getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    let address = ''
    for (const input of this.transaction?.transaction?.inputs || []) {
      if (input.type == InputType.Coin && input.assetId == BaseAssetId) {
        address = input.owner
      }
    }

    return {
      address,
      contractName: this.transaction?.id || '', // TODO
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
