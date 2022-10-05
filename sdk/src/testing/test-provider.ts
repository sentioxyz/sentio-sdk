import { ChainConfig } from '../chain-config'
import { setProvider } from '@sentio/sdk'
import { CHAIN_MAP } from '../utils/chain'

export function loadTestProvidersFromEnv(requiredChainIds: string[] | string): boolean {
  const dummyConfig: Record<string, ChainConfig> = {}

  if (!Array.isArray(requiredChainIds)) {
    requiredChainIds = [requiredChainIds]
  }

  for (const k of Object.keys(CHAIN_MAP)) {
    const envKey = 'TEST_ENDPOINT_' + k
    const http = process.env[envKey]
    if (!http) {
      continue
    }
    dummyConfig[k] = {
      ChainID: k,
      Https: [http],
    }
  }

  setProvider(dummyConfig)
  for (const id of requiredChainIds) {
    if (!requiredChainIds.includes(id)) {
      return false
    }
  }
  return true
}
