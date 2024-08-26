import { FuelChainId } from '@sentio/chain'

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
  return 'https://testnet.fuel.network/v1/graphql'
}
