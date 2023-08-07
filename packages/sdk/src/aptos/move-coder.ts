import { AptosNetwork, getRpcEndpoint } from './network.js'
import { MoveCoder } from '@typemove/aptos'

const MOVE_CODER = new MoveCoder(getRpcEndpoint(AptosNetwork.MAIN_NET))
const TESTNET_MOVE_CODER = new MoveCoder(getRpcEndpoint(AptosNetwork.TEST_NET))

export function defaultMoveCoder(network: AptosNetwork = AptosNetwork.MAIN_NET): MoveCoder {
  if (network == AptosNetwork.MAIN_NET) {
    return MOVE_CODER
  }
  return TESTNET_MOVE_CODER
}
