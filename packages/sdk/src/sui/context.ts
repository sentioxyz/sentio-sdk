import { RecordMetaData } from '@sentio/protos'
import { type Labels, BaseContext, normalizeLabels } from '@sentio/sdk'
import { SuiNetwork, getChainId } from './network.js'
import { SuiTransactionResponse } from '@mysten/sui.js'

export class SuiContext extends BaseContext {
  address: string
  network: SuiNetwork
  moduleName: string
  timestamp: Date
  slot: bigint
  transaction: SuiTransactionResponse
  sequence: bigint

  constructor(
    moduleName: string,
    network: SuiNetwork,
    address: string,
    timestamp: Date,
    slot: bigint,
    transaction?: SuiTransactionResponse
  ) {
    super()
    this.address = address
    this.network = network
    this.moduleName = moduleName
    this.timestamp = timestamp
    this.slot = slot
    if (transaction) {
      this.transaction = transaction
    }
  }

  getMetaData(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.moduleName,
      blockNumber: this.slot,
      transactionIndex: 0,
      transactionHash: this.transaction?.certificate.transactionDigest || '', // TODO
      logIndex: 0,
      chainId: getChainId(this.network),
      name: name,
      labels: normalizeLabels(labels),
    }
  }
}
