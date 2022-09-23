import { expect } from 'chai'
import { normalizeLabels, normalizeName } from './meter'

describe('meter tests', () => {
  test('test normalization ', async () => {
    expect(normalizeName('abc') === 'abc')
    expect(normalizeName('a-b-c') === 'a-b-c')
    expect(normalizeName('_a-B-1.') === '_a-B-1.')

    expect(normalizeName('a/b\\c\n') === 'abc')
    expect(normalizeName('abc abc') === 'abc_abc')
    expect(normalizeName('*&~') === '___')

    expect(normalizeName('x'.repeat(200)).length === 100)
  })

  test('test  labels', async () => {
    const labels = { labels: '0' }
    const updated = normalizeLabels(labels)

    expect(updated['labels_']).to.eq('0')
  })
})
