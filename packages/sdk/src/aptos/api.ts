import { AptosQueryClient, AptosQueryDefinition } from '@sentio/protos/chainquery'
import { createChannel, createClientFactory } from 'nice-grpc'
import { Endpoints } from '@sentio/runtime'
import { retryMiddleware } from 'nice-grpc-client-middleware-retry'
import { prometheusClientMiddleware } from 'nice-grpc-prometheus'
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk'
import { AptosNetwork } from './network.js'

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

export function getAptosClient(network = AptosNetwork.MAIN_NET): Aptos | undefined {
  const chainServer = Endpoints.INSTANCE.chainServer.get(network)
  if (chainServer) {
    return new Aptos(new AptosConfig({ fullnode: chainServer + '/v1' }))
  }
  return undefined
}
