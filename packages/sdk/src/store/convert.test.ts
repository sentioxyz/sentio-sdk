import { describe, it } from 'node:test'
import { BigDecimalConverter, BigIntConverter, StringConverter, ValueConverter } from './convert.js'
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
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(struct.bigintValue).not.null
    const struct2 = BigIntConverter.from(-s)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(struct2.bigintValue?.negative).true
    const s1 = BigIntConverter.to(struct)
    expect(s1).eq(s)
  })

  it('bigDecimal converter', () => {
    testConverter(
      new BigDecimal('123456789012345678901234567890123456789012345678901234567890.123'),
      BigDecimalConverter
    )
    testConverter(new BigDecimal('001234567890e100'), BigDecimalConverter)
  })

  function testConverter<T>(value: T, converter: ValueConverter<T>) {
    const v = converter.from(value)
    const v2 = converter.to(v)
    if (value instanceof BigDecimal) {
      expect(value.eq(v2 as BigDecimal)).equal(true)
    } else {
      expect(v2).equal(v)
    }
  }
})
