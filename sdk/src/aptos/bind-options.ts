import Long from 'long'
import { APTOS_MAINNET_ID, APTOS_TESTNET_ID } from '../utils/chain'

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

export class AptosBindOptions {
  address: string
  network?: AptosNetwork = AptosNetwork.TEST_NET
  startVersion?: Long | number
  // endBlock?: Long | number
}
