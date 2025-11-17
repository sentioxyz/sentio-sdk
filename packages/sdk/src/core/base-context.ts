import { ProcessResult, RecordMetaData, TemplateInstance } from '@sentio/protos'
import { EventLoggerBinding } from './event-logger.js'
import { Meter, Labels } from './meter.js'
import { ChainId } from '@sentio/chain'
import { mergeProcessResultsInPlace, PluginManager } from '@sentio/runtime'
import { Required } from 'utility-types'
import { ServerError, Status } from 'nice-grpc'
import { Store } from '../store/store.js'

export abstract class BaseContext {
  meter: Meter
  eventLogger: EventLoggerBinding
  private _store: Store
  baseLabels: Labels
  private active: boolean

  private _res: Required<ProcessResult, 'states'> = {
    counters: [],
    events: [],
    exports: [],
    gauges: [],
    states: {
      configUpdated: false
    },
    timeseriesResult: []
  }

  public update(res: Partial<ProcessResult>) {
    if (this.active) {
      mergeProcessResultsInPlace(this._res, [ProcessResult.fromPartial(res)])
    } else {
      throw new ServerError(Status.INTERNAL, 'context not active, possible async function invoke without await')
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
      throw new ServerError(Status.INTERNAL, "Can't get result from same context twice")
    }
  }

  private metadataCache = new Map<string, RecordMetaData>()

  getMetaData(name: string, labels: Labels): RecordMetaData {
    if (Object.keys(labels).length === 0) {
      let metadata = this.metadataCache.get(name)
      if (!metadata) {
        metadata = {
          ...this.baseLabels,
          ...this.getMetaDataInternal(name, labels)
        }
        this.metadataCache.set(name, metadata)
      }
      return metadata
    }

    return {
      ...this.baseLabels,
      ...this.getMetaDataInternal(name, labels)
    }
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
