import { BaseContext } from './base-context.js'
import {
  CoinID,
  EventLogConfig,
  EventLogConfig_BasicFieldType,
  EventLogConfig_Field,
  EventLogConfig_StructFieldType,
  EventTrackingResult,
  LogLevel,
  RichStruct,
  TimeseriesResult,
  TimeseriesResult_TimeseriesType
} from '@sentio/protos'
import { normalizeAttribute, normalizeLabels, normalizeToRichStruct } from './normalization.js'
import { MapStateStorage, processMetrics } from '@sentio/runtime'
import { BN } from 'fuels'
import { BigDecimal } from '@sentio/bigdecimal'
import { DatabaseSchema } from './database-schema.js'

export interface Attribute<T> {
  [key: string]: Exclude<
    T | number | bigint | string | boolean | LogLevel | Attribute<T> | BN | BigDecimal | undefined,
    Promise<any>
  >
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
    checkEventName(eventName)
    emit(this.ctx, eventName, event)
  }
}

export type BasicFieldType = EventLogConfig_BasicFieldType
export const BasicFieldType = EventLogConfig_BasicFieldType

export type FieldType = CoinID | BasicFieldType | Fields

export type Fields = { [key: string]: FieldType }

export interface EventLogOptions {
  fields: Fields
}

export function fieldsToProtos(fields: Fields): EventLogConfig_Field[] {
  const fieldsProto: EventLogConfig_Field[] = []
  for (const [key, value] of Object.entries(fields)) {
    let basicType: BasicFieldType | undefined
    let coinType: CoinID | undefined
    let structType: EventLogConfig_StructFieldType | undefined

    if (typeof value === 'number') {
      basicType = value
    } else {
      if (value.address || value.symbol) {
        coinType = value
      } else {
        structType = EventLogConfig_StructFieldType.create({
          fields: fieldsToProtos(value as Fields)
        })
      }
    }
    fieldsProto.push({
      name: key,
      basicType,
      coinType,
      structType
    })
  }
  return fieldsProto
}

export class EventLogger {
  private readonly eventName: string
  config: EventLogConfig

  private constructor(eventName: string, config: EventLogConfig) {
    this.eventName = eventName
    this.config = config
  }

  static register(eventName: string, options?: EventLogOptions): EventLogger {
    checkEventName(eventName)
    let config = EventLogConfig.create()

    if (options?.fields) {
      config = EventLogConfig.create({
        name: eventName,
        fields: fieldsToProtos(options.fields)
      })
    }

    const logger = new EventLogger(eventName, config)
    return EventLoggerState.INSTANCE.getOrSetValue(eventName, logger)
  }

  emit<T>(ctx: BaseContext, event: Event<T>) {
    emit(ctx, this.eventName, event)
  }
}

function checkEventName(eventName: string) {
  const entity = DatabaseSchema.findEntity(eventName)
  if (entity) {
    throw new Error(`Event name ${eventName} is already used in the database schema`)
  }
}

function emit<T>(ctx: BaseContext, eventName: string, event: Event<T>) {
  const { distinctId, severity, message, ...payload } = event

  const data: RichStruct = {
    fields: {
      severity: {
        stringValue: (severity || LogLevel.INFO).toString()
      },
      message: {
        stringValue: message || ''
      },
      distinctEntityId: {
        stringValue: distinctId || ''
      },
      ...normalizeToRichStruct(ctx.baseLabels, payload).fields
    }
  }

  // legacy v2 events, deprecating
  const eventRes: EventTrackingResult = {
    metadata: ctx.getMetaData(eventName, {}),
    severity: severity || LogLevel.INFO,
    message: message || '',
    distinctEntityId: distinctId || '',
    attributes: {
      ...normalizeLabels(ctx.baseLabels), // TODO avoid dup label in metadata
      ...normalizeAttribute(payload)
    },
    runtimeInfo: undefined,
    noMetric: true,
    attributes2: normalizeToRichStruct(ctx.baseLabels, payload)
  }

  const res: TimeseriesResult = {
    metadata: ctx.getMetaData(eventName, {}),
    type: TimeseriesResult_TimeseriesType.EVENT,
    data,
    runtimeInfo: undefined
  }

  processMetrics.process_eventemit_count.add(1)
  ctx.update({ timeseriesResult: [res], events: [eventRes] })
}
