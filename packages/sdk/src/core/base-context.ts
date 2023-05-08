import { ProcessResult, RecordMetaData, StateResult } from '@sentio/protos'
import { EventLogger } from './event-logger.js'
import { Meter, Labels } from './meter.js'
import { ChainId } from './chain.js'

export abstract class BaseContext {
  meter: Meter
  eventLogger: EventLogger
  protected baseLabels: Labels

  _res: ProcessResult & { states: StateResult } = {
    counters: [],
    events: [],
    exports: [],
    gauges: [],
    states: {
      configUpdated: false,
    },
  }

  protected constructor(baseLabels: Labels | undefined) {
    this.meter = new Meter(this)
    this.eventLogger = new EventLogger(this)
    this.baseLabels = baseLabels || {}
  }

  getProcessResult(): ProcessResult {
    return this._res
  }

  getMetaData(name: string, labels: Labels): RecordMetaData {
    return {
      ...this.baseLabels,
      ...this.getMetaDataInternal(name, labels),
    }
  }

  protected abstract getMetaDataInternal(name: string, labels: Labels): RecordMetaData

  abstract getChainId(): ChainId
}
