import { BigNumber } from 'ethers'
import { BigDecimal } from '@sentio/sdk'

export function toBigDecimal(n: BigNumber) {
  return new BigDecimal(n.toString())
}
