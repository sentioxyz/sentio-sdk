import { RecordMetaData } from '@sentio/protos'
import { type Labels, normalizeLabels } from '../index.js'
import { getClient, IotaNetwork } from './network.js'
import {
  IotaTransactionBlockResponse,
  IotaEvent,
  IotaMoveNormalizedModule,
  IotaMoveObject,
  IotaClient
} from '@iota/iota-sdk/client'
import { MoveCoder } from './index.js'
import { defaultMoveCoder } from './move-coder.js'
import { MoveAccountContext, MoveContext } from '../move/index.js'

export class IotaContext extends MoveContext<IotaNetwork, IotaMoveNormalizedModule, IotaEvent | IotaMoveObject> {
  moduleName: string
  timestamp: Date
  checkpoint: bigint
  transaction: IotaTransactionBlockResponse
  eventIndex: number
  coder: MoveCoder

  constructor(
    moduleName: string,
    network: IotaNetwork,
    address: string,
    timestamp: Date,
    checkpoint: bigint,
    transaction: IotaTransactionBlockResponse,
    eventIndex: number,
    baseLabels: Labels | undefined
  ) {
    super(baseLabels)
    this.address = address.toLowerCase()
    this.network = network
    this.moduleName = moduleName
    this.timestamp = timestamp
    this.checkpoint = checkpoint
    this.eventIndex = eventIndex
    this.coder = defaultMoveCoder(network)
    if (transaction) {
      this.transaction = transaction
    }
  }

  getChainId() {
    return this.network
  }

  getTimestamp(): number {
    return this.timestamp.getDate()
  }

  getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.moduleName,
      blockNumber: this.checkpoint,
      transactionIndex: 0,
      transactionHash: this.transaction?.digest || '', // TODO
      logIndex: this.eventIndex,
      chainId: this.getChainId(),
      name: name,
      labels: normalizeLabels(labels)
    }
  }

  get client(): IotaClient {
    return getClient(this.network)
  }
}

export class IotaObjectChangeContext extends MoveContext<
  IotaNetwork,
  IotaMoveNormalizedModule,
  IotaEvent | IotaMoveObject
> {
  timestamp: Date
  checkpoint: bigint
  coder: MoveCoder
  txDigest: string

  constructor(
    network: IotaNetwork,
    address: string,
    timestamp: Date,
    checkpoint: bigint,
    txDigest: string,
    baseLabels: Labels | undefined
  ) {
    super(baseLabels)
    this.address = address
    this.network = network
    this.timestamp = timestamp
    this.checkpoint = checkpoint
    this.txDigest = txDigest
    this.coder = defaultMoveCoder(network)
  }

  getChainId() {
    return this.network
  }

  getTimestamp(): number {
    return this.timestamp.getDate()
  }

  getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: '*',
      blockNumber: this.checkpoint,
      transactionIndex: -1,
      transactionHash: this.txDigest,
      logIndex: 0,
      chainId: this.getChainId(),
      name: name,
      labels: normalizeLabels(labels)
    }
  }

  get client(): IotaClient {
    return getClient(this.network)
  }
}

// TODO address handler should use this context
export class IotaAddressContext extends MoveAccountContext<
  IotaNetwork,
  IotaMoveNormalizedModule,
  IotaEvent | IotaMoveObject
> {
  address: string
  network: IotaNetwork
  checkpoint: bigint
  timestamp: Date
  coder: MoveCoder

  protected contractName = 'address'

  constructor(
    network: IotaNetwork,
    address: string,
    checkpoint: bigint,
    timestamp: Date,
    baseLabels: Labels | undefined
  ) {
    super(baseLabels)
    this.address = address
    this.network = network
    this.checkpoint = checkpoint
    this.timestamp = timestamp
    this.coder = defaultMoveCoder(network)
  }

  getChainId() {
    return this.network
  }

  getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.contractName,
      blockNumber: this.checkpoint,
      transactionIndex: 0,
      transactionHash: '',
      logIndex: 0,
      chainId: this.getChainId(),
      name: name,
      labels: normalizeLabels(labels)
    }
  }

  get client(): IotaClient {
    return getClient(this.network)
  }

  getTimestamp(): number {
    return this.timestamp.getDate()
  }
}

export class IotaObjectContext extends IotaAddressContext {
  contractName = 'object'
  objectId: string
  objectVersion: bigint

  constructor(
    network: IotaNetwork,
    objectId: string,
    objectVersion: bigint,
    checkpoint: bigint,
    timestamp: Date,
    baseLabels: Labels | undefined
  ) {
    super(network, objectId, checkpoint, timestamp, baseLabels)
    this.objectId = objectId
    this.objectVersion = objectVersion
  }
}
