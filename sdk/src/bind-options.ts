import { Networkish } from '@ethersproject/networks'
import Long from 'long'
import { getNetwork } from '@ethersproject/providers'

export class BindOptions {
  address: string
  network?: Networkish = 1
  name?: string
  startBlock?: Long | number
  endBlock?: Long | number
}

export function getOptionsSignature(opts: BindOptions): string {
  const sig = [opts.address]
  if (opts.network) {
    sig.push(getNetwork(opts.network).chainId.toString())
  }
  if (opts.name) {
    sig.push(opts.name)
  }
  if (opts.startBlock) {
    sig.push(opts.startBlock.toString())
  }
  if (opts.endBlock) {
    sig.push(opts.endBlock.toString())
  }
  return sig.join('_')
}

export class BindInternalOptions {
  address: string
  network: Networkish
  name: string
  startBlock: Long
  endBlock?: Long
}

export class SolanaBindOptions extends BindOptions {
  declare network?: string
  processInnerInstruction?: boolean
}
