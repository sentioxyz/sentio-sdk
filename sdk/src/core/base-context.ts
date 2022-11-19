import { DataDescriptor, ProcessResult, RecordMetaData } from '../gen'
import { Logger } from './logger'
import { Labels } from './metadata'
import { Meter } from './meter'

export abstract class BaseContext {
  meter: Meter
  logger: Logger

  res: ProcessResult = {
    counters: [],
    events: [],
    exports: [],
    gauges: [],
    logs: [],
  }

  protected constructor() {
    this.meter = new Meter(this)
    this.logger = new Logger(this)
  }

  getProcessResult(): ProcessResult {
    return this.res
  }

  abstract getMetaData(descriptor: DataDescriptor, labels: Labels): RecordMetaData
}
