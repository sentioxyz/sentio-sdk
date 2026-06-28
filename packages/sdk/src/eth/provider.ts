import { JsonRpcProvider, Network, hexlify } from 'ethers'
import type { JsonRpcError, JsonRpcPayload, JsonRpcResult } from 'ethers'

import PQueue from 'p-queue'
import { EthChainId } from '@sentio/chain'
import { LRUCache } from 'lru-cache'
import { Endpoints, providerMetrics, processMetrics, metricsStorage, GLOBAL_CONFIG } from '@sentio/runtime'
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

  const address = Endpoints.INSTANCE.getChainRpcUrl(chainId)
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
        [...Endpoints.INSTANCE.chainRpc.keys()].join(' ')
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
    } catch (e: any) {
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

  // Overrides the low-level JSON-RPC transport to replicate behaviors that used to
  // live in the @sentio/ethers fork, so the SDK can run on upstream ethers:
  //   1. Treat an empty `0x` eth_call result as an RPC error — the Sentio rpc-node
  //      answers 200/`0x` (instead of a JSON-RPC error) with `sentio-*` headers when
  //      a call cannot be served, and we want that to throw rather than silently
  //      return empty data.
  //   2. Forward `sentio-*` response headers onto error results so they surface in
  //      getRpcError().info for diagnostics.
  //   3. Attach the request payload to TIMEOUT errors (previously the fork's
  //      geturl.ts patch) for diagnostics.
  override async _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult>> {
    const request = this._getConnection()
    request.body = JSON.stringify(payload)
    request.setHeader('content-type', 'application/json')

    let response
    try {
      response = await request.send()
    } catch (e: any) {
      if (e?.code === 'TIMEOUT') {
        e.payload = payload
      }
      throw e
    }
    response.assertOk()

    let resp = response.bodyJson
    if (!Array.isArray(resp)) {
      resp = [resp]
    }

    const sentioHeaders: Record<string, string> = {}
    for (const [key, value] of Object.entries(response.headers)) {
      if (key.toLowerCase().includes('sentio')) {
        sentioHeaders[key] = value as string
      }
    }
    const hasSentioHeaders = Object.keys(sentioHeaders).length > 0

    const methodById = new Map<number, string>()
    for (const p of Array.isArray(payload) ? payload : [payload]) {
      methodById.set(p.id, p.method)
    }

    for (const res of resp as any[]) {
      let isError = 'error' in res
      if (!isError && methodById.get(res.id) === 'eth_call') {
        try {
          if (hexlify(res.result) === '0x') {
            res.error = { code: 3, message: 'empty response (0x) from eth_call' }
            isError = true
          }
        } catch {
          // result is not hex-like; leave it as a normal result
        }
      }
      if (isError && hasSentioHeaders) {
        res.headers = sentioHeaders
      }
    }

    return resp
  }

  override getRpcError(payload: JsonRpcPayload, error: JsonRpcError): Error {
    const e = super.getRpcError(payload, error)
    const headers = (error as any)?.headers
    if (headers) {
      ;(e as any).info = { ...((e as any).info ?? {}), headers }
    }
    // Annotate eth_call errors with the queried block tag (previously the fork's
    // contract.ts blockNumber patch).
    if (payload?.method === 'eth_call' && Array.isArray((payload as any).params)) {
      const blockTag = (payload as any).params[1]
      if (blockTag != null) {
        ;(e as any).blockNumber = blockTag
      }
    }
    return e
  }

  toString() {
    return 'QueuedStaticJsonRpcProvider'
  }
}
