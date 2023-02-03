import { BigInteger, MetricValue } from '@sentio/protos'
import { BigDecimal } from './big-decimal.js'
import { BlockTag } from 'ethers/providers'

export type Numberish = number | bigint | BigDecimal | string

export function toBlockTag(a: number | bigint): BlockTag {
  if (typeof a === 'number') {
    return a
  }
  if (a > Number.MAX_SAFE_INTEGER) {
    return '0x' + a.toString(16)
  }
  return Number(a)
}

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
        bigInteger: toBigInteger(value),
      })
    }

    return MetricValue.fromPartial({
      doubleValue: Number(value),
    })
  }
  if (typeof value === 'bigint') {
    return MetricValue.fromPartial({
      bigInteger: toBigInteger(value),
    })
  }
  if (typeof value === 'string') {
    return MetricValue.fromPartial({
      bigDecimal: value,
    })
  }
  // if (value instanceof BigDecimal) {
  // Carefully consider the use case here
  if (value.isInteger()) {
    return MetricValue.fromPartial({
      bigInteger: bigDecimalToBigInteger(value),
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
      bigDecimal: value.toString(), // e.g. -7.350918e-428
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
    data: new Uint8Array(buffer),
  }
}
