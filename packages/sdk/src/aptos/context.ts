import { RecordMetaData } from '@sentio/protos'
import { type Labels, BaseContext, normalizeLabels } from '@sentio/sdk'
import { Transaction_UserTransaction } from './move-types.js'
import { AptosNetwork, getChainId } from './network.js'

export class AptosContext extends BaseContext {
  address: string
  network: AptosNetwork
  moduleName: string
  version: bigint
  transaction: Transaction_UserTransaction

  constructor(
    moduleName: string,
    network: AptosNetwork,
    address: string,
    version: bigint,
    transaction?: Transaction_UserTransaction
  ) {
    super()
    this.address = address.toLowerCase()
    this.network = network
    this.moduleName = moduleName
    this.version = version
    if (transaction) {
      this.transaction = transaction
    }
  }

  getChainId(): string {
    return getChainId(this.network)
  }

  getMetaData(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.moduleName,
      blockNumber: this.version,
      transactionIndex: 0,
      transactionHash: this.transaction?.hash || '', // TODO
      logIndex: 0,
      chainId: this.getChainId(),
      name: name,
      labels: normalizeLabels(labels),
    }
  }
}

export class AptosResourceContext extends BaseContext {
  address: string
  network: AptosNetwork
  version: bigint
  timestampInMicros: number

  constructor(network: AptosNetwork, address: string, version: bigint, timestampInMicros: number) {
    super()
    this.address = address
    this.network = network
    this.version = version
    this.timestampInMicros = timestampInMicros
  }

  getChainId(): string {
    return getChainId(this.network)
  }

  getMetaData(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: 'resources',
      blockNumber: this.version,
      transactionIndex: 0,
      transactionHash: '',
      logIndex: 0,
      chainId: this.getChainId(),
      name: name,
      labels: normalizeLabels(labels),
    }
  }
}
