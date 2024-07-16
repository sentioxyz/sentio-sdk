import { MoveCoder } from '@typemove/sui'

import { getClient, SuiNetwork } from './network.js'

const CODERS = new Map<SuiNetwork, MoveCoder>()

export function defaultMoveCoder(network: SuiNetwork = SuiNetwork.MAIN_NET): MoveCoder {
  let coder = CODERS.get(network)
  if (!coder) {
    coder = new MoveCoder(getClient(network))
    CODERS.set(network, coder)
  }

  return coder
}
