import { IStoreContext } from '@sentio/runtime'
import { DBRequest, DBResponse, RichStruct, RichValue } from '@sentio/protos'
import { BaseContext } from '../core/index.js'

/** Internal entity name used for cache storage */
const CacheItemEntityName = 'MemoryCacheItem'

/**
 * A key-value cache that persists across handler invocations.
 *
 * MemoryCache provides a simple interface for storing and retrieving JSON-serializable
 * values. It's useful for caching computed results, tracking state between events,
 * or storing intermediate data during processing.
 *
 * Access the cache through the context object in your handlers:
 *
 * @example
 * ```typescript
 * // Basic usage
 * ERC20Processor.bind({ address: TOKEN_ADDRESS })
 *   .onEventTransfer(async (event, ctx) => {
 *     // Get cached total
 *     let total = await ctx.cache.get<number>('transferTotal') ?? 0
 *     total += Number(event.args.value)
 *     await ctx.cache.set('transferTotal', total)
 *   })
 * ```
 *
 * @example
 * ```typescript
 * // Block-scoped caching (values isolated per block)
 * .onEventTransfer(async (event, ctx) => {
 *   // This value is only visible within the current block
 *   await ctx.cache.setInBlock('blockTransferCount', count)
 *   const blockCount = await ctx.cache.getInBlock<number>('blockTransferCount')
 * })
 * ```
 *
 * @remarks
 * - Values are JSON serialized, so only JSON-compatible types are supported
 * - Cache is enabled by default; configure via `GLOBAL_CONFIG.cache`
 * - Block-scoped methods (`*InBlock`) prefix keys with block number for isolation
 */
export class MemoryCache {
  constructor(
    private readonly storeContext: IStoreContext,
    private readonly context: BaseContext
  ) {}

  /**
   * Retrieves a value from the cache.
   *
   * @typeParam T - The expected type of the cached value
   * @param key - The unique key identifying the cached value
   * @returns The cached value deserialized as type T, or null if not found
   *
   * @example
   * ```typescript
   * const user = await ctx.cache.get<{ name: string, score: number }>('user:123')
   * if (user) {
   *   console.log(user.name, user.score)
   * }
   * ```
   */
  public async get<T>(key: string): Promise<T | null> {
    const promise = this.storeContext.sendRequest({
      get: {
        entity: CacheItemEntityName,
        id: key
      }
    })

    const data = (await promise) as DBResponse
    if (data.entityList?.entities[0]) {
      const entityData = data.entityList?.entities[0]?.data as RichStruct
      const value = entityData.fields['value'] as RichValue
      return JSON.parse(value.stringValue!) as T
    }

    return null
  }

  /**
   * Stores a value in the cache.
   *
   * @typeParam T - The type of value being stored (must be JSON-serializable)
   * @param key - The unique key to store the value under
   * @param value - The value to cache (will be JSON serialized)
   *
   * @example
   * ```typescript
   * await ctx.cache.set('config', { threshold: 100, enabled: true })
   * await ctx.cache.set('lastPrice', 1234.56)
   * ```
   */
  public async set<T>(key: string, value: T): Promise<void> {
    const entityData: RichStruct = {
      fields: {
        id: {
          stringValue: key
        },
        value: {
          stringValue: JSON.stringify(value)
        }
      }
    }
    const request = {
      upsert: {
        entity: [CacheItemEntityName],
        id: [key],
        entityData: [entityData]
      }
    } as DBRequest
    await this.storeContext.sendRequest(request)
  }

  /**
   * Removes a value from the cache.
   *
   * @param key - The key of the value to remove
   *
   * @example
   * ```typescript
   * await ctx.cache.delete('temporaryData')
   * ```
   */
  public async delete(key: string): Promise<void> {
    const request = {
      delete: {
        entity: [CacheItemEntityName],
        id: [key]
      }
    } as DBRequest
    await this.storeContext.sendRequest(request)
  }

  /**
   * Stores a value scoped to the current block number.
   *
   * The key is automatically prefixed with the block number, ensuring that
   * values set in different blocks don't collide. Useful for accumulating
   * per-block statistics or temporary computation results.
   *
   * @typeParam T - The type of value being stored (must be JSON-serializable)
   * @param key - The key to store the value under (will be prefixed with block number)
   * @param value - The value to cache
   *
   * @example
   * ```typescript
   * // Track transfers per block
   * let count = await ctx.cache.getInBlock<number>('transferCount') ?? 0
   * await ctx.cache.setInBlock('transferCount', count + 1)
   * ```
   */
  public async setInBlock<T>(key: string, value: T): Promise<void> {
    const block = this.context.getMetaData('for cache', {}).blockNumber
    return this.set<T>(`${block}-${key}`, value)
  }

  /**
   * Retrieves a value scoped to the current block number.
   *
   * Only returns values that were set in the same block using `setInBlock`.
   *
   * @typeParam T - The expected type of the cached value
   * @param key - The key to retrieve (block number prefix is added automatically)
   * @returns The cached value for this block, or null if not found
   *
   * @example
   * ```typescript
   * const blockVolume = await ctx.cache.getInBlock<bigint>('volume')
   * ```
   */
  public async getInBlock<T>(key: string): Promise<T | null> {
    const block = this.context.getMetaData('for cache', {}).blockNumber
    return this.get<T>(`${block}-${key}`)
  }

  /**
   * Removes a value scoped to the current block number.
   *
   * @param key - The key to delete (block number prefix is added automatically)
   *
   * @example
   * ```typescript
   * await ctx.cache.deleteInBlock('temporaryBlockData')
   * ```
   */
  public async deleteInBlock(key: string): Promise<void> {
    const block = this.context.getMetaData('for cache', {}).blockNumber
    return this.delete(`${block}-${key}`)
  }
}
