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

// export function setProvider(config: Record<string, ChainConfig>, concurrency = 4, useChainServer = false) {
//   Endpoints.INSTANCE.providers = new Map<bigint, Provider>()
//
//   for (const chainIdStr in config) {
//     if (isNaN(Number.parseInt(chainIdStr))) {
//       continue
//     }
//
//     const chainConfig = config[chainIdStr]
//     const chainId = BigInt(chainIdStr)
//
//     // let providers: StaticJsonRpcProvider[] = []
//     // for (const http of chainConfig.Https) {
//     //   providers.push(new StaticJsonRpcProvider(http, chainId))
//     // }
//     // random shuffle
//     // providers = providers.sort(() => Math.random() - 0.5)
//
//     // const provider = new FallbackProvider(providers)
//
//     let rpcAddress = ''
//     if (useChainServer && chainConfig.ChainServer) {
//       rpcAddress = chainConfig.ChainServer
//     } else {
//       const idx = Math.floor(Math.random() * chainConfig.Https.length)
//       rpcAddress = chainConfig.Https[idx]
//     }
//
//     Endpoints.INSTANCE.providers.set(chainId, provider)
//   }
// }

class QueuedStaticJsonRpcProvider extends JsonRpcProvider {
  executor: PQueue
  network: Network

  constructor(url: string, network: Network, concurrency: number) {
    super(url, network)
    this.network = network
    this.executor = new PQueue({ concurrency: concurrency })
  }

  send(method: string, params: Array<any>): Promise<any> {
    return this.executor.add(() => super.send(method, params))
  }
  async _detectNetwork(): Promise<Network> {
    return this.network
  }
  get _network(): Network {
    return this.network
  }
  // disable batch eth call
  _start(): void {}
}
