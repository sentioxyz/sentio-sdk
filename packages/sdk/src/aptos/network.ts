import { CHAIN_IDS, getChainName } from '../core/chain.js'
import { AptosClient } from 'aptos-sdk'
import { Labels } from '../core/index.js'

export enum AptosNetwork {
  MAIN_NET = 1,
  TEST_NET = 2,
  DEV_NET = 3,
}

export function getChainId(network: AptosNetwork): string {
  switch (network) {
    case AptosNetwork.TEST_NET:
      return CHAIN_IDS.APTOS_TESTNET
    case AptosNetwork.DEV_NET:
      return CHAIN_IDS.APTOS_DEVNET
  }
  return CHAIN_IDS.APTOS_MAINNET
}

export function getAptosChainName(network: AptosNetwork): string {
  return getChainName(getChainId(network))
}

export class AptosBindOptions {
  address: string
  network?: AptosNetwork = AptosNetwork.MAIN_NET
  client?: AptosClient
  startVersion?: bigint | number
  baseLabels?: Labels
}
