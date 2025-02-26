import { describe, test } from 'node:test'
import assert from 'node:assert'
import { Struct } from '@sentio/protos'
import { BigDecimal } from './big-decimal.js'
import { normalizeAttribute, normalizeKey, normalizeLabels, normalizeToRichStruct } from './normalization.js'
import { toBigDecimal, toBigInteger } from './numberish.js'

// TODO add test for type conversion
describe('Normalization tests', () => {
  test('normalize attributes basic', async () => {
    const t1 = { a: 'a', n: 123, n2: 1233333333300000000000n, n3: BigDecimal(10.01), nested: { date: new Date() } }
    const r1 = normalizeAttribute(t1)
    assert.deepStrictEqual(r1.n2, '1233333333300000000000:sto_bi')
    assert.deepStrictEqual(r1.n3, '10.01:sto_bd')

    assert.strictEqual(typeof r1.nested.date, 'string')

    const w1 = Struct.encode(Struct.wrap(r1))
    const s2 = Struct.decode(w1.finish())

    const t2 = {
      f: () => {}
    }
    const r2 = normalizeAttribute(t2)
    assert.strictEqual(r2.f, undefined)

    const t3 = {
      token0Symbol: null,
      token1Symbol: 't2'
    }
    const r3 = normalizeAttribute(t3)
    const w3 = Struct.encode(Struct.wrap(r3))
    const s3 = Struct.decode(w3.finish())
    console.log(r3)
  })

  test('test key ', async () => {
    assert.strictEqual(normalizeKey('abc'), 'abc')
    assert.strictEqual(normalizeKey('a-b-c'), 'a_b_c')
    assert.strictEqual(normalizeKey('_a-B-1.'), '_a_B_1_')

    assert.strictEqual(normalizeKey('a/b\\c\n'), 'a_b_c_')
    assert.strictEqual(normalizeKey('abc abc'), 'abc_abc')
    assert.strictEqual(normalizeKey('*&~'), '___')

    assert.strictEqual(normalizeKey('vo total'), 'vo_total')

    assert.strictEqual(normalizeKey('x'.repeat(200)).length, 128)
  })

  test('test  labels', async () => {
    const labels = { labels: '0' }
    const updated = normalizeLabels(labels)

    assert.strictEqual(updated['labels_'], '0')
  })

  test('normalize attributes to rich struct', async () => {
    const t1 = { a: 'a', n: 123, n2: 1233333333300000000000n, n3: BigDecimal(10.01), nested: { date: new Date() } }
    const r1 = normalizeToRichStruct(t1)
    assert.deepStrictEqual(r1.fields['n2'], {
      bigintValue: toBigInteger(1233333333300000000000n)
    })
    assert.deepStrictEqual(r1.fields['n3'].bigdecimalValue, toBigDecimal(BigDecimal(10.01)))

    assert.strictEqual(r1.fields['nested'].structValue?.fields['date'].timestampValue instanceof Date, true)
  })

  test('normalize token to rich struct', async () => {
    const t1 = {
      tokenA: { token: { symbol: 'ETH' }, amount: 100 },
      tokenB: { token: { address: { chain: 'ETH', address: '0x1234' } }, amount: BigDecimal(10.01) },
      nonToken: { token: { symbol: 'ETH' }, amount: 100, extraProp: 'extra' }
    }
    const r1 = normalizeToRichStruct(t1)
    assert.notStrictEqual(r1.fields['tokenA'].tokenValue, undefined)
    assert.notStrictEqual(r1.fields['tokenB'].tokenValue, undefined)
    assert.strictEqual(r1.fields['nonToken'].tokenValue, undefined)
    assert.notStrictEqual(r1.fields['nonToken'].structValue, undefined)
  })
})
