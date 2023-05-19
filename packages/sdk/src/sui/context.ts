import { RecordMetaData } from '@sentio/protos'
import { type Labels, normalizeLabels } from '../index.js'
import { getClient, SuiNetwork } from './network.js'
import {
  SuiTransactionBlockResponse,
  JsonRpcProvider,
  SuiEvent,
  SuiMoveNormalizedModule,
  SuiMoveObject,
} from '@mysten/sui.js'
import { MoveCoder, defaultMoveCoder } from './move-coder.js'
import { MoveAccountContext, MoveContext } from '../move/index.js'

export class SuiContext extends MoveContext<SuiNetwork, SuiMoveNormalizedModule, SuiEvent | SuiMoveObject> {
  moduleName: string
  timestamp: Date
  checkpoint: bigint
  transaction: SuiTransactionBlockResponse
  eventIndex: number
  coder: MoveCoder

  constructor(
    moduleName: string,
    network: SuiNetwork,
    address: string,
    timestamp: Date,
    checkpoint: bigint,
    transaction: SuiTransactionBlockResponse,
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
      logIndex: 0,
      chainId: this.getChainId(),
      name: name,
      labels: normalizeLabels(labels),
    }
  }

  get client(): JsonRpcProvider {
    return getClient(this.network)
  }
}

// TODO address handler should use this context
export class SuiAddressContext extends MoveAccountContext<
  SuiNetwork,
  SuiMoveNormalizedModule,
  SuiEvent | SuiMoveObject
> {
  address: string
  network: SuiNetwork
  checkpoint: bigint
  timestamp: Date
  coder: MoveCoder

  protected contractName = 'address'

  constructor(
    network: SuiNetwork,
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
      labels: normalizeLabels(labels),
    }
  }

  get client(): JsonRpcProvider {
    return getClient(this.network)
  }

  getTimestamp(): number {
    return this.timestamp.getDate()
  }
}

export class SuiObjectContext extends SuiAddressContext {
  contractName = 'object'
  objectId: string

  constructor(
    network: SuiNetwork,
    objectId: string,
    checkpoint: bigint,
    timestamp: Date,
    baseLabels: Labels | undefined
  ) {
    super(network, objectId, checkpoint, timestamp, baseLabels)
    this.objectId = objectId
  }
}
