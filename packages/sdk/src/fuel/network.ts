import { FuelChainId } from '@sentio/chain'
import { FUEL_BETA_5_NETWORK_URL, FUEL_NETWORK_URL } from '@fuel-ts/account/configs'

export type FuelNetwork = FuelChainId
export const FuelNetwork = <const>{
  MAIN_NET: FuelChainId.FUEL_MAINNET,
  TEST_NET: FuelChainId.FUEL_TESTNET_BETA_V5
}

export function getRpcEndpoint(network: FuelNetwork): string {
  switch (network) {
    case FuelNetwork.TEST_NET:
      return FUEL_BETA_5_NETWORK_URL
  }
  return FUEL_NETWORK_URL
}
