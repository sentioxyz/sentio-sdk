import { BigDecimal } from '../core/big-decimal.js'
import { Numberish } from '../core/index.js'
import { MetricValue } from '@sentio/protos'

export function toBigDecimal(n: bigint) {
  return new BigDecimal(n.toString())
}

export function bytesToBigInt(bytes: Uint8Array) {
  let intValue = BigInt(0)
  for (let i = 0; i < bytes.length; i++) {
    intValue = intValue * BigInt(256) + BigInt(bytes[i])
  }
  return intValue
}

export function metricValueToNumberish(v: MetricValue): Numberish {
  if (v.doubleValue) {
    return v.doubleValue
  }
  if (v.bigInteger) {
    let intValue = bytesToBigInt(v.bigInteger.data)
    if (v.bigInteger.negative) {
      intValue = -intValue
    }
    return intValue
  }

  if (v.bigDecimal) {
    return new BigDecimal(v.bigDecimal)
  }

  throw Error("MetricValue doesn't contain any of possible value")
}
