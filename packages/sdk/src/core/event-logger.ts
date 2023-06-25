import { BaseContext } from './base-context.js'
import { EventTrackingResult, LogLevel } from '@sentio/protos'
import { normalizeAttribute } from './normalization.js'
import { MapStateStorage } from '@sentio/runtime'

export interface Attribute<T> {
  [key: string]: Exclude<T | number | bigint | string | boolean | LogLevel | Attribute<T> | undefined, Promise<any>>
}

export interface Event<T> extends Attribute<T> {
  // The unique identifier of main identity associate with an event
  // .e.g user id / token address / account address / contract address id
  //
  distinctId?: string
  severity?: LogLevel
  message?: string
}

export class EventLoggerState extends MapStateStorage<EventLogger> {
  static INSTANCE = new EventLoggerState()
}

export class EventLoggerBinding {
  private readonly ctx: BaseContext

  constructor(ctx: BaseContext) {
    this.ctx = ctx
  }

  emit<T>(eventName: string, event: Event<T>) {
    emit(this.ctx, eventName, event)
  }
}

export class EventLogger {
  private readonly eventName: string

  private constructor(eventName: string) {
    this.eventName = eventName
  }

  static register(eventName: string): EventLogger {
    const logger = new EventLogger(eventName)
    return EventLoggerState.INSTANCE.getOrSetValue(eventName, logger)
  }

  emit<T>(ctx: BaseContext, event: Event<T>) {
    emit(ctx, this.eventName, event)
  }
}

function emit<T>(ctx: BaseContext, eventName: string, event: Event<T>) {
  const { distinctId, severity, message, ...payload } = event

  const res: EventTrackingResult = {
    metadata: ctx.getMetaData(eventName, {}),
    severity: severity || LogLevel.INFO,
    message: message || '',
    distinctEntityId: distinctId || '',
    attributes: normalizeAttribute(payload),
    runtimeInfo: undefined,
    noMetric: true,
  }
  ctx.update({ events: [res] })
}
