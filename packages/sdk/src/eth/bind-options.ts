import { EthChainId } from '@sentio/chain'

export class BindOptions {
  // Contract address
  address: string
  // Optional, if not set, then use eth mainnet
  network?: EthChainId = EthChainId.ETHEREUM
  // Optional, override default contract name
  name?: string
  startBlock?: bigint | number
  endBlock?: bigint | number
  baseLabels?: { [key: string]: string }
}

export function getOptionsSignature(opts: BindOptions): string {
  const sig = [opts.address]
  if (opts.network) {
    sig.push(opts.network)
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
  network: EthChainId
  startBlock?: bigint | number
  baseLabels?: { [key: string]: string }
}
