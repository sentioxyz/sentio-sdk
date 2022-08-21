import { expect } from 'chai'
import { toBigInteger } from './numberish'
import * as crypto from 'crypto'
import { BigNumber } from 'ethers'
import { webcrypto } from 'crypto'
import { performance } from 'perf_hooks'
import { BigInteger } from './gen/processor/protos/processor'

// TODO add test for type conversion
describe('Basic Testing', () => {
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

  it('random big integer performance', async () => {
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
  }).timeout(100000)
})

// Performance very bad
function BigIntegerToHex(b: BigInteger): string {
  let res = BigNumber.from(b.data).toBigInt().toString(16)
  if (b.negative) {
    res = '-' + res
  }
  return res
}
