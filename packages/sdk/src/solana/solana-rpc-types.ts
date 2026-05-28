import type { Address, Signature, Blockhash } from '@solana/kit'

export type TransactionVersion = 'legacy' | number

export interface TransactionMessageHeader {
  numRequiredSignatures: number
  numReadonlySignedAccounts: number
  numReadonlyUnsignedAccounts: number
}

export interface CompiledInstruction {
  programIdIndex: number
  accounts: number[]
  data: string
}

export interface TransactionMessage {
  accountKeys: Address[]
  header: TransactionMessageHeader
  instructions: CompiledInstruction[]
  recentBlockhash: Blockhash
}

export interface TokenBalance {
  accountIndex: number
  mint: string
  owner?: string
  programId?: string
  uiTokenAmount: {
    amount: string
    decimals: number
    uiAmount: number | null
    uiAmountString: string
  }
}

export interface ConfirmedTransactionMeta {
  err: unknown
  fee: number
  innerInstructions?: Array<{ index: number; instructions: CompiledInstruction[] }> | null
  logMessages?: string[] | null
  preBalances: number[]
  postBalances: number[]
  preTokenBalances?: TokenBalance[] | null
  postTokenBalances?: TokenBalance[] | null
  rewards?: unknown[] | null
  loadedAddresses?: { writable: Address[]; readonly: Address[] }
}

export interface TransactionResponse {
  slot: number
  blockTime?: number | null
  transaction: {
    message: TransactionMessage
    signatures: Signature[]
  }
  meta: ConfirmedTransactionMeta | null
  version?: TransactionVersion
}

export interface BlockResponse {
  blockhash: Blockhash
  previousBlockhash: Blockhash
  parentSlot: number
  blockHeight?: number | null
  blockTime?: number | null
  transactions: Array<{
    transaction: { message: TransactionMessage; signatures: Signature[] }
    meta: ConfirmedTransactionMeta | null
    version?: TransactionVersion
  }>
  rewards?: unknown[]
}
