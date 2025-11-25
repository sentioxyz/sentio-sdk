import type { RichValue } from '@sentio/protos'
import { toBigInteger, toBigDecimal } from '../core/numberish.js'
import { BigDecimal } from '@sentio/bigdecimal'

export function serializeRichValue(v: any): RichValue {
  if (v == null) {
    return { nullValue: 0 }
  }
  if (typeof v == 'boolean') {
    return { boolValue: v }
  }
  if (typeof v == 'string') {
    return { stringValue: v }
  }

  if (typeof v == 'number') {
    return { floatValue: v }
  }
  if (typeof v == 'bigint') {
    return {
      bigintValue: toBigInteger(v)
    }
  }

  if (BigDecimal.isBigNumber(v)) {
    return serializeBigDecimal(v)
  }

  if (v instanceof Date) {
    return {
      timestampValue: v
    }
  }

  if (v instanceof Uint8Array) {
    return { bytesValue: v }
  }

  if (Array.isArray(v)) {
    return {
      listValue: { values: v.map((v) => serializeRichValue(v)) }
    }
  }
  throw new Error('Unsupported type for serialization: ' + typeof v)
}

function serializeBigDecimal(v: BigDecimal): RichValue {
  return {
    bigdecimalValue: toBigDecimal(v)
  }
}
