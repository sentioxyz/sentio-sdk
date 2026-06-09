import { describe, it } from 'node:test'
import { BigDecimalConverter, BigIntConverter, BytesConverter, StringConverter, ValueConverter } from './convert.js'
import { expect } from 'chai'
import { BigDecimal } from '@sentio/bigdecimal'
import { RichStructSchema } from '@sentio/protos'
import { create, toBinary, fromBinary } from '@bufbuild/protobuf'

describe('RichStruct converter tests', () => {
  it('string converter', () => {
    const s = 'test'
    const struct = StringConverter.from(s)
    expect(struct.value.case).eq('stringValue')
    expect(struct.value.case === 'stringValue' ? struct.value.value : undefined).eq(s)
    const s1 = StringConverter.to(struct)
    expect(s1).eq(s)
  })

  it('bigInteger converter', () => {
    const s = 123456789012345678901234567890123456789012345678901234567890n
    const struct = BigIntConverter.from(s)
    expect(struct.value.case).eq('bigintValue')
    const struct2 = BigIntConverter.from(-s)
    expect(struct2.value.case === 'bigintValue' ? struct2.value.value.negative : undefined).true
    const s1 = BigIntConverter.to(struct)
    expect(s1).eq(s)
  })

  it('bigDecimal converter', () => {
    testConverter(new BigDecimal('-1e100'), BigDecimalConverter)
    testConverter(new BigDecimal('-0.006266950425962837'), BigDecimalConverter)
    testConverter(new BigDecimal('1.006266950425962837'), BigDecimalConverter)
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

  it('test entity to RichStruct', () => {
    const testEntity = {
      id: 'test',
      name: 'Test Entity',
      bigInt: 123456789012345678901234567890123456789012345678901234567890n,
      negBigInt: -123456789012345678901234567890123456789012345678901234567890n,
      bigDecimal: new BigDecimal('123456789012345678901234567890123456789012345678901234567890.123'),
      negBigDecimal: new BigDecimal('-123456789012345678901234567890123456789012345678901234567890.123'),
      isActive: true,
      tags: ['tag1', 'tag2'],
      data: new Uint8Array([1, 2, 3, 4, 5])
    }

    const richStruct = create(RichStructSchema, {
      fields: {
        id: StringConverter.from(testEntity.id),
        name: StringConverter.from(testEntity.name),
        bigInt: BigIntConverter.from(testEntity.bigInt),
        negBigInt: BigIntConverter.from(testEntity.negBigInt),
        bigDecimal: BigDecimalConverter.from(testEntity.bigDecimal),
        negBigDecimal: BigDecimalConverter.from(testEntity.negBigDecimal),
        isActive: { value: { case: 'boolValue', value: testEntity.isActive } },
        tags: {
          value: {
            case: 'listValue',
            value: {
              values: testEntity.tags.map((tag) => StringConverter.from(tag))
            }
          }
        },
        data: BytesConverter.from(testEntity.data)
      }
    })
    const bytes = toBinary(RichStructSchema, richStruct)
    const hex = Buffer.from(bytes).toString('hex')
    console.log(hex)
    const decoded = fromBinary(RichStructSchema, bytes)
    // console.log(JSON.stringify(decoded, null, 2))
    expect(decoded).deep.eq(richStruct)

    const decodedIsActive = decoded.fields!['isActive'].value
    const decodedTags = decoded.fields!['tags'].value
    expect(testEntity).deep.eq({
      id: StringConverter.to(decoded.fields!['id']) as string,
      name: StringConverter.to(decoded.fields!['name']) as string,
      bigInt: BigIntConverter.to(decoded.fields!['bigInt']) as bigint,
      negBigInt: BigIntConverter.to(decoded.fields!['negBigInt']) as bigint,
      bigDecimal: BigDecimalConverter.to(decoded.fields!['bigDecimal']) as BigDecimal,
      negBigDecimal: BigDecimalConverter.to(decoded.fields!['negBigDecimal']) as BigDecimal,
      isActive: decodedIsActive.case === 'boolValue' ? decodedIsActive.value : undefined,
      tags:
        decodedTags.case === 'listValue'
          ? decodedTags.value.values.map((v) => StringConverter.to(v) as string)
          : undefined,
      data: BytesConverter.to(decoded.fields!['data']) as Uint8Array
    })
  })
})
