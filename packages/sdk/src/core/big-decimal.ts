import { BigDecimal } from '@sentio/bigdecimal'
import { BN } from 'fuels'

export { BigDecimal } from '@sentio/bigdecimal'

declare global {
  interface BigInt {
    asBigDecimal(): BigDecimal
    scaleDown(decimal: number | bigint): BigDecimal
  }
}

declare module 'fuels' {
  interface BN {
    asBigDecimal(): BigDecimal
    scaleDown(decimal: number | bigint): BigDecimal
  }
}

BigInt.prototype.asBigDecimal = function () {
  return new BigDecimal(this.toString())
}

BigInt.prototype.scaleDown = function (decimal: number | bigint) {
  // @ts-ignore this is fine
  return scaleDown(this, decimal)
}

BN.prototype.asBigDecimal = function () {
  return new BigDecimal(this.toString(10))
}

BN.prototype.scaleDown = function (decimal: number | bigint) {
  return scaleDown(BigInt(this.toString(10)), decimal)
}

export function scaleDown(amount: bigint, decimal: number | bigint): BigDecimal {
  const divider = new BigDecimal(10).pow(Number(decimal))
  return amount.asBigDecimal().dividedBy(divider)
}
