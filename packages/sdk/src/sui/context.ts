import { RecordMetaData } from '@sentio/protos'
import { type Labels, BaseContext, normalizeLabels } from '../index.js'
import { SuiNetwork, getChainId } from './network.js'
import { SuiTransactionBlockResponse } from '@mysten/sui.js'

export class SuiContext extends BaseContext {
  address: string
  network: SuiNetwork
  moduleName: string
  timestamp: Date
  slot: bigint
  transaction: SuiTransactionBlockResponse
  eventIndex: number

  constructor(
    moduleName: string,
    network: SuiNetwork,
    address: string,
    timestamp: Date,
    slot: bigint,
    transaction: SuiTransactionBlockResponse,
    eventIndex: number
  ) {
    super()
    this.address = address.toLowerCase()
    this.network = network
    this.moduleName = moduleName
    this.timestamp = timestamp
    this.slot = slot
    this.eventIndex = eventIndex
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
      blockNumber: this.slot,
      transactionIndex: 0,
      transactionHash: this.transaction?.digest || '', // TODO
      logIndex: 0,
      chainId: this.getChainId(),
      name: name,
      labels: normalizeLabels(labels),
    }
  }
}

export class SuiObjectsContext extends BaseContext {
  address: string
  network: SuiNetwork
  slot: bigint
  timestamp: Date

  constructor(network: SuiNetwork, address: string, slot: bigint, timestamp: Date) {
    super()
    this.address = address
    this.network = network
    this.slot = slot
    this.timestamp = timestamp
  }

  getChainId(): string {
    return getChainId(this.network)
  }

  getMetaData(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: 'objects',
      blockNumber: this.slot,
      transactionIndex: 0,
      transactionHash: '',
      logIndex: 0,
      chainId: this.getChainId(),
      name: name,
      labels: normalizeLabels(labels),
    }
  }
}
