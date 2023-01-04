import { AptosQueryClient, AptosQueryDefinition } from '@sentio/protos/lib/chainquery/protos/chainquery'
import { createChannel, createClient } from 'nice-grpc'
import { Endpoints } from '@sentio/runtime'

export function getChainQueryClient(address?: string): AptosQueryClient {
  if (!address) {
    address = Endpoints.INSTANCE.chainQueryAPI
  }
  const channel = createChannel(address)

  return createClient(AptosQueryDefinition, channel)
}
