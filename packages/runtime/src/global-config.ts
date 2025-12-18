import { ExecutionConfig } from './gen/processor/protos/processor.js'

/**
 * Configuration for the in-memory cache feature.
 *
 * The cache provides a key-value store that persists across handler invocations,
 * allowing processors to store and retrieve computed values efficiently.
 */
export interface CacheConfig {
  /**
   * Whether the cache feature is enabled.
   * When enabled, a MemoryCacheItem entity will be automatically added to the schema.
   * @default true
   */
  enabled: boolean

  /**
   * Maximum size of the cache in megabytes.
   * Controls the memory limit for cached items.
   * @default 100
   */
  size?: number
}

/**
 * Global configuration for the Sentio SDK runtime.
 *
 * This configuration controls execution behavior and optional features like caching.
 * Settings here apply globally to all processors in the project.
 */
export interface GlobalConfig {
  /**
   * Execution configuration controlling how handlers are processed.
   * Includes settings for sequential vs parallel execution, block time handling, etc.
   */
  execution: Partial<ExecutionConfig>

  /**
   * Optional cache configuration for enabling in-memory key-value storage.
   * When enabled, processors can use `ctx.cache` to store and retrieve values.
   *
   * @example
   * ```typescript
   * // In your processor handler:
   * const cachedValue = await ctx.cache.get<number>('myKey')
   * if (!cachedValue) {
   *   await ctx.cache.set('myKey', computedValue)
   * }
   * ```
   */
  cache?: CacheConfig
}

// Experimental global config, only apply to eth for now
export const GLOBAL_CONFIG: GlobalConfig = {
  execution: {
    sequential: false,
    forceExactBlockTime: false
  },
  cache: {
    enabled: true
  }
}

export function freezeGlobalConfig() {
  deepFreeze(GLOBAL_CONFIG.execution)
}

export function deepFreeze(object: any) {
  // Retrieve the property names defined on object
  const propNames = Reflect.ownKeys(object)

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = object[name]

    if ((value && typeof value === 'object') || typeof value === 'function') {
      deepFreeze(value)
    }
  }

  return Object.freeze(object)
}
