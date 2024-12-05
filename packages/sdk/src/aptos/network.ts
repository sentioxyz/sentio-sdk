import { AptosChainId } from '@sentio/chain'
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk'
import { Labels } from '../core/index.js'
import { Endpoints } from '@sentio/runtime'
import { RichAptosClient } from './api.js'

export type AptosNetwork = AptosChainId

export const AptosNetwork = <const>{
  MAIN_NET: AptosChainId.APTOS_MAINNET,
  TEST_NET: AptosChainId.APTOS_TESTNET,

  MOVEMENT_MAIN_NET: AptosChainId.APTOS_MOVEMENT_MAINNET,
  MOVEMENT_TEST_NET: AptosChainId.APTOS_MOVEMENT_TESTNET
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
  baseLabels?: Labels
}

export function getRpcEndpoint(network: AptosNetwork): string {
  switch (network) {
    case AptosNetwork.MAIN_NET:
      return 'https://mainnet.aptoslabs.com/v1'
    case AptosNetwork.TEST_NET:
      return 'https://testnet.aptoslabs.com/v1'
    case AptosNetwork.MOVEMENT_MAIN_NET:
      return 'https://mainnet.movementnetwork.xyz/v1'
    case AptosNetwork.MOVEMENT_TEST_NET:
      return 'https://aptos.testnet.bardock.movementlabs.xyz/v1'
  }
}

export function getClient(network: AptosNetwork): RichAptosClient {
  let chainServer = Endpoints.INSTANCE.chainServer.get(network)
  if (!chainServer) {
    chainServer = getRpcEndpoint(network)
    // throw new ServerError(Status.INTERNAL, 'RPC endpoint not provided')
  } else {
    chainServer = chainServer + '/v1'
  }
  return new RichAptosClient(new AptosConfig({ fullnode: chainServer }))
}
