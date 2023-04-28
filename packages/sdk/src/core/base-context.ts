import { ProcessResult, RecordMetaData, StateResult } from '@sentio/protos'
import { EventLogger } from './event-logger.js'
import { Meter, Labels } from './meter.js'

export abstract class BaseContext {
  meter: Meter
  eventLogger: EventLogger

  _res: ProcessResult & { states: StateResult } = {
    counters: [],
    events: [],
    exports: [],
    gauges: [],
    states: {
      configUpdated: false,
    },
  }

  protected constructor() {
    this.meter = new Meter(this)
    this.eventLogger = new EventLogger(this)
  }

  getProcessResult(): ProcessResult {
    return this._res
  }

  abstract getMetaData(name: string, labels: Labels): RecordMetaData

  abstract getChainId(): string
}
