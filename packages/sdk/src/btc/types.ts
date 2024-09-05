import { BaseContext, Labels, normalizeLabels } from '../core/index.js'
import { RecordMetaData } from '@sentio/protos'
import { ChainId } from '@sentio/chain'

export type Vin = {
  vin_index: number
  coinbase?: string
  spent_transaction_hash?: string
  spent_output_index?: number
  sequence: number
  witness?: string[]
  script_asm: string
  script_hex: string
  value: number
  addresses?: string[]
  pre_vout?: Vout
  pre_transaction?: Transaction
}

export type Vout = {
  value: number
  vout_index: number
  script_asm: string
  script_hex: string
  script_type: string
  script_address: string
  script_reg_sigs: number
}

export type Transaction = {
  transaction_hash: string
  transaction_index: number
  block_hash: string
  block_number: number
  block_timestamp: Date
  size: number
  virtual_size: number
  version: number
  lock_time: number
  input_count: number
  output_count: number
  vin: Vin[]
  vout: Vout[]
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
      blockNumber: BigInt(this.tx.block_number ?? 0),
      transactionIndex: 0,
      transactionHash: this.tx.transaction_hash,
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
