import { expect } from 'chai'
import { toBigInteger, toMetricValue } from './numberish'
import { webcrypto } from 'crypto'
import { performance } from 'perf_hooks'
import { BigInteger } from '@sentio/protos'
import { BigDecimal } from '.'
import { bytesToBigInt } from '../utils/conversion'

// TODO add test for type conversion
describe('Numberish tests', () => {
  const values: bigint[] = [0n, -0n, 3815372408723498172304781320847103784n, 2132n, -18708707n, 123n << 100n]

  test('big integer conversion correctness ', async () => {
    for (const v of values) {
      const b = toBigInteger(v)
      const hex1 = BigIntegerToHex(b)
      const hex2 = v.toString(16)
      expect(hex1).equals(hex2)
    }
  })

  test('random big integer conversion correctness ', async () => {
    for (let i = 0; i < 1000; i++) {
      const random = webcrypto.getRandomValues(new Uint8Array(256))
      const v = bytesToBigInt(random)
      const b = toBigInteger(v)

      expect(bytesToBigInt(b.data)).equals(v)
    }
  })

  test.skip('random big integer performance', async () => {
    jest.setTimeout(100000)
    jest.retryTimes(3)

    let timer1 = 0
    let timer2 = 0
    for (let i = 0; i < 1000; i++) {
      // Use higher value for local debugging
      const random = webcrypto.getRandomValues(new Uint8Array(256))
      const v = bytesToBigInt(random)

      let start = performance.now()
      toBigInteger(v)
      timer1 += performance.now() - start

      start = performance.now()
      v.toString(16)
      timer2 += performance.now() - start
    }

    console.log(timer1, timer2)
    expect(timer1).to.lessThan(timer2 * 3)
  })

  test('metric values', async () => {
    const longDec = '12.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002'
    expect(toMetricValue(new BigDecimal(longDec)).bigDecimal == longDec)

    const complexDec = '-7.350918e-428'
    expect(toMetricValue(new BigDecimal(complexDec)).bigDecimal == complexDec)

    expect(
      BigIntegerToBigInt(toMetricValue(new BigDecimal('100000')).bigInteger || BigInteger.fromPartial({})) === 100000n
    )
  })
})

// Performance very bad
function BigIntegerToHex(b: BigInteger): string {
  let res = bytesToBigInt(b.data).toString(16)
  if (b.negative) {
    res = '-' + res
  }
  return res
}

function BigIntegerToBigInt(b: BigInteger): bigint {
  let res = bytesToBigInt(b.data)
  if (b.negative) {
    res = -res
  }
  return res
}
