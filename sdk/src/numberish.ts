import { BigNumber } from 'ethers'
import { BigInteger, MetricValue } from './gen/processor/protos/processor'
import { DeepPartial } from './gen/builtin'
import { BigDecimal } from '.'
import { BN } from '@project-serum/anchor'

export type Numberish = number | BigNumber | bigint | BigDecimal //BigNumberish

export function toMetricValue(value: Numberish): MetricValue {
  if (value instanceof BigNumber) {
    return MetricValue.fromPartial({
      bigInteger: toBigInteger(value.toBigInt()),
    })
  }
  if (value instanceof BigDecimal) {
    // Carefully consider the use case here
    if (value.isInteger()) {
      return MetricValue.fromPartial({
        bigInteger: bigDecimalToBigInteger(value),
      })
    } else {
      return MetricValue.fromPartial({
        bigDecimal: value.toString(), // e.g. -7.350918e-428
      })
    }
  }
  if (BN.isBN(value)) {
    return MetricValue.fromPartial({
      bigInteger: bnToBigInteger(value),
    })
  }
  if (typeof value === 'bigint' || Number.isInteger(value)) {
    return MetricValue.fromPartial({
      bigInteger: toBigInteger(value),
    })
  }

  return MetricValue.fromPartial({
    doubleValue: Number(value),
  })
}
function bigDecimalToBigInteger(a: BigDecimal): BigInteger {
  const negative = a.isNegative()
  if (negative) {
    a = a.abs()
  }
  return hexToBigInteger(a.toString(16), negative)
}

function bnToBigInteger(a: BN): BigInteger {
  const negative = a.isNeg()
  if (negative) {
    a = a.abs()
  }
  return hexToBigInteger(a.toString(16), negative)
}

function intToBigInteger(a: bigint | number): BigInteger {
  const negative = a < 0
  if (negative) {
    a = -a
  }
  return hexToBigInteger(a.toString(16), negative)
}

export function toBigInteger(a: Numberish): BigInteger {
  if (a instanceof BigDecimal) {
    return bigDecimalToBigInteger(a)
  }
  if (a instanceof BN) {
    return bnToBigInteger(a)
  }
  if (a instanceof BigNumber) {
    return intToBigInteger(a.toBigInt())
  }
  return intToBigInteger(a)

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
}

function hexToBigInteger(hex: string, negative: boolean): BigInteger {
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
  if (v.bigDecimal !== undefined) {
    return new BigDecimal(v.bigDecimal)
  }
  return undefined
}
