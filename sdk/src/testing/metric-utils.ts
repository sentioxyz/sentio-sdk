import { DeepPartial } from '../gen/builtin'
import { BigDecimal, MetricValue, ProcessResult } from '@sentio/sdk'
import { Numberish } from '../core'
import { BigNumber } from 'ethers'

export function MetricValueToNumber(v: DeepPartial<MetricValue> | undefined): Numberish | undefined {
  if (v === undefined) {
    return undefined
  }

  if (v.doubleValue !== undefined) {
    return v.doubleValue
  }
  if (v.bigInteger !== undefined) {
    let intValue = BigNumber.from(v.bigInteger.data).toBigInt()
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
    if (counter.metadata?.descriptor?.name === name) {
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
    if (gauge.metadata?.descriptor?.name === name) {
      return MetricValueToNumber(gauge.metricValue)
    }
  }
  return undefined
}
