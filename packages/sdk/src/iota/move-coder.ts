import { MoveCoder } from '@typemove/iota'

import { getClient, IotaNetwork } from './network.js'

const CODERS = new Map<IotaNetwork, MoveCoder>()

export function defaultMoveCoder(network: IotaNetwork = IotaNetwork.MAIN_NET): MoveCoder {
  let coder = CODERS.get(network)
  if (!coder) {
    coder = new MoveCoder(getClient(network))
    CODERS.set(network, coder)
  }

  return coder
}
