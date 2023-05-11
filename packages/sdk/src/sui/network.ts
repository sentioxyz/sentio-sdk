import { SuiChainId } from '../core/chain.js'

export type SuiNetwork = SuiChainId
export const SuiNetwork = <const>{
  MAIN_NET: SuiChainId.SUI_MAINNET,
  TEST_NET: SuiChainId.SUI_TESTNET,
  DEV_NET: SuiChainId.SUI_DEVNET,
}
