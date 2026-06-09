import {
  type ProcessResult,
  ProcessResultSchema,
  type RecordMetaData,
  RecordMetaDataSchema,
  type TemplateInstance
} from '@sentio/protos'
import { create, type MessageInitShape } from '@bufbuild/protobuf'
import { EventLoggerBinding } from './event-logger.js'
import { Meter, Labels } from './meter.js'
import { ChainId } from '@sentio/chain'
import { mergeProcessResultsInPlace, PluginManager } from '@sentio/runtime'
import { Required } from 'utility-types'
import { ConnectError, Code } from '@connectrpc/connect'
import { Store } from '../store/store.js'
import { MemoryCache } from '../store/cache.js'

export abstract class BaseContext {
  meter: Meter
  eventLogger: EventLoggerBinding
  private _store: Store
  private _cache: MemoryCache
  baseLabels: Labels
  private active: boolean

  private _res: Required<ProcessResult, 'states'> = create(ProcessResultSchema, {
    counters: [],
    events: [],
    exports: [],
    gauges: [],
    states: {
      configUpdated: false
    },
    timeseriesResult: []
  }) as Required<ProcessResult, 'states'>

  public update(res: MessageInitShape<typeof ProcessResultSchema>) {
    if (this.active) {
      mergeProcessResultsInPlace(this._res, [create(ProcessResultSchema, res)])
    } else {
      throw new ConnectError('context not active, possible async function invoke without await', Code.Internal)
    }
  }

  protected constructor(baseLabels: Labels | undefined) {
    this.meter = new Meter(this)
    this.eventLogger = new EventLoggerBinding(this)
    this.baseLabels = baseLabels || {}
    this.active = true
    this.initStore()
  }

  stopAndGetResult(): ProcessResult {
    if (this.active) {
      this.active = false
      return this._res
    } else {
      throw new ConnectError("Can't get result from same context twice", Code.Internal)
    }
  }

  private metadataCache = new Map<string, RecordMetaData>()

  getMetaData(name: string, labels: Labels): RecordMetaData {
    if (Object.keys(labels).length === 0) {
      let metadata = this.metadataCache.get(name)
      if (!metadata) {
        metadata = create(RecordMetaDataSchema, {
          ...this.baseLabels,
          ...this.getMetaDataInternal(name, labels)
        })
        this.metadataCache.set(name, metadata)
      }
      return metadata
    }

    return create(RecordMetaDataSchema, {
      ...this.baseLabels,
      ...this.getMetaDataInternal(name, labels)
    })
  }

  protected abstract getMetaDataInternal(name: string, labels: Labels): RecordMetaData

  abstract getChainId(): ChainId

  get store() {
    if (this._store == null) {
      this.initStore()
      if (this._store == null) {
        console.warn('Store is not set, please initialize the processor with your database schema first.')
      }
    }
    return this._store
  }

  /**
   * Access the in-memory key-value cache.
   *
   * The cache allows storing and retrieving JSON-serializable values that persist
   * across handler invocations. Useful for caching computed results, tracking
   * cumulative state, or storing intermediate processing data.
   *
   * @returns The MemoryCache instance, or undefined if cache is not available
   *
   * @example
   * ```typescript
   * // Store and retrieve values
   * await ctx.cache.set('totalVolume', volume)
   * const cached = await ctx.cache.get<number>('totalVolume')
   *
   * // Block-scoped values (isolated per block)
   * await ctx.cache.setInBlock('blockCount', count)
   * ```
   *
   * @see {@link MemoryCache} for full API documentation
   */
  get cache() {
    if (!this._cache) {
      const dbContext = PluginManager.INSTANCE.dbContextLocalStorage.getStore()
      if (dbContext) {
        this._cache = new MemoryCache(dbContext, this)
      }
    }
    return this._cache
  }

  // this method must be called within the dbContextLocalStorage scope
  initStore() {
    const dbContext = PluginManager.INSTANCE.dbContextLocalStorage.getStore()
    if (dbContext) {
      this._store = new Store(dbContext)
    }
  }

  sendTemplateInstance(instance: TemplateInstance, unbind: boolean = false) {
    const store = PluginManager.INSTANCE.dbContextLocalStorage.getStore()
    if (store && 'sendTemplateRequest' in store) {
      store?.sendTemplateRequest([instance], unbind)
    }
  }
}
