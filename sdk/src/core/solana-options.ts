import Long from 'long'

export class SolanaBindOptions {
  address: string
  network?: string
  name?: string
  startBlock?: Long | number
  endBlock?: Long | number
  processInnerInstruction?: boolean
}
