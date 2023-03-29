import { expect } from 'chai'
import { toBigInteger, toMetricValue } from './numberish.js'
import { webcrypto } from 'crypto'
import { performance } from 'perf_hooks'
import { BigInteger, Struct } from '@sentio/protos'
import { BigDecimal } from './big-decimal.js'
import { bytesToBigInt } from '../utils/conversion.js'
import { normalizeAttribute } from './normalization.js'

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

  test('normalize attributes basic', async () => {
    const t1 = { a: 'a', n: 123, n2: 1233333333300000000000n, n3: BigDecimal(10.01), nested: { date: new Date() } }
    const r1 = normalizeAttribute(t1)
    expect(r1.n2).equals('1233333333300000000000:sto_bi')
    expect(r1.n3).equals('10.01:sto_bd')
    expect(typeof r1.nested.date).equals('string')

    const w1 = Struct.encode(Struct.wrap(r1))
    const s2 = Struct.decode(w1.finish())

    const t2 = { f: () => {} }
    const r2 = normalizeAttribute(t2)
    expect(r2.f).equals(undefined)

    const t3 = {
      token0Symbol: null,
      token1Symbol: 't2',
    }
    const r3 = normalizeAttribute(t3)
    const w3 = Struct.encode(Struct.wrap(r3))
    const s3 = Struct.decode(w3.finish())
    console.log(r3)
  })

  test('invalid value', async () => {
    const t1 = { a: BigDecimal(1).dividedBy(0) }
    const r1 = normalizeAttribute(t1)
    expect(r1.a).equals(0)
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
