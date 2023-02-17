import { AptosQueryClient, AptosQueryDefinition } from '@sentio/protos/chainquery'
import { createChannel, createClientFactory } from 'nice-grpc'
import { Endpoints } from '@sentio/runtime'
import { retryMiddleware } from 'nice-grpc-client-middleware-retry'
import { prometheusClientMiddleware } from 'nice-grpc-prometheus'
import { AptosClient } from 'aptos-sdk'
import { AptosNetwork, getChainId } from './network.js'

export function getChainQueryClient(address?: string): AptosQueryClient {
  if (!address) {
    address = Endpoints.INSTANCE.chainQueryAPI
  }
  const channel = createChannel(address)

  return createClientFactory()
    .use(prometheusClientMiddleware())
    .use(retryMiddleware)
    .create(AptosQueryDefinition, channel)
}

export function getAptosClient(network = AptosNetwork.MAIN_NET): AptosClient | undefined {
  const chainServer = Endpoints.INSTANCE.chainServer.get(getChainId(network))
  if (chainServer) {
    return new AptosClient(chainServer)
  }
  return undefined
}
