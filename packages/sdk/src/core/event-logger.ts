import { BaseContext } from './base-context.js'
import {
  type CoinID,
  CoinIDSchema,
  CoinID_AddressIdentifierSchema,
  type EventLogConfig,
  EventLogConfigSchema,
  EventLogConfig_BasicFieldType,
  type EventLogConfig_Field,
  EventLogConfig_FieldSchema,
  EventLogConfig_StructFieldTypeSchema,
  type EventTrackingResult,
  EventTrackingResultSchema,
  LogLevel,
  type RichStruct,
  RichStructSchema,
  type TimeseriesResult,
  TimeseriesResultSchema,
  TimeseriesResult_TimeseriesType
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
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

// User-facing coin descriptor (plain shape, matching the legacy CoinID surface).
export type CoinFieldType = { symbol: string } | { address: { address: string; chain: string } }

export type FieldType = CoinFieldType | BasicFieldType | Fields

export type Fields = { [key: string]: FieldType }

export interface EventLogOptions {
  fields: Fields
}

function toCoinIDField(value: CoinFieldType): CoinID {
  if ('symbol' in value && value.symbol) {
    return create(CoinIDSchema, { id: { case: 'symbol', value: value.symbol } })
  }
  const address = (value as { address: { address: string; chain: string } }).address
  return create(CoinIDSchema, {
    id: {
      case: 'address',
      value: create(CoinID_AddressIdentifierSchema, {
        address: address.address,
        chain: address.chain
      })
    }
  })
}

export function fieldsToProtos(fields: Fields): EventLogConfig_Field[] {
  const fieldsProto: EventLogConfig_Field[] = []
  for (const [key, value] of Object.entries(fields)) {
    let type: EventLogConfig_Field['type']

    if (typeof value === 'number') {
      type = { case: 'basicType', value }
    } else {
      const coin = value as CoinFieldType
      if (('address' in coin && coin.address) || ('symbol' in coin && coin.symbol)) {
        type = { case: 'coinType', value: toCoinIDField(coin) }
      } else {
        type = {
          case: 'structType',
          value: create(EventLogConfig_StructFieldTypeSchema, {
            fields: fieldsToProtos(value as Fields)
          })
        }
      }
    }
    fieldsProto.push(
      create(EventLogConfig_FieldSchema, {
        name: key,
        type
      })
    )
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
    let config = create(EventLogConfigSchema)

    if (options?.fields) {
      config = create(EventLogConfigSchema, {
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

  const data: RichStruct = create(RichStructSchema, {
    fields: {
      severity: {
        value: { case: 'stringValue', value: (severity || LogLevel.INFO).toString() }
      },
      message: {
        value: { case: 'stringValue', value: message || '' }
      },
      // don't rename to distinctEntityId in new events.
      distinctId: {
        value: { case: 'stringValue', value: distinctId || '' }
      },
      ...normalizeToRichStruct(ctx.baseLabels, payload).fields
    }
  })

  // legacy v2 events, deprecating
  const eventRes: EventTrackingResult = create(EventTrackingResultSchema, {
    metadata: ctx.getMetaData(eventName, {}),
    severity: severity || LogLevel.INFO,
    message: message || '',
    distinctEntityId: distinctId || '',
    attributes: {
      ...normalizeLabels(ctx.baseLabels), // TODO avoid dup label in metadata
      ...normalizeAttribute(payload)
    },
    runtimeInfo: undefined,
    attributes2: normalizeToRichStruct(ctx.baseLabels, payload)
  })

  const res: TimeseriesResult = create(TimeseriesResultSchema, {
    metadata: ctx.getMetaData(eventName, {}),
    type: TimeseriesResult_TimeseriesType.EVENT,
    data,
    runtimeInfo: undefined
  })

  processMetrics.process_eventemit_count.add(1)
  ctx.update({ timeseriesResult: [res], events: [eventRes] })
}
