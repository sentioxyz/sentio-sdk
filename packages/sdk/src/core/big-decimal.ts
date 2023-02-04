import { BigDecimal } from '@sentio/bigdecimal'

export { BigDecimal } from '@sentio/bigdecimal'

declare global {
  interface BigInt {
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

export function scaleDown(amount: bigint, decimal: number | bigint): BigDecimal {
  const divider = new BigDecimal(10).pow(Number(decimal))
  return amount.asBigDecimal().dividedBy(divider)
}
