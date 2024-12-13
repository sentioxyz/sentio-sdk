import { RecordMetaData } from '@sentio/protos'
import { type Labels, normalizeLabels } from '../index.js'
import { MoveCoder, RichAptosClientWithContext } from './index.js'
import { Event, MoveResource, UserTransactionResponse, MoveModuleBytecode, AptosConfig } from '@aptos-labs/ts-sdk'
import { defaultMoveCoder } from './move-coder.js'
import { AptosNetwork } from './network.js'
import { Endpoints } from '@sentio/runtime'
import { ServerError, Status } from 'nice-grpc'
import { MoveContext } from '../move/index.js'
import { GeneralTransactionResponse } from './models.js'

export abstract class AptosBaseContext extends MoveContext<AptosNetwork, MoveModuleBytecode, Event | MoveResource> {
  version: bigint
  coder: MoveCoder

  protected constructor(network: AptosNetwork, version: bigint, labels?: Labels) {
    super(labels)
    this.network = network
    this.coder = defaultMoveCoder(this.network)
    this.version = version
  }

  getClient(): RichAptosClientWithContext {
    let chainServer = Endpoints.INSTANCE.chainServer.get(this.network)
    if (!chainServer) {
      throw new ServerError(Status.INTERNAL, 'RPC endpoint not provided')
    }
    chainServer = chainServer + '/v1'
    return new RichAptosClientWithContext(this, new AptosConfig({ fullnode: chainServer }))
  }
}

export class AptosTransactionContext<T extends GeneralTransactionResponse> extends AptosBaseContext {
  moduleName: string
  transaction: T
  eventIndex: number

  constructor(
    moduleName: string,
    network: AptosNetwork,
    address: string,
    version: bigint,
    transaction: T | null,
    eventIndex: number,
    baseLabels: Labels | undefined
  ) {
    super(network, version, baseLabels)
    this.address = address.toLowerCase()
    this.moduleName = moduleName
    this.eventIndex = eventIndex
    if (transaction) {
      this.transaction = transaction
    }
  }

  getChainId() {
    return this.network
  }

  getTimestamp(): number {
    return parseInt(this.transaction.timestamp)
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
      labels: normalizeLabels(labels)
    }
  }
}

export class AptosContext extends AptosTransactionContext<UserTransactionResponse> {}

export class AptosResourcesContext extends AptosBaseContext {
  timestampInMicros: number

  constructor(network: AptosNetwork, address: string, version: bigint, timestampInMicros: number, baseLabels?: Labels) {
    super(network, version, baseLabels)
    this.address = address
    this.timestampInMicros = timestampInMicros
  }

  getChainId() {
    return this.network
  }

  getTimestamp(): number {
    return this.timestampInMicros
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
      labels: normalizeLabels(labels)
    }
  }
}
