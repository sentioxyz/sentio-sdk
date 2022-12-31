export class SolanaBindOptions {
  address: string
  network?: string
  name?: string
  startBlock?: bigint | number
  endBlock?: bigint | number
  processInnerInstruction?: boolean
}
