import { BigDecimal } from '@sentio/bigdecimal'

export { BigDecimal } from '@sentio/bigdecimal'

declare global {
  interface BigInt {
    asBigDecimal(): BigDecimal
  }
}
BigInt.prototype.asBigDecimal = function () {
  return new BigDecimal(this.toString())
}
