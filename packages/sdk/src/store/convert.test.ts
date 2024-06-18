import { StringConverter, BigIntConverter, BigDecimalConverter } from './convert.js'
import { expect } from 'chai'
import { BigDecimal } from '@sentio/bigdecimal'

describe('RichStruct converter tests', () => {
  it('string converter', () => {
    const s = 'test'
    const struct = StringConverter.from(s)
    expect(struct.stringValue).eq(s)
    const s1 = StringConverter.to(struct)
    expect(s1).eq(s)
  })

  it('bigInteger converter', () => {
    const s = 123456789012345678901234567890123456789012345678901234567890n
    const struct = BigIntConverter.from(s)
    expect(struct.bigintValue).not.null
    const struct2 = BigIntConverter.from(-s)
    expect(struct2.bigintValue?.negative).true
    const s1 = BigIntConverter.to(struct)
    expect(s1).eq(s)
  })

  it('bigDecimal converter', () => {
    const s = new BigDecimal('123456789012345678901234567890123456789012345678901234567890.123')
    const struct = BigDecimalConverter.from(s)
    expect(struct.bigdecimalValue).not.null
    const s2 = BigDecimalConverter.to(struct)
    expect(s2?.eq(s)).true
  })
})
