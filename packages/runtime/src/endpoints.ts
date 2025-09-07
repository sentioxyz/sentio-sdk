import path from 'path'
import fs from 'fs-extra'
import { ChainConfig } from './chain-config.js'

export class Endpoints {
  static INSTANCE: Endpoints = new Endpoints()

  concurrency = 8
  chainQueryAPI = ''
  priceFeedAPI = ''

  chainServer = new Map<string, string>()

  batchCount = 1
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
  Endpoints.INSTANCE.chainQueryAPI = options.chainqueryServer
  Endpoints.INSTANCE.priceFeedAPI = options.pricefeedServer

  for (const [id, config] of Object.entries(chainsConfig)) {
    const chainConfig = config as ChainConfig
    if (chainConfig.ChainServer) {
      Endpoints.INSTANCE.chainServer.set(id, chainConfig.ChainServer)
    } else {
      const http = chainConfig.Https?.[0]
      if (http) {
        Endpoints.INSTANCE.chainServer.set(id, http)
      } else {
        console.error('not valid config for chain', id)
      }
    }
  }
}
