import { JsonRpcProvider, Network } from 'ethers'

import PQueue from 'p-queue'
import { Endpoints } from './endpoints.js'
import { EthChainId } from '@sentio/chain'
import { LRUCache } from 'lru-cache'
import { providerMetrics, processMetrics, metricsStorage } from './metrics.js'
import { GLOBAL_CONFIG } from './global-config.js'
const { miss_count, hit_count, queue_size } = providerMetrics

export const DummyProvider = new JsonRpcProvider('', Network.from(1))

const providers = new Map<string, JsonRpcProvider>()

// export function getEthChainId(networkish?: EthContext | EthChainId): EthChainId {
//   if (!networkish) {
//     networkish = EthChainId.ETHEREUM
//   }
//   if (networkish instanceof BaseContext) {
//     networkish = networkish.getChainId()
//   }
//   return networkish
// }

export function getProvider(chainId?: EthChainId): JsonRpcProvider {
  // const network = getNetworkFromCtxOrNetworkish(networkish)
  if (!chainId) {
    chainId = EthChainId.ETHEREUM
  }
  const network = Network.from(parseInt(chainId))
  // TODO check if other key needed

  const address = Endpoints.INSTANCE.chainServer.get(chainId)
  const key = network.chainId.toString() + '-' + address

  // console.debug(`init provider for ${chainId}, address: ${address}`)
  let provider = providers.get(key)

  if (provider) {
    return provider
  }

  if (address === undefined) {
    throw Error(
      'Provider not found for chain ' +
        network.chainId +
        ', configured chains: ' +
        [...Endpoints.INSTANCE.chainServer.keys()].join(' ')
    )
  }
  // console.log(
  //   `init provider for chain ${network.chainId}, concurrency: ${Endpoints.INSTANCE.concurrency}, batchCount: ${Endpoints.INSTANCE.batchCount}`
  // )
  provider = new QueuedStaticJsonRpcProvider(
    address,
    network,
    Endpoints.INSTANCE.concurrency,
    Endpoints.INSTANCE.batchCount
  )
  providers.set(key, provider)
  return provider
}

function getTag(prefix: string, value: any): string {
  return (
    prefix +
    ':' +
    JSON.stringify(value, (k, v) => {
      if (v == null) {
        return 'null'
      }
      if (typeof v === 'bigint') {
        return `bigint:${v.toString()}`
      }
      if (typeof v === 'string') {
        return v.toLowerCase()
      }

      // Sort object keys
      if (typeof v === 'object' && !Array.isArray(v)) {
        const keys = Object.keys(v)
        keys.sort()
        return keys.reduce(
          (accum, key) => {
            accum[key] = v[key]
            return accum
          },
          <any>{}
        )
      }

      return v
    })
  )
}

export class QueuedStaticJsonRpcProvider extends JsonRpcProvider {
  executor: PQueue
  #performCache = new LRUCache<string, Promise<any>>({
    max: 300000, // 300k items
    maxSize: 500 * 1024 * 1024 // 500mb key size for cache
    // ttl: 1000 * 60 * 60, // 1 hour   no ttl for better performance
    // sizeCalculation: (value: any) => {
    // assume each item is 1kb for simplicity
    // return 1024
    // }
  })
  #retryCache = new LRUCache<string, number>({
    max: 300000 // 300k items
  })

  constructor(url: string, network: Network, concurrency: number, batchCount = 1) {
    // TODO re-enable match when possible
    super(url, network, { staticNetwork: network, batchMaxCount: batchCount })
    this.executor = new PQueue({ concurrency: concurrency })
  }

  async send(method: string, params: Array<any>): Promise<any> {
    if (method !== 'eth_call' || params.length > 2) {
      return await this.executor.add(() => super.send(method, params))
    }
    const tag = getTag(method, params)
    const block = params[params.length - 1]
    let perform = this.#performCache.get(tag)
    if (!perform) {
      miss_count.add(1)
      const handler = metricsStorage.getStore()
      const queued: number = Date.now()
      perform = this.executor.add(() => {
        const started = Date.now()
        processMetrics.processor_rpc_queue_duration.record(started - queued, {
          chain_id: this._network.chainId.toString(),
          handler
        })

        let success = true
        return super
          .send(method, params)
          .catch((e) => {
            success = false
            throw e
          })
          .finally(() => {
            processMetrics.processor_rpc_duration.record(Date.now() - started, {
              chain_id: this._network.chainId.toString(),
              handler,
              success
            })
          })
      })

      queue_size.record(this.executor.size)

      this.#performCache.set(tag, perform, {
        size: tag.length
      })
      // For non latest block call, we cache permanently, otherwise we cache for one minute
      if (block === 'latest') {
        setTimeout(() => {
          if (this.#performCache.get(tag) === perform) {
            this.#performCache.delete(tag)
          }
        }, 60 * 1000)
      }
    } else {
      hit_count.add(1)
    }

    let result
    try {
      result = await perform
    } catch (e) {
      this.#performCache.delete(tag)
      if (e.code === 'TIMEOUT') {
        let retryCount = this.#retryCache.get(tag)
        if (GLOBAL_CONFIG.execution.rpcRetryTimes && retryCount === undefined) {
          retryCount = GLOBAL_CONFIG.execution.rpcRetryTimes
        }
        if (retryCount) {
          this.#retryCache.set(tag, retryCount - 1)
          return this.send(method, params)
        }
      }
      throw e
    }
    if (!result) {
      throw Error('Unexpected null response')
    }
    return result
  }

  toString() {
    return 'QueuedStaticJsonRpcProvider'
  }
}
