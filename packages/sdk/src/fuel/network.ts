import { FuelChainId } from '@sentio/chain'
import { Endpoints } from '@sentio/runtime'
import { Provider } from 'fuels'

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
  return 'https://mainnet.fuel.network/v1/graphql'
}

export function getProvider(network: FuelNetwork): Promise<Provider> {
  let chainServer = Endpoints.INSTANCE.chainServer.get(network)
  if (!chainServer) {
    chainServer = getRpcEndpoint(network)
    // throw new ServerError(Status.INTERNAL, 'RPC endpoint not provided')
  }
  return Provider.create(chainServer)
}
