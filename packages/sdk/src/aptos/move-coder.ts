import { AptosNetwork, getClient } from './network.js'
import { MoveCoder } from '@typemove/aptos'

const CODERS = new Map<AptosNetwork, MoveCoder>()

export function defaultMoveCoder(network: AptosNetwork = AptosNetwork.MAIN_NET): MoveCoder {
  let coder = CODERS.get(network)
  if (!coder) {
    coder = new MoveCoder(getClient(network))
    CODERS.set(network, coder)
  }

  return coder
}
