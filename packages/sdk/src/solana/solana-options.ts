import { InstructionCoder } from './solana-processor.js'
import { Labels } from '../core/index.js'
import { SolanaChainId } from '../core/chain.js'

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
