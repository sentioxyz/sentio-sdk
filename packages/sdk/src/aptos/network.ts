import { AptosChainId } from '@sentio/chain'
import { AptosClient } from 'aptos-sdk'
import { Labels } from '../core/index.js'

export type AptosNetwork = AptosChainId
export const AptosNetwork = <const>{
  MAIN_NET: AptosChainId.APTOS_MAINNET,
  TEST_NET: AptosChainId.APTOS_TESTNET,
  DEV_NET: AptosChainId.APTOS_DEVNET
}

export class AptosBindOptions {
  address: string
  network?: AptosNetwork = AptosNetwork.MAIN_NET
  client?: AptosClient
  startVersion?: bigint | number
  baseLabels?: Labels
}

export function getRpcEndpoint(network: AptosNetwork): string {
  switch (network) {
    case AptosNetwork.TEST_NET:
      return 'https://testnet.aptoslabs.com/'
  }
  return 'https://mainnet.aptoslabs.com/'
}
