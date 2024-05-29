import { FuelChainId } from '@sentio/chain'
import { FUEL_NETWORK_URL } from 'fuels'

const SENTIO_FUEL_TESTNET = 'http://sentio-0.sentio.xyz:8080/sentio-internal-api/fuel-testnet/'

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
