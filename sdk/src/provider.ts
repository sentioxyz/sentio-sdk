import { BaseProvider, getNetwork, StaticJsonRpcProvider } from '@ethersproject/providers'
import { Networkish } from '@ethersproject/networks'

export const DummyProvider = new StaticJsonRpcProvider(undefined, 1)

export function getProvider(networkish?: Networkish): BaseProvider {
  if (!networkish) {
    networkish = 1
  }
  const network = getNetwork(networkish)

  if (!globalThis.SentioProvider) {
    throw Error('Provider not found')
  }
  const value = globalThis.SentioProvider.get(network.chainId)
  if (value === undefined) {
    throw Error('Provider not found')
  }
  return value
}

export function setProvider(config: any) {
  globalThis.SentioProvider = new Map<number, StaticJsonRpcProvider>()

  for (const chainIdStr in config) {
    const chainConfig = config[chainIdStr]
    const chainId = Number(chainIdStr)

    globalThis.SentioProvider.set(chainId, new StaticJsonRpcProvider(chainConfig.Https[0], chainId))
  }
}
