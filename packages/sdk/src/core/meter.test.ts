import { expect } from 'chai'
import { normalizeLabels, normalizeKey } from './normalization.js'

describe('meter tests', () => {
  test('test normalization ', async () => {
    expect(normalizeKey('abc')).eq('abc')
    expect(normalizeKey('a-b-c')).eq('a-b-c')
    expect(normalizeKey('_a-B-1.')).eq('_a-B-1_')

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
