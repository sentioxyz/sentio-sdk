import { CHAIN_IDS, getChainName } from '../chain.js'

export enum AptosNetwork {
  MAIN_NET = 1,
  TEST_NET = 2,
  // DEV_NET,
}

export function getChainId(network: AptosNetwork): string {
  switch (network) {
    case AptosNetwork.TEST_NET:
      return CHAIN_IDS.APTOS_TESTNET
  }
  return CHAIN_IDS.APTOS_MAINNET
}

export function getAptosChainName(network: AptosNetwork): string {
  switch (network) {
    case AptosNetwork.TEST_NET:
      return getChainName(CHAIN_IDS.APTOS_TESTNET)
  }
  return getChainName(CHAIN_IDS.APTOS_MAINNET)
}

export class AptosBindOptions {
  address: string
  network?: AptosNetwork = AptosNetwork.MAIN_NET
  startVersion?: bigint | number
}
