import { getNetwork, Provider, StaticJsonRpcProvider } from '@ethersproject/providers'
import { Networkish } from '@ethersproject/networks'
import PQueue from 'p-queue'
import { ConnectionInfo } from '@ethersproject/web'
import { ChainConfig } from './chain-config'

export const DummyProvider = new StaticJsonRpcProvider(undefined, 1)

export function getProvider(networkish?: Networkish): Provider {
  if (!networkish) {
    networkish = 1
  }
  const network = getNetwork(networkish)

  if (!global.PROCESSOR_STATE.providers) {
    throw Error('Provider not found')
  }
  const value = global.PROCESSOR_STATE.providers.get(network.chainId)
  if (value === undefined) {
    throw Error('Provider not found')
  }
  return value
}

export function setProvider(config: Record<string, ChainConfig>, concurrency = 4, useChainServer = false) {
  global.PROCESSOR_STATE.providers = new Map<number, Provider>()

  for (const chainIdStr in config) {
    if (isNaN(Number.parseInt(chainIdStr))) {
      continue
    }

    const chainConfig = config[chainIdStr]
    const chainId = Number(chainIdStr)

    // let providers: StaticJsonRpcProvider[] = []
    // for (const http of chainConfig.Https) {
    //   providers.push(new StaticJsonRpcProvider(http, chainId))
    // }
    // random shuffle
    // providers = providers.sort(() => Math.random() - 0.5)

    // const provider = new FallbackProvider(providers)

    let rpcAddress = ''
    if (useChainServer && chainConfig.ChainServer) {
      rpcAddress = chainConfig.ChainServer
    } else {
      const idx = Math.floor(Math.random() * chainConfig.Https.length)
      rpcAddress = chainConfig.Https[idx]
    }

    const provider = new QueuedStaticJsonRpcProvider(rpcAddress, chainId, concurrency)
    global.PROCESSOR_STATE.providers.set(chainId, provider)
  }
}

class QueuedStaticJsonRpcProvider extends StaticJsonRpcProvider {
  executor: PQueue

  constructor(url: ConnectionInfo | string, network: Networkish, concurrency: number) {
    super(url, network)
    this.executor = new PQueue({ concurrency: concurrency })
  }

  send(method: string, params: Array<any>): Promise<any> {
    return this.executor.add(() => super.send(method, params))
  }
}
