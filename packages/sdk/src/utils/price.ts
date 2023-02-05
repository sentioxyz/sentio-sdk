import { CoinID, PriceServiceClient, PriceServiceDefinition } from '@sentio/protos/price'
import { createChannel, createClientFactory } from 'nice-grpc'
import { retryMiddleware, RetryOptions } from 'nice-grpc-client-middleware-retry'
import { Endpoints } from '@sentio/runtime'

export function getPriceClient(address?: string) {
  if (!address) {
    address = Endpoints.INSTANCE.priceFeedAPI
  }
  const channel = createChannel(address)

  return createClientFactory().use(retryMiddleware).create(PriceServiceDefinition, channel)
}

const priceMap = new Map<string, Promise<number>>()
let priceClient: PriceServiceClient<RetryOptions>

async function getPriceByTypeOrSymbol(date: Date, coinId: CoinID): Promise<number> {
  if (!priceClient) {
    priceClient = getPriceClient()
  }

  const dateStr = dateString(date)
  const todayDateString = dateString(new Date())

  let key: string
  if (coinId.symbol) {
    key = `${coinId.symbol}-${dateStr}`
  } else {
    key = `${coinId.address?.address}-${coinId.address?.chain}-${dateStr}`
  }
  let price = priceMap.get(key)
  if (price) {
    return price
  }

  const response = priceClient.getPrice(
    {
      timestamp: date,
      coinId,
    },
    {
      retry: true,
      retryMaxAttempts: 8,
    }
  )
  price = response.then((res) => {
    if (res.timestamp) {
      const responseDateString = dateString(res.timestamp)
      if (responseDateString !== dateStr || responseDateString === todayDateString) {
        priceMap.delete(key)
      }
    } else {
      priceMap.delete(key)
    }
    return res.price
  })
  priceMap.set(key, price)
  return price
}

/**
 *
 * @param chainId chain id refers to CHAIN_MAP
 * @param coinType
 * @param date
 */
export async function getPriceByType(chainId: string, coinType: string, date: Date): Promise<number> {
  return getPriceByTypeOrSymbol(date, {
    address: {
      chain: chainId,
      address: coinType,
    },
  })
}

/**
 *
 * @param symbol token symbol like BTC, etc
 * @param date
 */
export async function getPriceBySymbol(symbol: string, date: Date): Promise<number> {
  return getPriceByTypeOrSymbol(date, { symbol })
}

function dateString(date: Date) {
  return [date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear()].join('-')
}
