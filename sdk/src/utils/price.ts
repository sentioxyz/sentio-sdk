import { PriceServiceClient, PriceServiceDefinition } from '../gen/service/price/protos/price'
import { createChannel, createClient } from 'nice-grpc'

export function getPriceClient(address: string): PriceServiceClient {
  const channel = createChannel(address)

  return createClient(PriceServiceDefinition, channel)
}
