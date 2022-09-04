import { DeepPartial } from '../gen/builtin'
import { BigDecimal, MetricValue, O11yResult } from '@sentio/sdk'
import { Numberish } from '../numberish'
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

export function firstCounterValue(result: O11yResult | undefined, name: string): Numberish | undefined {
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

export function firstGaugeValue(result: O11yResult | undefined, name: string): Numberish | undefined {
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
