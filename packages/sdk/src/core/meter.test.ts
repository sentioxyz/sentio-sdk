import { expect } from 'chai'
import { normalizeLabels, normalizeName } from './meter'

describe('meter tests', () => {
  test('test normalization ', async () => {
    expect(normalizeName('abc')).eq('abc')
    expect(normalizeName('a-b-c')).eq('a-b-c')
    expect(normalizeName('_a-B-1.')).eq('_a-B-1_')

    expect(normalizeName('a/b\\c\n')).eq('a_b_c_')
    expect(normalizeName('abc abc')).eq('abc_abc')
    expect(normalizeName('*&~')).eq('___')

    expect(normalizeName('vo total')).eq('vo_total')

    expect(normalizeName('x'.repeat(200)).length).eq(100)
  })

  test('test  labels', async () => {
    const labels = { labels: '0' }
    const updated = normalizeLabels(labels)

    expect(updated['labels_']).eq('0')
  })
})
