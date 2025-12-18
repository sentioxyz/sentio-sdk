import { after, afterEach, describe, it } from 'node:test'
import assert from 'assert'
import { MemoryCache } from '../cache.js'
import { MemoryDatabase } from '../../testing/memory-database.js'
import { StoreContext } from '../context.js'
import { Subject } from 'rxjs'
import { DeepPartial, ProcessStreamResponse, RecordMetaData } from '@sentio/protos'
import { BaseContext } from '../../core/base-context.js'
import { ChainId } from '@sentio/chain'
import { Labels } from '../../core/meter.js'

// Mock BaseContext for testing
class MockBaseContext extends BaseContext {
  private blockNumber: bigint

  constructor(blockNumber: bigint = 12345n) {
    super({})
    this.blockNumber = blockNumber
  }

  setBlockNumber(blockNumber: bigint) {
    this.blockNumber = blockNumber
  }

  protected getMetaDataInternal(name: string, labels: Labels): RecordMetaData {
    return {
      address: '',
      contractName: '',
      labels: {},
      transactionHash: '',
      blockNumber: this.blockNumber,
      transactionIndex: 0,
      logIndex: 0,
      chainId: ChainId.ETHEREUM,
      name
    }
  }

  getChainId(): ChainId {
    return ChainId.ETHEREUM
  }
}

describe('Test MemoryCache', () => {
  const subject = new Subject<DeepPartial<ProcessStreamResponse>>()
  const storeContext = new StoreContext(subject, 1)
  const db = new MemoryDatabase(storeContext)
  const mockContext = new MockBaseContext()

  db.start()

  it('should set and get a string value', async () => {
    const cache = new MemoryCache(storeContext, mockContext)

    await cache.set('test-key', 'test-value')
    const value = await cache.get<string>('test-key')

    assert.strictEqual(value, 'test-value')
  })

  it('should set and get a number value', async () => {
    const cache = new MemoryCache(storeContext, mockContext)

    await cache.set('number-key', 42)
    const value = await cache.get<number>('number-key')

    assert.strictEqual(value, 42)
  })

  it('should set and get an object value', async () => {
    const cache = new MemoryCache(storeContext, mockContext)
    const testObject = { name: 'test', count: 10, nested: { value: 'inner' } }

    await cache.set('object-key', testObject)
    const value = await cache.get<typeof testObject>('object-key')

    assert.deepStrictEqual(value, testObject)
  })

  it('should set and get an array value', async () => {
    const cache = new MemoryCache(storeContext, mockContext)
    const testArray = [1, 2, 3, 'four', { five: 5 }]

    await cache.set('array-key', testArray)
    const value = await cache.get<typeof testArray>('array-key')

    assert.deepStrictEqual(value, testArray)
  })

  it('should return null for non-existent key', async () => {
    const cache = new MemoryCache(storeContext, mockContext)

    const value = await cache.get<string>('non-existent-key')

    assert.strictEqual(value, null)
  })

  it('should delete a value', async () => {
    const cache = new MemoryCache(storeContext, mockContext)

    await cache.set('delete-key', 'to-be-deleted')
    let value = await cache.get<string>('delete-key')
    assert.strictEqual(value, 'to-be-deleted')

    await cache.delete('delete-key')
    value = await cache.get<string>('delete-key')
    assert.strictEqual(value, null)
  })

  it('should overwrite existing value', async () => {
    const cache = new MemoryCache(storeContext, mockContext)

    await cache.set('overwrite-key', 'first-value')
    let value = await cache.get<string>('overwrite-key')
    assert.strictEqual(value, 'first-value')

    await cache.set('overwrite-key', 'second-value')
    value = await cache.get<string>('overwrite-key')
    assert.strictEqual(value, 'second-value')
  })

  it('should set and get value in block', async () => {
    const cache = new MemoryCache(storeContext, mockContext)
    mockContext.setBlockNumber(100n)

    await cache.setInBlock('block-key', 'block-value')
    const value = await cache.getInBlock<string>('block-key')

    assert.strictEqual(value, 'block-value')
  })

  it('should isolate values by block number', async () => {
    // Use separate contexts for different blocks since BaseContext caches metadata
    const context100 = new MockBaseContext(100n)
    const context200 = new MockBaseContext(200n)
    const cache100 = new MemoryCache(storeContext, context100)
    const cache200 = new MemoryCache(storeContext, context200)

    // Set value in block 100
    await cache100.setInBlock('isolated-key', 'value-in-100')

    // Set value in block 200
    await cache200.setInBlock('isolated-key', 'value-in-200')

    // Verify block 200 has its own value
    let value = await cache200.getInBlock<string>('isolated-key')
    assert.strictEqual(value, 'value-in-200')

    // Verify block 100 still has its value
    value = await cache100.getInBlock<string>('isolated-key')
    assert.strictEqual(value, 'value-in-100')
  })

  it('should return null for non-existent key in block', async () => {
    const cache = new MemoryCache(storeContext, mockContext)
    mockContext.setBlockNumber(300n)

    const value = await cache.getInBlock<string>('non-existent-block-key')

    assert.strictEqual(value, null)
  })

  it('should delete value in block', async () => {
    const cache = new MemoryCache(storeContext, mockContext)
    mockContext.setBlockNumber(400n)

    await cache.setInBlock('delete-block-key', 'to-be-deleted')
    let value = await cache.getInBlock<string>('delete-block-key')
    assert.strictEqual(value, 'to-be-deleted')

    await cache.deleteInBlock('delete-block-key')
    value = await cache.getInBlock<string>('delete-block-key')
    assert.strictEqual(value, null)
  })

  it('should handle boolean values', async () => {
    const cache = new MemoryCache(storeContext, mockContext)

    await cache.set('bool-true', true)
    await cache.set('bool-false', false)

    assert.strictEqual(await cache.get<boolean>('bool-true'), true)
    assert.strictEqual(await cache.get<boolean>('bool-false'), false)
  })

  it('should handle null value', async () => {
    const cache = new MemoryCache(storeContext, mockContext)

    await cache.set('null-key', null)
    const value = await cache.get<null>('null-key')

    assert.strictEqual(value, null)
  })

  afterEach(() => {
    db.reset()
  })

  after(() => {
    storeContext.close()
  })
})
