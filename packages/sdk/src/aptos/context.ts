import Long from 'long'
import { RecordMetaData } from '@sentio/protos'
import { Labels } from '../core/metadata'
import { normalizeLabels } from '../core/meter'
import { BaseContext } from '../core/base-context'
import { Transaction_UserTransaction } from 'aptos-sdk/src/generated'
import { AptosNetwork, getChainId } from './network'

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
    this.address = address
    this.network = network
    this.moduleName = moduleName
    this.version = version
    if (transaction) {
      this.transaction = transaction
    }
  }

  getMetaData(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.moduleName,
      blockNumber: Long.fromString(this.version.toString()),
      transactionIndex: 0,
      transactionHash: this.transaction?.hash || '', // TODO
      logIndex: 0,
      chainId: getChainId(this.network),
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

  getMetaData(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: 'resources',
      blockNumber: Long.fromString(this.version.toString()),
      transactionIndex: 0,
      transactionHash: '',
      logIndex: 0,
      chainId: getChainId(this.network),
      name: name,
      labels: normalizeLabels(labels),
    }
  }
}
