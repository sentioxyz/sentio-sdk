import { ChainConfig } from '../chain-config'
import { setProvider } from '@sentio/sdk'

export function loadTestProvidersFromEnv(ids: string[] | string): boolean {
  const dummyConfig: Record<string, ChainConfig> = {}

  if (!Array.isArray(ids)) {
    ids = [ids]
  }

  for (const k of ids) {
    const envKey = 'TEST_ENDPOINT_' + k
    const http = process.env[envKey]
    if (!http) {
      return false
    }
    dummyConfig[k] = {
      ChainID: k,
      Https: [http],
    }
  }

  setProvider(dummyConfig)
  return true
}
