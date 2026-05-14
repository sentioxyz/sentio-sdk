import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { pickRelayerUrl, buildRelayerUrlList } from './relayer.js'

describe('relayer', () => {
  it('honors SENTIO_RELAYER_URL env override', async () => {
    const original = process.env.SENTIO_RELAYER_URL
    process.env.SENTIO_RELAYER_URL = 'http://localhost:8546'
    try {
      const url = await pickRelayerUrl({} as any, '0x0', () => Promise.resolve([]))
      assert.equal(url, 'http://localhost:8546')
    } finally {
      if (original === undefined) delete process.env.SENTIO_RELAYER_URL
      else process.env.SENTIO_RELAYER_URL = original
    }
  })

  it('buildRelayerUrlList assembles scheme://url:port from Indexer struct', () => {
    const indexers = [
      { url: '64.38.144.158', storageNodeRpcPort: 10003n },
      { url: '64.38.144.158', storageNodeRpcPort: 20003n },
      { url: '103.67.203.149', storageNodeRpcPort: 10003n }
    ]
    const urls = buildRelayerUrlList(indexers as any, 'http')
    assert.deepEqual(urls, ['http://64.38.144.158:10003', 'http://64.38.144.158:20003', 'http://103.67.203.149:10003'])
  })

  it('buildRelayerUrlList respects scheme env override', () => {
    const indexers = [{ url: '64.38.144.158', storageNodeRpcPort: 10003n }]
    const urls = buildRelayerUrlList(indexers as any, 'https')
    assert.deepEqual(urls, ['https://64.38.144.158:10003'])
  })
})
