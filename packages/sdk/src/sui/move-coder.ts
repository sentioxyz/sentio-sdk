import { MoveCoder } from '@typemove/sui'

import { getGrpcClient, SuiNetwork } from './network.js'

const CODERS = new Map<SuiNetwork, MoveCoder>()

export function defaultMoveCoder(network: SuiNetwork = SuiNetwork.MAIN_NET): MoveCoder {
  let coder = CODERS.get(network)
  if (!coder) {
    // @typemove/sui v2 MoveCoder is gRPC-backed.
    coder = new MoveCoder(getGrpcClient(network))
    CODERS.set(network, coder)
  }

  return coder
}
