import { ProcessResult, RecordMetaData } from '@sentio/protos'
import { Logger } from './logger.js'
import { Labels } from './metadata.js'
import { Meter } from './meter.js'
import { BoundedEventTracker } from './event-tracker.js'

export abstract class BaseContext {
  meter: Meter
  logger: Logger
  eventTracker: BoundedEventTracker

  _res: ProcessResult = {
    counters: [],
    events: [],
    exports: [],
    gauges: [],
    logs: [],
  }

  protected constructor() {
    this.meter = new Meter(this)
    this.logger = new Logger(this)
    this.eventTracker = new BoundedEventTracker(this)
  }

  getProcessResult(): ProcessResult {
    return this._res
  }

  abstract getMetaData(name: string, labels: Labels): RecordMetaData
}
