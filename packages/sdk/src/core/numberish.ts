import { BigDecimalRichValue, BigInteger, MetricValue, RichStruct, RichValue_NullValue } from '@sentio/protos'
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
      return MetricValue.fromPartial({
        bigInteger: toBigInteger(value)
      })
    }

    return MetricValue.fromPartial({
      doubleValue: Number(value)
    })
  }
  if (typeof value === 'bigint') {
    return MetricValue.fromPartial({
      bigInteger: toBigInteger(value)
    })
  }
  if (typeof value === 'string') {
    return MetricValue.fromPartial({
      bigDecimal: value
    })
  }
  // if (value instanceof BigDecimal) {
  // Carefully consider the use case here
  if (value.isInteger()) {
    return MetricValue.fromPartial({
      bigInteger: bigDecimalToBigInteger(value)
    })
  } else {
    if (value.isNaN()) {
      throw new Error('Cannot record NaN value')
    }
    if (!value.isFinite()) {
      // NaN also not finite
      throw new Error('Cannot record infinite value')
    }
    return MetricValue.fromPartial({
      bigDecimal: value.toString() // e.g. -7.350918e-428
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

  return {
    negative: negative,
    data: new Uint8Array(buffer)
  }
}

export function toBigDecimal(value: BigDecimal): BigDecimalRichValue {
  const s = (value.c || [])
    .map((v, idx) => {
      return idx == 0 ? v.toString() : v.toString().padStart(14, '0')
    })
    .join('')
  const exp = -(s.length - (value.e ?? 0) - 1)

  return {
    value: toBigInteger(BigInt(s) * BigInt(value.s ?? 1)),
    exp: exp
  }
}

export function toTimeSeriesData(value: Numberish, labels: Record<string, string>, neg: boolean) {
  const mv = toMetricValue(value)
  const data: RichStruct = {
    fields: {
      value: {}
    }
  }

  for (const key in labels) {
    if (labels[key] == null) {
      data.fields[key] = { nullValue: RichValue_NullValue.NULL_VALUE }
    } else {
      data.fields[key] = { stringValue: labels[key] }
    }
  }

  if (mv.bigInteger != null) {
    mv.bigInteger.negative = neg ? !mv.bigInteger.negative : mv.bigInteger.negative
    data.fields.value.bigintValue = mv.bigInteger
  } else if (mv.bigDecimal != null) {
    let v = new BigDecimal(mv.bigDecimal)
    if (neg) {
      v = v.negated()
    }
    data.fields.value.bigdecimalValue = toBigDecimal(v)
  } else if (mv.doubleValue != null) {
    data.fields.value.floatValue = neg ? -mv.doubleValue : mv.doubleValue
  } else {
    data.fields.value.nullValue = RichValue_NullValue.NULL_VALUE
  }
  return data
}
