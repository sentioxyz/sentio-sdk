import { AptosChainId } from '@sentio/chain'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { Labels } from '../core/index.js'
import { Endpoints } from '@sentio/runtime'
import { RichAptosClient } from './api.js'

export type AptosNetwork = AptosChainId

export const AptosNetwork = <const>{
  MAIN_NET: AptosChainId.APTOS_MAINNET,
  TEST_NET: AptosChainId.APTOS_TESTNET,

  MOVEMENT_MAIN_NET: AptosChainId.APTOS_MOVEMENT_MAINNET,
  MOVEMENT_TEST_NET: AptosChainId.APTOS_MOVEMENT_TESTNET,
  INITIA_ECHELON: AptosChainId.INITIA_ECHELON
}

export const MovementNetwork = <const>{
  MAIN_NET: AptosChainId.APTOS_MOVEMENT_MAINNET,
  TEST_NET: AptosChainId.APTOS_MOVEMENT_TESTNET
}

export class AptosBindOptions {
  address: string
  network?: AptosNetwork = AptosNetwork.MAIN_NET
  client?: Aptos
  startVersion?: bigint | number
  endVersion?: bigint | number
  baseLabels?: Labels
}

export function getRpcConfig(network: AptosNetwork, fullnode?: string | undefined): AptosConfig {
  switch (network) {
    case AptosNetwork.MAIN_NET:
      return new AptosConfig({ network: Network.MAINNET, fullnode: fullnode ?? 'https://mainnet.aptoslabs.com/v1' })
    case AptosNetwork.TEST_NET:
      return new AptosConfig({ network: Network.TESTNET, fullnode: fullnode ?? 'https://testnet.aptoslabs.com/v1' })
    case AptosNetwork.MOVEMENT_MAIN_NET:
      return new AptosConfig({
        network: Network.CUSTOM,
        fullnode: fullnode ?? 'https://mainnet.movementnetwork.xyz/v1'
      })
    case AptosNetwork.MOVEMENT_TEST_NET:
      return new AptosConfig({
        network: Network.CUSTOM,
        fullnode: fullnode ?? 'https://aptos.testnet.bardock.movementlabs.xyz/v1'
      })
    case AptosNetwork.INITIA_ECHELON:
      return new AptosConfig({
        network: Network.CUSTOM,
        fullnode: fullnode ?? 'https://rpc.sentio.xyz/initia-aptos/v1'
      })
  }
}

export function getClient(network: AptosNetwork): RichAptosClient {
  let fullnode = Endpoints.INSTANCE.chainServer.get(network)
  if (fullnode) {
    if (!fullnode.endsWith('/v1')) {
      fullnode = fullnode + '/v1'
    }
  }
  return new RichAptosClient(getRpcConfig(network, fullnode))
}
