import { RecordMetaData } from '@sentio/protos'
import { type Labels, BaseContext, normalizeLabels } from '@sentio/sdk'
import { Transaction_UserTransaction } from './move-types.js'
import { AptosNetwork } from './network.js'
import { defaultMoveCoder, MoveCoder } from './move-coder.js'
import { Endpoints } from '@sentio/runtime'
import { ServerError, Status } from 'nice-grpc'
import { AptosClient } from 'aptos-sdk'

export class AptosContext extends BaseContext {
  address: string
  network: AptosNetwork
  moduleName: string
  version: bigint
  transaction: Transaction_UserTransaction
  eventIndex: number
  coder: MoveCoder

  constructor(
    moduleName: string,
    network: AptosNetwork,
    address: string,
    version: bigint,
    transaction: Transaction_UserTransaction,
    eventIndex: number,
    baseLabels: Labels | undefined
  ) {
    super(baseLabels)
    this.address = address.toLowerCase()
    this.network = network
    this.moduleName = moduleName
    this.version = version
    this.eventIndex = eventIndex
    this.coder = defaultMoveCoder(network)
    if (transaction) {
      this.transaction = transaction
    }
  }

  getChainId() {
    return this.network
  }

  getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.moduleName,
      blockNumber: this.version,
      transactionIndex: 0,
      transactionHash: this.transaction?.hash || '', // TODO
      logIndex: this.eventIndex,
      chainId: this.getChainId(),
      name: name,
      labels: normalizeLabels(labels),
    }
  }
}

export class AptosResourcesContext extends BaseContext {
  address: string
  network: AptosNetwork
  version: bigint
  timestampInMicros: number
  coder: MoveCoder

  constructor(network: AptosNetwork, address: string, version: bigint, timestampInMicros: number, baseLabels?: Labels) {
    super(baseLabels)
    this.address = address
    this.network = network
    this.version = version
    this.timestampInMicros = timestampInMicros
    this.coder = defaultMoveCoder(network)
  }

  getChainId() {
    return this.network
  }

  getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
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

  getClient(): AptosClient {
    const chainServer = Endpoints.INSTANCE.chainServer.get(this.network)
    if (!chainServer) {
      throw new ServerError(Status.INTERNAL, 'RPC endpoint not provided')
    }
    return new AptosClient(chainServer)
  }
}
