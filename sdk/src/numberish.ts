import { BigNumber } from 'ethers'
import { BigInteger, MetricValue } from './gen/processor/protos/processor'
import { DeepPartial } from './gen/builtin'

export type Numberish = number | BigNumber | bigint //BigNumberish

export function convertNumber(value: Numberish): MetricValue {
  if (value instanceof BigNumber) {
    return MetricValue.fromPartial({
      bigInteger: toBigInteger(value.toBigInt()),
    })
  }
  if (typeof value === 'bigint' || Number.isInteger(value)) {
    return MetricValue.fromPartial({
      bigInteger: toBigInteger(value),
    })
  }
  // TODO handle BN type better
  // if (BN.isBN(value)) {
  //   return MetricValue.fromPartial({
  //     bigInt: value.toString()
  //   })
  // }

  return MetricValue.fromPartial({
    doubleValue: Number(value),
  })
}

export function toBigInteger(a: bigint | number): BigInteger {
  const negative = a < 0

  if (negative) {
    a = -a
  }

  // Following code is actually very slow
  // while (a > 0) {
  //   const d = a & 0xffn
  //   a >>= 8n
  //   value.push(Number(d))
  // }
  //
  // return {
  //   negative, value: new Uint8Array(value.reverse()),
  // }
  let hex = a.toString(16)
  if (hex.length % 2 === 1) {
    hex = '0' + hex
  }
  const buffer = Buffer.from(hex, 'hex')

  return {
    negative: negative,
    data: new Uint8Array(buffer),
  }
}

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
  if (v.bigInt !== undefined) {
    return BigNumber.from(v.bigInt)
  }
  return undefined
}
