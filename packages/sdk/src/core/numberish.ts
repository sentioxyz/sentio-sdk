import {
  type BigDecimalRichValue,
  BigDecimalRichValueSchema,
  type BigInteger,
  BigIntegerSchema,
  type MetricValue,
  MetricValueSchema,
  type RichStruct,
  RichStructSchema,
  RichValueSchema,
  RichValue_NullValue
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { BigDecimal } from './big-decimal.js'

export type Numberish = number | bigint | BigDecimal | string

export function toMetricValue(value: Numberish): MetricValue {
  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      throw new Error('Cannot record NaN value')
    }
    if (!Number.isFinite(value)) {
      throw new Error('Cannot record infinite value')
    }
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      return create(MetricValueSchema, {
        value: { case: 'bigInteger', value: toBigInteger(value) }
      })
    }

    return create(MetricValueSchema, {
      value: { case: 'doubleValue', value: Number(value) }
    })
  }
  if (typeof value === 'bigint') {
    return create(MetricValueSchema, {
      value: { case: 'bigInteger', value: toBigInteger(value) }
    })
  }
  if (typeof value === 'string') {
    return create(MetricValueSchema, {
      value: { case: 'bigDecimal', value: value }
    })
  }
  // if (value instanceof BigDecimal) {
  // Carefully consider the use case here
  if (value.isInteger()) {
    return create(MetricValueSchema, {
      value: { case: 'bigInteger', value: bigDecimalToBigInteger(value) }
    })
  } else {
    if (value.isNaN()) {
      throw new Error('Cannot record NaN value')
    }
    if (!value.isFinite()) {
      // NaN also not finite
      throw new Error('Cannot record infinite value')
    }
    return create(MetricValueSchema, {
      value: { case: 'bigDecimal', value: value.toString() } // e.g. -7.350918e-428
    })
  }
  // }
}

function bigDecimalToBigInteger(a: BigDecimal): BigInteger {
  const negative = a.isNegative()
  if (negative) {
    a = a.abs()
  }
  return hexToBigInteger(a.toString(16), negative)
}

function intToBigInteger(a: bigint | number): BigInteger {
  const negative = a < 0
  if (negative) {
    a = -a
  }
  return hexToBigInteger(a.toString(16), negative)
}

export function toBigInteger(a: Numberish): BigInteger {
  if (typeof a === 'number') {
    return intToBigInteger(a)
  }
  if (typeof a === 'bigint') {
    return intToBigInteger(a)
  }
  if (typeof a === 'string') {
    return intToBigInteger(BigInt(a))
  }
  if (a instanceof BigDecimal) {
    return bigDecimalToBigInteger(a)
  }
  return intToBigInteger(a)

  // Following code is actually very slow
  // while (a > 0) {
  //   const d = a & 0xffn
  //   a >>= 8n
  //   value.push(Number(d))
  // }
  //
  // return {
  //   negative, value: new Uint8Array(value.reverse()),
  // }
}

function hexToBigInteger(hex: string, negative: boolean): BigInteger {
  if (hex.length % 2 === 1) {
    hex = '0' + hex
  }
  const buffer = Buffer.from(hex, 'hex')

  return create(BigIntegerSchema, {
    negative: negative,
    data: new Uint8Array(buffer)
  })
}

export function toBigDecimal(value: BigDecimal): BigDecimalRichValue {
  const s = (value.c || [])
    .map((v, idx) => {
      return idx == 0 ? v.toString() : v.toString().padStart(14, '0')
    })
    .join('')
  const exp = -(s.length - (value.e ?? 0) - 1)

  return create(BigDecimalRichValueSchema, {
    value: toBigInteger(BigInt(s) * BigInt(value.s ?? 1)),
    exp: exp
  })
}

export function toTimeSeriesData(value: Numberish, labels: Record<string, string>, neg: boolean) {
  const mv = toMetricValue(value)
  const data: RichStruct = create(RichStructSchema, {
    fields: {
      value: {}
    }
  })

  for (const key in labels) {
    if (labels[key] == null) {
      data.fields[key] = create(RichValueSchema, {
        value: { case: 'nullValue', value: RichValue_NullValue.NULL_VALUE }
      })
    } else {
      data.fields[key] = create(RichValueSchema, { value: { case: 'stringValue', value: labels[key] } })
    }
  }

  if (mv.value.case === 'bigInteger') {
    const bigInteger = mv.value.value
    bigInteger.negative = neg ? !bigInteger.negative : bigInteger.negative
    data.fields.value.value = { case: 'bigintValue', value: bigInteger }
  } else if (mv.value.case === 'bigDecimal') {
    let v = new BigDecimal(mv.value.value)
    if (neg) {
      v = v.negated()
    }
    data.fields.value.value = { case: 'bigdecimalValue', value: toBigDecimal(v) }
  } else if (mv.value.case === 'doubleValue') {
    const doubleValue = mv.value.value
    data.fields.value.value = { case: 'floatValue', value: neg ? -doubleValue : doubleValue }
  } else {
    data.fields.value.value = { case: 'nullValue', value: RichValue_NullValue.NULL_VALUE }
  }
  return data
}
