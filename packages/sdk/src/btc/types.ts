import { BaseContext, Labels, normalizeLabels } from '../core/index.js'
import { RecordMetaData } from '@sentio/protos'
import { ChainId } from '@sentio/chain'

type Vin = {
  txid: string
  vout: number
  is_coinbase: boolean
  scriptsig: string
  scriptsig_asm: string
  inner_redeemscript_asm?: string
  inner_witnessscript_asm?: string
  sequence: number
  witness: string[]
  prevout: Vout
  is_pegin?: boolean
  issuance?: {
    asset_id: string
    is_reissuance: boolean
    asset_blinding_nonce: string
    asset_entropy: string
    contract_hash: string
    assetamount?: number
    assetamountcommitment?: string
    tokenamount?: number
    tokenamountcommitment?: string
  }
}

type Vout = {
  scriptpubkey: string
  scriptpubkey_asm: string
  scriptpubkey_type: string
  scriptpubkey_address: string
  value: number
  valuecommitment?: string
  asset?: string
  assetcommitment?: string
  pegout?: {
    genesis_hash: string
    scriptpubkey: string
    scriptpubkey_asm: string
    scriptpubkey_address: string
  }
}

type Status = {
  confirmed: boolean
  block_height?: number
  block_hash?: string
  block_time?: number
}

export type Transaction = {
  txid: string
  version: number
  locktime: number
  size: number
  weight: number
  fee: number
  vin: Vin[]
  vout: Vout[]
  status: Status
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
      blockNumber: BigInt(this.tx.status?.block_time ?? 0),
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
