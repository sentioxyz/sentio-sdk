import { InstructionCoder } from './solana-processor.js'
import { Labels } from '../core/index.js'

export class SolanaBindOptions {
  address: string
  network?: string
  name?: string
  startBlock?: bigint | number
  endBlock?: bigint | number
  processInnerInstruction?: boolean
  instructionCoder?: InstructionCoder
  baseLabels?: Labels
}
