import { PriceServiceClient, PriceServiceDefinition } from '../gen/service/price/protos/price'
import { createChannel, createClientFactory } from 'nice-grpc'
import { retryMiddleware, RetryOptions } from 'nice-grpc-client-middleware-retry'

export function getPriceClient(address?: string) {
  if (!address) {
    address = global.ENDPOINTS.priceFeedAPI
  }
  const channel = createChannel(address)

  return createClientFactory().use(retryMiddleware).create(PriceServiceDefinition, channel)
}

const priceMap = new Map<string, number>()
let priceClient: PriceServiceClient<RetryOptions>

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
  let price = priceMap.get(key)
  if (price) {
    return price
  }

  const response = await priceClient.getPrice(
    {
      timestamp: date,
      coinId: {
        address: {
          chain: chainId,
          address: coinType,
        },
      },
    },
    {
      retry: true,
      retryMaxAttempts: 8,
    }
  )
  price = response.price
  priceMap.set(key, price)
  return price
}

/**
 *
 * @param symbol token symbol like BTC, etc
 * @param date
 */
export async function getPriceBySymbol(symbol: string, date: Date): Promise<number> {
  if (!priceClient) {
    priceClient = getPriceClient()
  }

  const dateStr = [date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear()].join('-')
  const key = `${symbol}-${dateStr}`
  let price = priceMap.get(key)
  if (price) {
    return price
  }

  const response = await priceClient.getPrice(
    {
      timestamp: date,
      coinId: {
        symbol,
      },
    },
    {
      retry: true,
      retryMaxAttempts: 8,
    }
  )
  price = response.price
  priceMap.set(key, price)
  return price
}
