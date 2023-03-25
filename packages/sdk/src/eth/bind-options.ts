import { Networkish, Network } from 'ethers/providers'
import { getNetworkFromCtxOrNetworkish } from './provider.js'

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
    const n = getNetworkFromCtxOrNetworkish(opts.network)
    sig.push(n.chainId.toString())
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

export class AccountBindOptions {
  address: string
  network: Network
  startBlock?: bigint | number
}
