import path from 'path'
import fs from 'fs-extra'
import { ChainConfig } from './chain-config.js'

/**
 * Resolved RPC endpoint for a chain: the base URL plus optional HTTP headers
 * attached to every request, e.g. the `X-Forwarded-Host` routing key for the Sui
 * gRPC client talking to the Sentio rpc-node.
 */
export interface ChainRpc {
  url: string
  headers?: Record<string, string>
}

export class Endpoints {
  static INSTANCE: Endpoints = new Endpoints()

  concurrency = 8
  priceFeedAPI = ''

  chainRpc = new Map<string, ChainRpc>()

  batchCount = 1

  /** Convenience accessor for callers that only need the endpoint URL. */
  getChainRpcUrl(chainId: string): string | undefined {
    return this.chainRpc.get(chainId)?.url
  }
}

export function configureEndpoints(options: any) {
  const fullPath = path.resolve(options.chainsConfig)
  const chainsConfig = fs.readJsonSync(fullPath)

  const concurrencyOverride = process.env['OVERRIDE_CONCURRENCY']
    ? parseInt(process.env['OVERRIDE_CONCURRENCY'])
    : undefined
  const batchCountOverride = process.env['OVERRIDE_BATCH_COUNT']
    ? parseInt(process.env['OVERRIDE_BATCH_COUNT'])
    : undefined

  Endpoints.INSTANCE.concurrency = concurrencyOverride ?? options.concurrency
  Endpoints.INSTANCE.batchCount = batchCountOverride ?? options.batchCount
  Endpoints.INSTANCE.priceFeedAPI = options.pricefeedServer

  for (const [id, config] of Object.entries(chainsConfig)) {
    const chainConfig = config as ChainConfig
    if (chainConfig.Rpc?.Url) {
      Endpoints.INSTANCE.chainRpc.set(id, {
        url: chainConfig.Rpc.Url,
        headers: chainConfig.Rpc.Headers
      })
    } else {
      const http = chainConfig.Https?.[0]
      if (http) {
        Endpoints.INSTANCE.chainRpc.set(id, { url: http })
      } else {
        console.error('not valid config for chain', id)
      }
    }
  }
}
