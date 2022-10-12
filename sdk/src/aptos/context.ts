import Long from 'long'
import { MetricDescriptor, RecordMetaData } from '../gen'
import { Labels } from '../core/metadata'
import { APTOS_TESTNET_ID } from '../utils/chain'
import { normalizeLabels } from '../core/meter'
import { BaseContext } from '../core/context'
import { UserTransaction } from './'

export class AptosContext extends BaseContext {
  address: string
  blockNumber: Long
  transaction: UserTransaction

  constructor(address: string, slot: Long, transaction?: UserTransaction) {
    super()
    this.address = address
    this.blockNumber = slot
    if (transaction) {
      this.transaction = transaction
    }
  }

  getMetaData(descriptor: MetricDescriptor | undefined, labels: Labels): RecordMetaData {
    return {
      contractAddress: this.address,
      blockNumber: this.blockNumber,
      transactionIndex: 0,
      transactionHash: this.transaction?.hash || '', // TODO
      logIndex: 0,
      chainId: APTOS_TESTNET_ID, // TODO set in context
      descriptor: descriptor,
      labels: normalizeLabels(labels),
    }
  }
}
