import { AptosNetwork, getClient } from './network.js'
import { MoveCoder } from '@typemove/aptos'
import { Aptos } from '@aptos-labs/ts-sdk'

const CODERS = new Map<AptosNetwork, MoveCoder>()
const URL_CODERS = new Map<string, MoveCoder>()

export function defaultMoveCoder(network: AptosNetwork = AptosNetwork.MAIN_NET): MoveCoder {
  let coder = CODERS.get(network)
  if (!coder) {
    const client = getClient(network)
    coder = new MoveCoder(getClient(network))
    CODERS.set(network, coder)
    URL_CODERS.set(client.config.fullnode || '', coder)
  }

  return coder
}

// TODO this function need to use used inside context, otherwise can't be init
export function defaultMoveCoderForClient(client: Aptos): MoveCoder {
  if (!client.config.fullnode) {
    throw new Error('Fullnode is not defined')
  }
  let coder = URL_CODERS.get(client.config.fullnode)
  if (!coder) {
    coder = new MoveCoder(client)
    URL_CODERS.set(client.config.fullnode, coder)
  }
  return coder
}
