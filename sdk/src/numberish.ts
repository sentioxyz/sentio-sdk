import { BigNumber } from 'ethers'

export type Numberish = number | BigNumber | bigint //BigNumberish

export function convertNumber(value: Numberish) {
  if (value instanceof BigNumber) {
    return [value.toString(), 0]
  }
  if (Number.isInteger(value)) {
    return [value.toString(), 0]
  }
  return [Number(value), 1]
}
