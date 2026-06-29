import { describe, test } from 'node:test'
import assert from 'node:assert'
import { BigDecimal } from './big-decimal.js'
import { normalizeKey, normalizeLabels, normalizeToRichStruct } from './normalization.js'
import { toBigInteger, toBigDecimal } from './numberish.js'

// TODO add test for type conversion
describe('Normalization tests', () => {
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
    assert.deepStrictEqual(r1.fields['n2'].value, {
      case: 'bigintValue',
      value: toBigInteger(1233333333300000000000n)
    })
    const n3 = r1.fields['n3'].value
    assert.strictEqual(n3.case, 'bigdecimalValue')
    assert.deepStrictEqual(n3.case === 'bigdecimalValue' ? n3.value : undefined, toBigDecimal(BigDecimal(10.01)))

    const nested = r1.fields['nested'].value
    assert.strictEqual(nested.case, 'structValue')
    const dateField = nested.case === 'structValue' ? nested.value.fields['date'].value : undefined
    assert.strictEqual(dateField?.case, 'timestampValue')
  })

  test('normalize token to rich struct', async () => {
    const t1 = {
      tokenA: { token: { symbol: 'ETH' }, amount: 100 },
      tokenB: { token: { address: { chain: 'ETH', address: '0x1234' } }, amount: BigDecimal(10.01) },
      nonToken: { token: { symbol: 'ETH' }, amount: 100, extraProp: 'extra' }
    }
    const r1 = normalizeToRichStruct(t1)
    assert.strictEqual(r1.fields['tokenA'].value.case, 'tokenValue')
    assert.strictEqual(r1.fields['tokenB'].value.case, 'tokenValue')
    assert.notStrictEqual(r1.fields['nonToken'].value.case, 'tokenValue')
    assert.strictEqual(r1.fields['nonToken'].value.case, 'structValue')
  })
})
