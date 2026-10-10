import { EthChainId } from '@sentio/chain'

export interface BindOptions {
  // Contract address
  address: string
  // Optional, if not set, then use eth mainnet
  network?: EthChainId
  // Optional, override default contract name
  name?: string
  start?: TimeOrBlock
  end?: TimeOrBlock
  startBlock?: bigint | number
  endBlock?: bigint | number
  baseLabels?: { [key: string]: string }
}

export interface TimeOrBlock {
  block?: bigint | number
  time?: Date
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
  if (opts.baseLabels && Object.keys(opts.baseLabels).length > 0) {
    sig.push(JSON.stringify(Object.fromEntries(Object.entries(opts.baseLabels).sort())))
  }
  return sig.join('_')
}

export interface AccountBindOptions {
  address: string
  network: EthChainId
  startBlock?: bigint | number
  baseLabels?: { [key: string]: string }
}
