import { RecordMetaData } from '@sentio/protos'
import { type Labels, BaseContext, normalizeLabels } from '../index.js'
import { SuiNetwork, getChainId } from './network.js'
import { SuiTransactionBlockResponse, JsonRpcProvider, Connection } from '@mysten/sui.js'
import { MoveCoder, defaultMoveCoder } from './move-coder.js'
import { Endpoints } from '@sentio/runtime'
import { ServerError, Status } from 'nice-grpc'

export class SuiContext extends BaseContext {
  address: string
  network: SuiNetwork
  moduleName: string
  timestamp: Date
  slot: bigint
  transaction: SuiTransactionBlockResponse
  eventIndex: number
  coder: MoveCoder

  constructor(
    moduleName: string,
    network: SuiNetwork,
    address: string,
    timestamp: Date,
    slot: bigint,
    transaction: SuiTransactionBlockResponse,
    eventIndex: number,
    baseLabels: Labels | undefined
  ) {
    super(baseLabels)
    this.address = address.toLowerCase()
    this.network = network
    this.moduleName = moduleName
    this.timestamp = timestamp
    this.slot = slot
    this.eventIndex = eventIndex
    this.coder = defaultMoveCoder(network)
    if (transaction) {
      this.transaction = transaction
    }
  }

  getChainId(): string {
    return getChainId(this.network)
  }

  getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
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

  get client(): JsonRpcProvider {
    const chainServer = Endpoints.INSTANCE.chainServer.get(getChainId(this.network))
    if (!chainServer) {
      throw new ServerError(Status.INTERNAL, 'RPC endpoint not provided')
    }
    return new JsonRpcProvider(new Connection({ fullnode: chainServer }))
  }
}

export class SuiObjectsContext extends BaseContext {
  address: string
  network: SuiNetwork
  slot: bigint
  timestamp: Date
  coder: MoveCoder

  constructor(network: SuiNetwork, address: string, slot: bigint, timestamp: Date, baseLabels: Labels | undefined) {
    super(baseLabels)
    this.address = address
    this.network = network
    this.slot = slot
    this.timestamp = timestamp
    this.coder = defaultMoveCoder(network)
  }

  getChainId(): string {
    return getChainId(this.network)
  }

  getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
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

  get client(): JsonRpcProvider {
    const chainServer = Endpoints.INSTANCE.chainServer.get(getChainId(this.network))
    if (!chainServer) {
      throw new ServerError(Status.INTERNAL, 'RPC endpoint not provided')
    }
    return new JsonRpcProvider(new Connection({ fullnode: chainServer }))
  }
}
