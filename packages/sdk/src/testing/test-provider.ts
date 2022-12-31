import { ChainConfig } from '../chain-config'
import { CHAIN_MAP } from '../utils/chain'
import { setProvider } from '../provider'

export function loadTestProvidersFromEnv(requiredChainIds: string[] | string): boolean {
  const dummyConfig: Record<string, ChainConfig> = {}
  const found: string[] = []

  if (!Array.isArray(requiredChainIds)) {
    requiredChainIds = [requiredChainIds]
  }

  for (const k of Object.keys(CHAIN_MAP)) {
    const envKey = 'TEST_ENDPOINT_' + k
    const http = process.env[envKey]
    if (!http) {
      continue
    }
    found.push(k)
    dummyConfig[k] = {
      ChainID: k,
      Https: [http],
    }
  }

  setProvider(dummyConfig)
  for (const id of requiredChainIds) {
    if (!found.includes(id)) {
      return false
    }
  }
  return true
}
