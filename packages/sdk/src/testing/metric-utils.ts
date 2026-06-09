import type { MetricValue, ProcessResult } from '@sentio/protos'
import { Numberish, BigDecimal } from '../core/index.js'
import { bytesToBigInt } from '../utils/conversion.js'

export function MetricValueToNumber(v: MetricValue | undefined): Numberish | undefined {
  if (v === undefined) {
    return undefined
  }

  switch (v.value.case) {
    case 'doubleValue':
      return v.value.value
    case 'bigInteger': {
      let intValue = bytesToBigInt(v.value.value.data)
      if (v.value.value.negative) {
        intValue = -intValue
      }
      return intValue
    }
    case 'bigDecimal':
      return new BigDecimal(v.value.value)
    default:
      return undefined
  }
}

export function firstCounterValue(result: ProcessResult | undefined, name: string): Numberish | undefined {
  if (!result) {
    return undefined
  }
  for (const counter of result.counters) {
    if (counter.metadata?.name === name) {
      return MetricValueToNumber(counter.metricValue)
    }
  }
  return undefined
}

export function firstGaugeValue(result: ProcessResult | undefined, name: string): Numberish | undefined {
  if (!result) {
    return undefined
  }
  for (const gauge of result.gauges) {
    if (gauge.metadata?.name === name) {
      return MetricValueToNumber(gauge.metricValue)
    }
  }
  return undefined
}
