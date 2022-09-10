import { BigNumber } from 'ethers'
import { BigDecimal, MetricValue } from '@sentio/sdk'
import { Numberish } from '../numberish'

export function toBigDecimal(n: BigNumber) {
  return new BigDecimal(n.toString())
}

export function metricValueToNumberish(v: MetricValue): Numberish {
  if (v.doubleValue) {
    return v.doubleValue
  }
  if (v.bigInteger) {
    const bn = BigNumber.from(v.bigInteger.data)
    if (v.bigInteger.negative) {
      return BigNumber.from(0).sub(bn)
    }
    return bn
  }

  if (v.bigDecimal) {
    return new BigDecimal(v.bigDecimal)
  }

  throw Error("MetricValue doesn't contain any of possible value")
}
