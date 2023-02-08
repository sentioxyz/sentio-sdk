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

class QueuedStaticJsonRpcProvider extends JsonRpcProvider {
  executor: PQueue

  constructor(url: string, network: Network, concurrency: number) {
    // TODO re-enable match when possible
    super(url, network, { staticNetwork: network, batchMaxCount: 1 })
    this.executor = new PQueue({ concurrency: concurrency })
  }

  async send(method: string, params: Array<any>): Promise<any> {
    const res = await this.executor.add(() => super.send(method, params))
    if (!res) {
      throw Error('Unexpected null response')
    }
    return res
  }
}
