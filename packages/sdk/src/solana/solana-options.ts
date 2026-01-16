import { InstructionCoder } from './solana-processor.js'
import { Labels } from '../core/index.js'
import { SolanaChainId } from '@sentio/chain'

export class SolanaBindOptions {
  address: string
  network?: SolanaChainId
  name?: string
  startBlock?: bigint | number
  endBlock?: bigint | number
  processInnerInstruction?: boolean
  instructionCoder?: InstructionCoder
  baseLabels?: Labels
}

export class SolanaFetchConfig {
  fetchTx?: boolean
}
