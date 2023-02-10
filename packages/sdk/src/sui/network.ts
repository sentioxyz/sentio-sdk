import { CHAIN_IDS, getChainName } from '../core/chain.js'

export enum SuiNetwork {
  MAIN_NET = 1,
  TEST_NET = 2,
}

export function getChainId(network: SuiNetwork): string {
  switch (network) {
    case SuiNetwork.TEST_NET:
      return CHAIN_IDS.SUI_TESTNET
  }
  return CHAIN_IDS.SUI_MAINNET
}

export function getSuiChainName(network: SuiNetwork): string {
  switch (network) {
    case SuiNetwork.TEST_NET:
      return getChainName(CHAIN_IDS.SUI_TESTNET)
  }
  return getChainName(CHAIN_IDS.SUI_MAINNET)
}

export class SuiBindOptions {
  address: string
  network?: SuiNetwork = SuiNetwork.MAIN_NET
  startVersion?: bigint | number
}
