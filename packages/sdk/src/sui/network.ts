import { CHAIN_IDS, getChainName } from '../core/chain.js'

export enum SuiNetwork {
  MAIN_NET = 1,
  TEST_NET = 2,
  DEV_NET = 3,
}

export function getChainId(network: SuiNetwork): string {
  switch (network) {
    case SuiNetwork.TEST_NET:
      return CHAIN_IDS.SUI_TESTNET
    case SuiNetwork.DEV_NET:
      return CHAIN_IDS.SUI_DEVNET
  }
  return CHAIN_IDS.SUI_MAINNET
}

export function getSuiChainName(network: SuiNetwork): string {
  return getChainName(getChainId(network))
}

export class SuiBindOptions {
  address: string
  network?: SuiNetwork = SuiNetwork.MAIN_NET
  startVersion?: bigint | number
}
