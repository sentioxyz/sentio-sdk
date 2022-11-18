import { PriceServiceClient, PriceServiceDefinition } from '../gen/service/price/protos/price'
import { createChannel, createClient } from 'nice-grpc'

export function getPriceClient(address?: string): PriceServiceClient {
  if (!address) {
    address = global.ENDPOINTS.priceFeedAPI
  }
  const channel = createChannel(address)

  return createClient(PriceServiceDefinition, channel)
}

const priceMap = new Map<string, number>()
let priceClient: PriceServiceClient

/**
 *
 * @param chainId chain id refers to CHAIN_MAP
 * @param coinType
 * @param date
 */
export async function getPriceByType(chainId: string, coinType: string, date: Date): Promise<number> {
  if (!priceClient) {
    priceClient = getPriceClient()
  }

  const dateStr = [date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear()].join('-')
  const key = `${coinType}-${dateStr}`
  const price = priceMap.get(key)
  if (price) {
    return price
  }

  /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
  while (true) {
    try {
      const response = await priceClient.getPrice({
        timestamp: date,
        coinId: {
          address: {
            chain: chainId,
            address: coinType,
          },
        },
      })
      const price = response.price
      priceMap.set(key, price)
      return price
    } catch (e) {
      console.log('error getting price', e, dateStr, coinType)
      await delay(1000)
    }
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
