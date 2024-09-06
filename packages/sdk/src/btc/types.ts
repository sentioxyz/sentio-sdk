import { BaseContext, Labels, normalizeLabels } from '../core/index.js'
import { RecordMetaData } from '@sentio/protos'
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

export type Block = {
  block_hash: string
  block_number: number
  block_timestamp: Date
  size: number
  stripped_size: number
  weight: number
  version: number
  merkle_root: string
  nonce: number
  bits: string
  difficulty: number
  previous_hash: string
  next_hash: string
  transaction_count: number
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
