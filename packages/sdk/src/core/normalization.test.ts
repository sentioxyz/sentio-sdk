import { expect } from 'chai'
import { Struct } from '@sentio/protos'
import { BigDecimal } from './big-decimal.js'
import { normalizeAttribute, normalizeKey, normalizeLabels } from './normalization.js'

// TODO add test for type conversion
describe('Normalization tests', () => {
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

  test('test key ', async () => {
    expect(normalizeKey('abc')).eq('abc')
    expect(normalizeKey('a-b-c')).eq('a_b_c')
    expect(normalizeKey('_a-B-1.')).eq('_a_B_1_')

    expect(normalizeKey('a/b\\c\n')).eq('a_b_c_')
    expect(normalizeKey('abc abc')).eq('abc_abc')
    expect(normalizeKey('*&~')).eq('___')

    expect(normalizeKey('vo total')).eq('vo_total')

    expect(normalizeKey('x'.repeat(200)).length).eq(128)
  })

  test('test  labels', async () => {
    const labels = { labels: '0' }
    const updated = normalizeLabels(labels)

    expect(updated['labels_']).eq('0')
  })
})
