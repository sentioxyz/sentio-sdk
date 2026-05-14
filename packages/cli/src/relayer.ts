import { ethers } from 'ethers'
import { INDEXER_REGISTRY_ABI } from './abi.js'

export interface FreshIndexer {
  id: bigint
  url: string
  storageNodeRpcPort: bigint
  // ...other fields exist but we don't need them
}

export function buildRelayerUrlList(indexers: FreshIndexer[], scheme: string): string[] {
  return indexers.map((i) => `${scheme}://${i.url}:${i.storageNodeRpcPort}`)
}

/// Picks one relayer URL. Honors `SENTIO_RELAYER_URL` env override. Otherwise
/// calls IndexerRegistry.getFreshIndexers() and picks one at random.
export async function pickRelayerUrl(
  provider: ethers.JsonRpcProvider,
  indexerRegistryAddr: string,
  freshFetcher?: () => Promise<FreshIndexer[]>
): Promise<string> {
  const override = process.env.SENTIO_RELAYER_URL
  if (override) return override

  const scheme = process.env.SENTIO_RELAYER_SCHEME ?? 'http'
  const indexers = freshFetcher ? await freshFetcher() : await defaultFetch(provider, indexerRegistryAddr)
  if (indexers.length === 0) {
    throw new Error('no fresh indexers found via IndexerRegistry.getFreshIndexers()')
  }
  const urls = buildRelayerUrlList(indexers, scheme)
  return urls[Math.floor(Math.random() * urls.length)]
}

/// Returns the full list of relayer URLs. Honors `SENTIO_RELAYER_URL` env override
/// (returns `[override]` in that case). Otherwise calls IndexerRegistry.getFreshIndexers()
/// and returns the shuffled list of `scheme://url:port` strings.
export async function discoverRelayerUrls(
  provider: ethers.JsonRpcProvider,
  indexerRegistryAddr: string,
  freshFetcher?: () => Promise<FreshIndexer[]>
): Promise<string[]> {
  const override = process.env.SENTIO_RELAYER_URL
  if (override) return [override]

  const scheme = process.env.SENTIO_RELAYER_SCHEME ?? 'http'
  const indexers = freshFetcher ? await freshFetcher() : await defaultFetch(provider, indexerRegistryAddr)
  if (indexers.length === 0) {
    throw new Error('no fresh indexers found via IndexerRegistry.getFreshIndexers()')
  }
  const urls = buildRelayerUrlList(indexers, scheme)
  // Shuffle in place so failover order is randomized across uploads.
  for (let i = urls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[urls[i], urls[j]] = [urls[j], urls[i]]
  }
  return urls
}

async function defaultFetch(provider: ethers.JsonRpcProvider, indexerRegistryAddr: string): Promise<FreshIndexer[]> {
  const reg = new ethers.Contract(indexerRegistryAddr, INDEXER_REGISTRY_ABI, provider)
  const raw = await reg.getFreshIndexers()
  return raw.map((r: any) => ({
    id: r.id,
    url: r.url,
    storageNodeRpcPort: r.storageNodeRpcPort
  }))
}
