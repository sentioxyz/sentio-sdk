import { CosmosChainId } from '@sentio/chain'

export type CosmosNetwork = CosmosChainId
export const CosmosNetwork = <const>{
  INJECTIVE_MAINNET: CosmosChainId.INJECTIVE_MAINNET,
  INJECTIVE_TESTNET: CosmosChainId.INJECTIVE_TESTNET
}

export function getRpcEndpoint(network: CosmosNetwork): string {
  switch (network) {
    case CosmosNetwork.INJECTIVE_MAINNET:
      return 'https://sentry.lcd.injective.network:443'
    case CosmosNetwork.INJECTIVE_TESTNET:
      return 'https://testnet.sentry.lcd.injective.network:443'
  }
}
