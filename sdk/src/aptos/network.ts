import { APTOS_MAINNET_ID, APTOS_TESTNET_ID, CHAIN_MAP } from '../utils/chain'
import { AptosClient } from 'aptos-sdk'

export enum AptosNetwork {
  MAIN_NET = 1,
  TEST_NET = 2,
  // DEV_NET,
}

export function getChainId(network: AptosNetwork): string {
  switch (network) {
    case AptosNetwork.TEST_NET:
      return APTOS_TESTNET_ID
  }
  return APTOS_MAINNET_ID
}

export function getChainName(network: AptosNetwork): string {
  switch (network) {
    case AptosNetwork.TEST_NET:
      return CHAIN_MAP[APTOS_TESTNET_ID]
  }
  return CHAIN_MAP[APTOS_MAINNET_ID]
}

export function getRpcEndpoint(network: AptosNetwork): string {
  switch (network) {
    case AptosNetwork.TEST_NET:
      return 'https://testnet.aptoslabs.com/'
  }
  return 'https://mainnet.aptoslabs.com/'
}

export function getRpcClient(network: AptosNetwork): AptosClient {
  return new AptosClient(getRpcEndpoint(network))
}

export class AptosBindOptions {
  address: string
  network?: AptosNetwork = AptosNetwork.MAIN_NET
  startVersion?: bigint | number
}
