import { MoveCoder } from '@typemove/sui'

import { getRpcEndpoint, SuiNetwork } from './network.js'

const MOVE_CODER = new MoveCoder(getRpcEndpoint(SuiNetwork.MAIN_NET))
const TESTNET_MOVE_CODER = new MoveCoder(getRpcEndpoint(SuiNetwork.TEST_NET))

export function defaultMoveCoder(network: SuiNetwork = SuiNetwork.MAIN_NET): MoveCoder {
  if (network == SuiNetwork.MAIN_NET) {
    return MOVE_CODER
  }
  return TESTNET_MOVE_CODER
}
