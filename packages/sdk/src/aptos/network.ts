import { AptosChainId } from '@sentio/chain'
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk'
import { Labels } from '../core/index.js'
import { Endpoints } from '@sentio/runtime'
import process from 'process'

export type AptosNetwork = AptosChainId
export const AptosNetwork = <const>{
  MAIN_NET: AptosChainId.APTOS_MAINNET,
  TEST_NET: AptosChainId.APTOS_TESTNET,
  DEV_NET: AptosChainId.APTOS_DEVNET,
  M2_TEST_NET: AptosChainId.APTOS_M2_TESTNET,
  M2_MAIN_NET: AptosChainId.APTOS_M2_MAINNET
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
    case AptosNetwork.TEST_NET:
      return 'https://testnet.aptoslabs.com/v1'
    case AptosNetwork.M2_TEST_NET:
      return process.env.APTOS_M2_TESTNET_URL || 'https://testnet.m1.movementlabs.xyz/v1'
    case AptosNetwork.M2_MAIN_NET:
      return 'https://mainnet.m1.movementlabs.xyz/v1'
  }
  return 'https://mainnet.aptoslabs.com/v1'
}

export function getClient(network: AptosNetwork): Aptos {
  let chainServer = Endpoints.INSTANCE.chainServer.get(network)
  if (!chainServer) {
    chainServer = getRpcEndpoint(network)
    // throw new ServerError(Status.INTERNAL, 'RPC endpoint not provided')
  } else {
    chainServer = chainServer + '/v1'
  }
  return new Aptos(new AptosConfig({ fullnode: chainServer }))
}
