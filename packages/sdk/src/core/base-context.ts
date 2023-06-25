import { ProcessResult, RecordMetaData } from '@sentio/protos'
import { EventLoggerBinding } from './event-logger.js'
import { Meter, Labels } from './meter.js'
import { ChainId } from '@sentio/chain'
import { mergeProcessResults } from '@sentio/runtime'
import { Required } from 'utility-types'
import { ServerError, Status } from 'nice-grpc'

export abstract class BaseContext {
  meter: Meter
  eventLogger: EventLoggerBinding
  protected baseLabels: Labels
  private active: boolean

  private _res: Required<ProcessResult, 'states'> = {
    counters: [],
    events: [],
    exports: [],
    gauges: [],
    states: {
      configUpdated: false,
    },
  }

  public update(res: Partial<ProcessResult>) {
    if (this.active) {
      this._res = mergeProcessResults([this._res, ProcessResult.fromPartial(res)])
    } else {
      throw new ServerError(Status.INTERNAL, 'context not active, possible async function invoke without await')
    }
  }

  protected constructor(baseLabels: Labels | undefined) {
    this.meter = new Meter(this)
    this.eventLogger = new EventLoggerBinding(this)
    this.baseLabels = baseLabels || {}
    this.active = true
  }

  stopAndGetResult(): ProcessResult {
    if (this.active) {
      this.active = false
      return this._res
    } else {
      throw new ServerError(Status.INTERNAL, "Can't get result from same context twice")
    }
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
