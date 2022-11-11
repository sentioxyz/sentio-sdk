import { MoveModule } from 'aptos-sdk/src/generated'

import { createChannel, createClient } from 'nice-grpc'
import { AptosQueryClient, AptosQueryDefinition } from '../gen/chainquery/protos/chainquery'

export const SPLITTER = '::'

export const VECTOR_STR = 'vector'

export function isFrameworkAccount(account: string) {
  return account === '0x1' || account === '0x2' || account === '0x3'
}

export function moduleQname(module: MoveModule): string {
  return module.address.toLowerCase() + SPLITTER + module.name
}

export function moduleQnameForType(type: string): [string, string] {
  const parts = type.split(SPLITTER).slice(0, 2)
  return [parts[0], parts[1]]
}

export function getChainQueryClient(address = 'chainquery-server.chain-sync:6809'): AptosQueryClient {
  const channel = createChannel(address)

  return createClient(AptosQueryDefinition, channel)
}
