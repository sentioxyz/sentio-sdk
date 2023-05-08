import { ChainId } from './chain.js'

export interface YamlContractConfig {
  address: string
  chain: ChainId
  name: string
}
