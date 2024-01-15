import { BaseContext } from './base-context.js'
import { CoinID, EventLogConfig, EventLogConfig_BasicFieldType, EventTrackingResult, LogLevel } from '@sentio/protos'
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

export interface EventLogOptions {
  fields: Record<string, CoinID | EventLogConfig_BasicFieldType>
}

export class EventLogger {
  private readonly eventName: string
  config: EventLogConfig

  private constructor(eventName: string, config?: EventLogConfig) {
    this.eventName = eventName
    this.config = EventLogConfig.fromPartial(config || {})
  }

  static register(eventName: string, options?: EventLogOptions): EventLogger {
    const config = EventLogConfig.create()
    for (const [key, value] of Object.entries(options?.fields || {})) {
      let basicType: EventLogConfig_BasicFieldType | undefined
      let coinType: CoinID | undefined
      if (typeof value === 'number') {
        basicType = value
      } else {
        coinType = value
      }
      config.fields.push({
        name: key,
        basicType,
        coinType
      })
    }

    const logger = new EventLogger(eventName, config)
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
    noMetric: true
  }
  ctx.update({ events: [res] })
}
