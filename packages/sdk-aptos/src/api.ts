import { AptosQueryClient, AptosQueryDefinition } from '@sentio/protos/lib/chainquery/protos/chainquery'
import { createChannel, createClientFactory } from 'nice-grpc'
import { Endpoints } from '@sentio/runtime'
import { errorDetailsClientMiddleware } from 'nice-grpc-error-details'
import { retryMiddleware } from 'nice-grpc-client-middleware-retry'

export function getChainQueryClient(address?: string): AptosQueryClient {
  if (!address) {
    address = Endpoints.INSTANCE.chainQueryAPI
  }
  const channel = createChannel(address)

  return createClientFactory()
    .use(errorDetailsClientMiddleware)
    .use(retryMiddleware)
    .create(AptosQueryDefinition, channel)
}
