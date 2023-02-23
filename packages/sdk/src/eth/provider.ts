import { Provider, Network, JsonRpcProvider } from 'ethers'
import { Networkish } from 'ethers/providers'

import PQueue from 'p-queue'
import { Endpoints } from '@sentio/runtime'

export const DummyProvider = new JsonRpcProvider('', Network.from(1))

const providers = new Map<string, JsonRpcProvider>()

export function getProvider(networkish?: Networkish): Provider {
  if (!networkish) {
    networkish = 1
  }
  if (typeof networkish === 'string') {
    const id = parseInt(networkish)
    if (!isNaN(id)) {
      networkish = 1
    }
  }
  const network = Network.from(networkish)
  // TODO check if other key needed

  const address = Endpoints.INSTANCE.chainServer.get(network.chainId.toString())
  const key = network.chainId.toString() + '-' + address
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
  provider = new QueuedStaticJsonRpcProvider(address, Network.from(network), Endpoints.INSTANCE.concurrency)
  providers.set(network.chainId.toString(), provider)
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
        return keys.reduce((accum, key) => {
          accum[key] = v[key]
          return accum
        }, <any>{})
      }

      return v
    })
  )
}

class QueuedStaticJsonRpcProvider extends JsonRpcProvider {
  executor: PQueue
  #performCache = new Map<string, Promise<any>>()

  constructor(url: string, network: Network, concurrency: number) {
    // TODO re-enable match when possible
    super(url, network, { staticNetwork: network, batchMaxCount: 1 })
    this.executor = new PQueue({ concurrency: concurrency })
  }

  async send(method: string, params: Array<any>): Promise<any> {
    const tag = getTag(method, params)
    const block = params[params.length - 1]
    let perform = this.#performCache.get(tag)
    if (!perform) {
      perform = this.executor.add(() => super.send(method, params))
      this.#performCache.set(tag, perform)
      // For non latest block call, we cache permanently, otherwise we cache for one minute
      if (block === 'latest') {
        setTimeout(() => {
          if (this.#performCache.get(tag) === perform) {
            this.#performCache.delete(tag)
          }
        }, 60 * 1000)
      }
    }

    const result = await perform
    if (!result) {
      throw Error('Unexpected null response')
    }
    return result
  }
}
