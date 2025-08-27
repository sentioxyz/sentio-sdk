import { Endpoints } from '@sentio/runtime'
import { ChainInfo } from '@sentio/chain'

export function loadTestProvidersFromEnv(requiredChainIds: string[] | string): boolean {
  const found: string[] = []

  if (!Array.isArray(requiredChainIds)) {
    requiredChainIds = [requiredChainIds]
  }

  for (const k of Object.keys(ChainInfo)) {
    const envKey = 'TEST_ENDPOINT_' + k
    const http = process.env[envKey]
    if (!http) {
      continue
    }
    found.push(k)
    Endpoints.INSTANCE.chainServer.set(k, http)
  }

  for (const id of requiredChainIds) {
    if (!found.includes(id)) {
      return false
    }
  }
  return true
}
