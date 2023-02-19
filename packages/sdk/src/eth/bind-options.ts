import { Networkish, Network } from 'ethers/providers'

export class BindOptions {
  // Contract address
  address: string
  // Optional, if not set, then use eth mainnet
  network?: Networkish = 1
  // Optional, override default contract name
  name?: string
  startBlock?: bigint | number
  endBlock?: bigint | number
}

export function getOptionsSignature(opts: BindOptions): string {
  const sig = [opts.address]
  if (opts.network) {
    if (typeof opts.network === 'string') {
      const asInt = parseInt(opts.network)
      if (Number.isFinite(asInt)) {
        opts.network = asInt
      }
    }
    sig.push(Network.from(opts.network).chainId.toString())
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
  startBlock: bigint
  endBlock?: bigint
}

export class AccountBindOptions {
  address: string
  network?: Networkish
  startBlock?: bigint | number
}
