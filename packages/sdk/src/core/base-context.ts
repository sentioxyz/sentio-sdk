import { ProcessResult, RecordMetaData } from '@sentio/protos'
import { EventLogger } from './event-logger.js'
import { Meter, Labels } from './meter.js'
import { BoundedEventTracker } from './event-tracker.js'

export abstract class BaseContext {
  meter: Meter
  eventLogger: EventLogger

  logger: EventLogger
  /** @deprecated use {@link this.eventLogger} instead */
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
    this.eventLogger = new EventLogger(this)
    // eslint-disable-next-line deprecation/deprecation
    this.logger = this.eventLogger
    // eslint-disable-next-line deprecation/deprecation
    this.eventTracker = new BoundedEventTracker(this)
  }

  getProcessResult(): ProcessResult {
    return this._res
  }

  abstract getMetaData(name: string, labels: Labels): RecordMetaData
}
