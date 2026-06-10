import { type RichValue, RichValueSchema, RichValue_NullValue, timestampFromDate } from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { toBigInteger, toBigDecimal } from '../core/numberish.js'
import { BigDecimal } from '@sentio/bigdecimal'

export function serializeRichValue(v: any): RichValue {
  if (v == null) {
    return create(RichValueSchema, { value: { case: 'nullValue', value: RichValue_NullValue.NULL_VALUE } })
  }
  if (typeof v == 'boolean') {
    return create(RichValueSchema, { value: { case: 'boolValue', value: v } })
  }
  if (typeof v == 'string') {
    return create(RichValueSchema, { value: { case: 'stringValue', value: v } })
  }

  if (typeof v == 'number') {
    return create(RichValueSchema, { value: { case: 'floatValue', value: v } })
  }
  if (typeof v == 'bigint') {
    return create(RichValueSchema, { value: { case: 'bigintValue', value: toBigInteger(v) } })
  }

  if (BigDecimal.isBigNumber(v)) {
    return serializeBigDecimal(v)
  }

  if (v instanceof Date) {
    return create(RichValueSchema, { value: { case: 'timestampValue', value: timestampFromDate(v) } })
  }

  if (v instanceof Uint8Array) {
    return create(RichValueSchema, { value: { case: 'bytesValue', value: v } })
  }

  if (Array.isArray(v)) {
    return create(RichValueSchema, {
      value: { case: 'listValue', value: { values: v.map((v) => serializeRichValue(v)) } }
    })
  }
  throw new Error('Unsupported type for serialization: ' + typeof v)
}

function serializeBigDecimal(v: BigDecimal): RichValue {
  return create(RichValueSchema, { value: { case: 'bigdecimalValue', value: toBigDecimal(v) } })
}
