import { FuelChainId } from '@sentio/chain'
import { FUEL_NETWORK_URL } from 'fuels'

export type FuelNetwork = FuelChainId
export const FuelNetwork = <const>{
  MAIN_NET: FuelChainId.FUEL_MAINNET,
  TEST_NET: FuelChainId.FUEL_TESTNET
}

export function getRpcEndpoint(network: FuelNetwork): string {
  switch (network) {
    case FuelNetwork.TEST_NET:
      return 'https://testnet.fuel.network/v1/graphql'
  }
  return FUEL_NETWORK_URL
}
