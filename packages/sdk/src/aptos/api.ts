import { AptosQueryClient, AptosQueryDefinition } from '@sentio/protos/lib/chainquery/protos/chainquery'
import { createChannel, createClient } from 'nice-grpc'

export function getChainQueryClient(address?: string): AptosQueryClient {
  if (!address) {
    address = global.ENDPOINTS.chainQueryAPI
  }
  const channel = createChannel(address)

  return createClient(AptosQueryDefinition, channel)
}
