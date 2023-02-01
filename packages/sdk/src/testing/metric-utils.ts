import { MetricValue, ProcessResult } from '@sentio/protos'
import { Numberish, BigDecimal } from '../core'
import { bytesToBigInt } from '../utils/conversion'

export function MetricValueToNumber(v: Partial<MetricValue> | undefined): Numberish | undefined {
  if (v === undefined) {
    return undefined
  }

  if (v.doubleValue !== undefined) {
    return v.doubleValue
  }
  if (v.bigInteger !== undefined) {
    let intValue = bytesToBigInt(v.bigInteger.data)
    if (v.bigInteger.negative) {
      intValue = -intValue
    }
    return intValue
  }
  if (v.bigDecimal !== undefined) {
    return new BigDecimal(v.bigDecimal)
  }
  return undefined
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
