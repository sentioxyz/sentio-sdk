import Long from 'long'
import { DataDescriptor, RecordMetaData } from '../gen'
import { Labels } from '../core/metadata'
import { APTOS_TESTNET_ID } from '../utils/chain'
import { normalizeLabels } from '../core/meter'
import { BaseContext } from '../core/context'
import { Transaction_UserTransaction } from './'

export class AptosContext extends BaseContext {
  address: string
  moduleName: string
  version: Long
  transaction: Transaction_UserTransaction

  constructor(moduleName: string, address: string, version: Long, transaction?: Transaction_UserTransaction) {
    super()
    this.address = address
    this.moduleName = moduleName
    this.version = version
    if (transaction) {
      this.transaction = transaction
    }
  }

  getMetaData(descriptor: DataDescriptor | undefined, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.moduleName,
      blockNumber: this.version,
      transactionIndex: 0,
      transactionHash: this.transaction?.hash || '', // TODO
      logIndex: 0,
      chainId: APTOS_TESTNET_ID, // TODO set in context
      dataDescriptor: descriptor,
      labels: normalizeLabels(labels),
    }
  }
}
