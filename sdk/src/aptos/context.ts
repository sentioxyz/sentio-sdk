import Long from 'long'
import { DataDescriptor, RecordMetaData } from '../gen'
import { Labels } from '../core/metadata'
import { normalizeLabels } from '../core/meter'
import { BaseContext } from '../core/context'
import { AptosNetwork, Transaction_UserTransaction } from './'
import { getChainId } from './network'

export class AptosContext extends BaseContext {
  address: string
  network: AptosNetwork
  moduleName: string
  version: Long
  transaction: Transaction_UserTransaction

  constructor(
    moduleName: string,
    network: AptosNetwork,
    address: string,
    version: Long,
    transaction?: Transaction_UserTransaction
  ) {
    super()
    this.address = address
    this.network = network
    this.moduleName = moduleName
    this.version = version
    if (transaction) {
      this.transaction = transaction
    }
  }

  getMetaData(descriptor: DataDescriptor, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.moduleName,
      blockNumber: this.version,
      transactionIndex: 0,
      transactionHash: this.transaction?.hash || '', // TODO
      logIndex: 0,
      chainId: getChainId(this.network),
      dataDescriptor: descriptor,
      name: descriptor.name,
      labels: normalizeLabels(labels),
    }
  }
}
