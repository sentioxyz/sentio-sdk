import { expect } from 'chai'
import { normalizeName } from './meter'

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
})
