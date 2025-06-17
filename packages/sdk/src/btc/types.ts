import { BaseContext, Labels, normalizeLabels } from '../core/index.js'
import { Data_BTCBlock, HandleInterval, ProcessResult, RecordMetaData } from '@sentio/protos'
import { ChainId } from '@sentio/chain'

export type Transaction = {
  txid: string
  hash: string
  txindex: number
  blockhash: string
  blockheight: number
  blocktime: number
  size: number
  vsize: number
  version: number
  locktime: number
  vin: Vin[]
  vout: Vout[]
}

export type Vin = {
  vin_index: number
  coinbase?: string
  txid?: string
  vout?: number
  sequence: number
  witness?: string[]
  scriptSig: {
    asm: string
    hex: string
  }
  pre_vout?: Vout
  pre_transaction?: Transaction
}

export type Vout = {
  value: number
  n: number
  scriptPubKey: {
    asm: string
    hex: string
    reqSigs: number
    type: string
    address: string
  }
}

export type BTCBlock = {
  hash: string
  confirmations: number
  strippedsize: number
  size: number
  weight: number
  height: number
  version: number
  merkleroot: string
  tx?: Transaction[]
  time: number
  nonce: number
  bits: string
  difficulty: number
  previousblockhash: string
  nextblockhash: string
}

export class BTCContext extends BaseContext {
  constructor(
    readonly chainId: string,
    readonly name: string,
    readonly tx: Transaction,
    readonly address: string
  ) {
    super({})
  }

  protected getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address,
      contractName: this.name,
      blockNumber: BigInt(this.tx.blockheight ?? 0),
      transactionIndex: 0,
      transactionHash: this.tx.txid,
      chainId: this.getChainId(),
      name: name,
      logIndex: 0,
      labels: normalizeLabels(labels)
    }
  }

  getChainId(): ChainId {
    return this.chainId as ChainId
  }
}

export class BTCBlockContext extends BaseContext {
  constructor(
    readonly chainId: string,
    readonly name: string,
    readonly block: BTCBlock,
    readonly address?: string
  ) {
    super({})
  }

  protected getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      address: this.address ?? '',
      contractName: this.name,
      blockNumber: BigInt(this.block.height ?? 0),
      transactionIndex: 0,
      transactionHash: '',
      chainId: this.getChainId(),
      name: name,
      logIndex: 0,
      labels: normalizeLabels(labels)
    }
  }

  getChainId(): ChainId {
    return this.chainId as ChainId
  }
}

export type BlockHandler = {
  blockInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handler: (block: Data_BTCBlock) => Promise<ProcessResult>
  handlerName: string
  fetchConfig?: BTCOnIntervalFetchConfig
  partitionHandler?: (block: Data_BTCBlock) => Promise<string | undefined>
}

export type BTCOnIntervalFetchConfig = {
  getTransactions?: boolean
}
