import { expect } from 'chai'
import { toBigInteger, toMetricValue } from './numberish'
import { webcrypto } from 'crypto'
import { BigNumber } from 'ethers'
import { performance } from 'perf_hooks'
import { BigInteger } from './gen/processor/protos/processor'
import { BigDecimal } from './index'

// TODO add test for type conversion
describe('Numberish tests', () => {
  const values: bigint[] = [0n, -0n, 3815372408723498172304781320847103784n, 2132n, -18708707n, 123n << 100n]

  it('big integer conversion correctness ', async () => {
    for (const v of values) {
      const b = toBigInteger(v)
      const hex1 = BigIntegerToHex(b)
      const hex2 = v.toString(16)
      expect(hex1).equals(hex2)
    }
  })

  it('random big integer conversion correctness ', async () => {
    for (let i = 0; i < 1000; i++) {
      const random = webcrypto.getRandomValues(new Uint8Array(256))
      const v = BigNumber.from(random).toBigInt()
      const b = toBigInteger(v)

      expect(BigNumber.from(b.data).eq(v)).to.equals(true)
    }
  })

  it.skip('random big integer performance', async () => {
    jest.setTimeout(100000)
    jest.retryTimes(3)

    let timer1 = 0
    let timer2 = 0
    for (let i = 0; i < 1000; i++) {
      // Use higher value for local debugging
      const random = webcrypto.getRandomValues(new Uint8Array(256))
      const v = BigNumber.from(random).toBigInt()

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

  it('metric value test', async () => {
    const longDec = '12.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002'
    expect(toMetricValue(new BigDecimal(longDec)).bigDecimal == longDec)

    const complexDec = '-7.350918e-428'
    expect(toMetricValue(new BigDecimal(complexDec)).bigDecimal == complexDec)

    expect(BigIntegerToBigInt(toMetricValue(new BigDecimal('100000')).bigInteger!) === 100000n)
  })
})

// Performance very bad
function BigIntegerToHex(b: BigInteger): string {
  let res = BigNumber.from(b.data).toBigInt().toString(16)
  if (b.negative) {
    res = '-' + res
  }
  return res
}

function BigIntegerToBigInt(b: BigInteger): bigint {
  let res = BigNumber.from(b.data).toBigInt()
  if (b.negative) {
    res = -res
  }
  return res
}
