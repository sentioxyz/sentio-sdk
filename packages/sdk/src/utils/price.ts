import { type CoinID, CoinIDSchema } from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { timestampDate, timestampFromDate } from '@bufbuild/protobuf/wkt'
import { Endpoints, processMetrics } from '@sentio/runtime'
import { ChainId } from '@sentio/chain'
import { LRUCache } from 'lru-cache'
import { type Client, createSentioClient, PriceService } from '@sentio/api'
import { Code, ConnectError } from '@connectrpc/connect'
import path from 'path'
import fs from 'fs'
import os from 'os'

function getApiKey() {
  try {
    const content = fs.readFileSync(path.join(os.homedir(), '.sentio', 'config.json'), 'utf8')
    const config = JSON.parse(content)
    return config['https://app.sentio.xyz']?.api_keys
  } catch (e) {}
}

export function getPriceClient(basePath = Endpoints.INSTANCE.priceFeedAPI): PriceApi {
  if (basePath && !basePath.startsWith('http')) {
    basePath = 'http://' + basePath
  }
  if (basePath.endsWith('/')) {
    basePath = basePath.slice(0, -1)
  }
  return createSentioClient(PriceService, {
    baseUrl: basePath || 'https://api.sentio.xyz',
    apiKey: getApiKey()
  })
}

const priceMap = new LRUCache<string, Promise<number | undefined>>({
  max: 100000,
  ttl: 1000 * 60 * 5 // 5 minutes
})

type PriceApi = Client<typeof PriceService>
let priceClient: PriceApi

interface PriceOptions {
  toleranceInDays?: number
}
async function getPriceByTypeOrSymbol(date: Date, coinId: CoinID, options?: PriceOptions): Promise<number | undefined> {
  if (!priceClient) {
    priceClient = getPriceClient()
  }
  return getPriceByTypeOrSymbolInternal(priceClient, date, coinId, options)
}

export async function getPriceByTypeOrSymbolInternal(
  priceClient: PriceApi,
  date: Date,
  coinId: CoinID,
  options?: PriceOptions
): Promise<number | undefined> {
  const dateStr = dateString(date)
  const todayDateString = dateString(new Date())

  const symbol = coinId.id.case === 'symbol' ? coinId.id.value : undefined
  const address = coinId.id.case === 'address' ? coinId.id.value : undefined

  let key: string
  if (symbol) {
    key = `${symbol}-${dateStr}`
  } else {
    key = `${address?.address}-${address?.chain}-${dateStr}`
  }
  let price = priceMap.get(key)
  if (price) {
    return price
  }

  processMetrics.process_pricecall_count.add(1)
  const response = priceClient.getPrice({
    timestamp: timestampFromDate(date),
    coinId: {
      id: symbol
        ? { case: 'symbol', value: symbol }
        : { case: 'address', value: { address: address?.address ?? '', chain: address?.chain ?? '' } }
    }
  })
  price = response
    .then((res) => {
      if (res.timestamp) {
        const responseDate = timestampDate(res.timestamp)
        const responseDateString = dateString(responseDate)
        if (responseDateString === todayDateString) {
          priceMap.delete(key)
        } else {
          // https://www.javatpoint.com/javascript-date-difference
          const diff = Math.abs(responseDate.getTime() - date.getTime())
          const daysDiff = diff / (1000 * 60 * 60 * 24)
          const tolerance = options?.toleranceInDays || 2
          if (daysDiff > tolerance) {
            priceMap.delete(key)
            return undefined
          }
        }
      } else {
        priceMap.delete(key)
      }
      return res.price
    })
    .catch((e) => {
      setTimeout(() => {
        priceMap.delete(key)
      }, 1000)

      if (e instanceof ConnectError && e.code === Code.NotFound) {
        console.error('price not found for ', JSON.stringify(coinId), ' at ', dateStr)
        return undefined
      }
      // TODO maybe use small set of error
      priceMap.delete(key)
      throw e
    })
  priceMap.set(key, price)
  return price
}

/**
 *
 * @param chainId chain id refers to CHAIN_MAP
 * @param coinType
 * @param date
 * @param options other behavior options
 */
export async function getPriceByType(
  chainId: ChainId,
  coinType: string,
  date: Date,
  options?: PriceOptions
): Promise<number | undefined> {
  return getPriceByTypeOrSymbol(
    date,
    create(CoinIDSchema, {
      id: {
        case: 'address',
        value: {
          chain: chainId,
          address: coinType
        }
      }
    }),
    options
  )
}

/**
 * @param symbol token symbol like BTC, etc
 * @param date
 * @param options other behavior options
 */
export async function getPriceBySymbol(
  symbol: string,
  date: Date,
  options?: PriceOptions
): Promise<number | undefined> {
  return getPriceByTypeOrSymbol(date, create(CoinIDSchema, { id: { case: 'symbol', value: symbol } }), options)
}

function dateString(date: Date) {
  return [date.getHours(), date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear()].join('-')
}

/**
 * get coins that has price, return results as a list of `{ symbol, coin }`
 * pairs where `coin` is the address-keyed CoinID for that symbol on the chain
 * @param chainId
 */
export async function getCoinsThatHasPrice(chainId: ChainId) {
  if (!priceClient) {
    priceClient = getPriceClient()
  }
  const res = await priceClient.listCoins({
    chain: chainId,
    limit: 1000
  })

  return Object.entries(res.coinAddressesInChain).map(([symbol, coin]) => ({ symbol, coin }))
}
