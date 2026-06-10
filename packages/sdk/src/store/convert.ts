import { type RichValue, RichValueSchema, RichValue_NullValue, timestampDate, timestampFromDate } from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import type { String, Int, Float, ID, Bytes, Timestamp, Boolean } from './types.js'
import { BigDecimal } from '@sentio/bigdecimal'
import { toBigInteger, toBigDecimal } from '../core/numberish.js'

export interface ValueConverter<T> {
  from: (value: T) => RichValue
  to: (value: RichValue) => T
  required?: boolean
  isArray?: boolean
  isRelation?: boolean
  relationName?: string
}

export const ValueRequiredError = new Error('Value is required but received null or undefined')

function nullRichValue(): RichValue {
  return create(RichValueSchema, { value: { case: 'nullValue', value: RichValue_NullValue.NULL_VALUE } })
}

export function required_<T>(converter: ValueConverter<T | undefined>): ValueConverter<T> {
  const { from, to, ...rest } = converter
  return {
    from: (value: T | undefined) => {
      if (value == null) {
        throw ValueRequiredError
      }
      return from(value)
    },
    to: (value: RichValue) => {
      if (value == null || value.value.case === 'nullValue') {
        throw ValueRequiredError
      }
      return to(value)!
    },
    ...rest,
    required: true
  }
}

export function array_<T>(converter: ValueConverter<T>): ValueConverter<T[]> {
  return {
    from: (value: T[]) => {
      return create(RichValueSchema, {
        value: {
          case: 'listValue',
          value: {
            values: value.map(converter.from)
          }
        }
      })
    },
    to: (value: RichValue) => {
      return value.value.case === 'listValue' ? value.value.value.values.map(converter.to) : []
    },
    isArray: true,
    isRelation: converter.isRelation,
    relationName: converter.relationName
  }
}

export function enumerate_<T extends string | number>(values: Record<T, string>): ValueConverter<T> {
  return {
    from: (value?: T) => {
      if (value == null) {
        return nullRichValue()
      }
      return create(RichValueSchema, {
        value: { case: 'stringValue', value: values[value] }
      })
    },
    to(v: RichValue): T {
      return (v.value.case === 'stringValue' ? v.value.value : undefined) as T
    }
  }
}

export function objectId_<T>(entityName: string): ValueConverter<T | ID> {
  return {
    from: (value: T | ID) => {
      if (typeof value == 'string') {
        return create(RichValueSchema, { value: { case: 'stringValue', value } })
      }
      if (value instanceof Uint8Array) {
        return create(RichValueSchema, {
          value: { case: 'stringValue', value: `0x${Buffer.from(value).toString('hex')}` }
        })
      }

      if (typeof value == 'object') {
        const entity = value as any
        return create(RichValueSchema, {
          value: { case: 'stringValue', value: entity.id.toString() }
        })
      }
      return nullRichValue()
    },
    to(v) {
      return (v.value.case === 'stringValue' ? v.value.value : undefined) as T | ID
    },
    isRelation: true,
    relationName: entityName
  }
}

export const StringConverter: ValueConverter<String | undefined> = {
  from: (value?: String) => {
    if (value == null) {
      return nullRichValue()
    }
    return create(RichValueSchema, { value: { case: 'stringValue', value } })
  },
  to(v) {
    return v.value.case === 'stringValue' ? v.value.value : undefined
  }
}

export const IntConverter: ValueConverter<Int | undefined> = {
  from: (value?: Int) => {
    if (value == null) {
      return nullRichValue()
    }
    return create(RichValueSchema, { value: { case: 'intValue', value: Math.floor(value) } })
  },
  to(v) {
    return (v.value.case === 'intValue' ? v.value.value : undefined) as Int
  }
}

export const Int8Converter: ValueConverter<bigint | undefined> = {
  from: (value?: bigint) => {
    if (value == null) {
      return nullRichValue()
    }
    return create(RichValueSchema, { value: { case: 'int64Value', value: BigInt(value) } })
  },
  to(v) {
    return v.value.case === 'int64Value' ? v.value.value : undefined
  }
}

export const FloatConverter: ValueConverter<Float | undefined> = {
  from: (value?: Float) => {
    if (value == null) {
      return nullRichValue()
    }
    return create(RichValueSchema, { value: { case: 'floatValue', value } })
  },
  to(v) {
    return v.value.case === 'floatValue' ? v.value.value : undefined
  }
}

export const BooleanConverter: ValueConverter<Boolean | undefined> = {
  from: (value?: Boolean) => {
    if (value == null) {
      return nullRichValue()
    }
    return create(RichValueSchema, { value: { case: 'boolValue', value } })
  },
  to(v) {
    return v.value.case === 'boolValue' ? v.value.value : undefined
  }
}

export const TimestampConverter: ValueConverter<Timestamp | undefined> = {
  from: (value: Timestamp | undefined) => {
    if (value == null) {
      return nullRichValue()
    }
    return create(RichValueSchema, { value: { case: 'timestampValue', value: timestampFromDate(value) } })
  },
  to(v) {
    return v.value.case === 'timestampValue' ? timestampDate(v.value.value) : undefined
  }
}

export const BytesConverter: ValueConverter<Bytes | undefined> = {
  from: (value?: Bytes) => {
    if (value == null) {
      return nullRichValue()
    }
    return create(RichValueSchema, { value: { case: 'bytesValue', value } })
  },
  to(v) {
    return v.value.case === 'bytesValue' ? v.value.value : undefined
  }
}

export const IDConverter: ValueConverter<ID | undefined> = {
  from(value: ID | undefined): RichValue {
    if (typeof value == 'string') {
      return create(RichValueSchema, { value: { case: 'stringValue', value } })
    }
    if (value instanceof Uint8Array) {
      return create(RichValueSchema, {
        value: { case: 'stringValue', value: `0x${Buffer.from(value).toString('hex')}` }
      })
    }
    return nullRichValue()
  },
  to(value: RichValue): ID | undefined {
    if (value.value.case === 'stringValue' && value.value.value) {
      return value.value.value as ID
    }
    if (value.value.case === 'bytesValue' && value.value.value) {
      const v = `0x${Buffer.from(value.value.value).toString('hex')}`
      return v as ID
    }
    return undefined
  }
}

export const BigDecimalConverter: ValueConverter<BigDecimal | undefined> = {
  from: (value?: BigDecimal): RichValue => {
    if (value == null) {
      return nullRichValue()
    }
    return create(RichValueSchema, { value: { case: 'bigdecimalValue', value: toBigDecimal(value) } })
  },
  to(v) {
    if (v.value.case === 'bigdecimalValue') {
      const d = v.value.value
      const i = bytesToBigInt(d.value!.data)
      let ret = new BigDecimal(i.toString())
      if (d.exp < 0) {
        ret = ret.dividedBy(new BigDecimal(10).pow(-d.exp))
      } else {
        ret = ret.multipliedBy(new BigDecimal(10).pow(d.exp))
      }
      return ret.multipliedBy(d.value?.negative ? -1 : 1)
    }
    return undefined
  }
}

export const BigIntConverter: ValueConverter<bigint | undefined> = {
  from: (value?: bigint) => {
    if (value == null) {
      return nullRichValue()
    }
    return create(RichValueSchema, { value: { case: 'bigintValue', value: toBigInteger(value) } })
  },
  to(v) {
    if (v.value.case === 'bigintValue') {
      let res = bytesToBigInt(v.value.value.data)
      if (v.value.value.negative) {
        res = -res
      }
      return res
    }
    return undefined
  }
}

export function bytesToBigInt(bytes: Uint8Array) {
  let intValue = BigInt(0)
  for (let i = 0; i < bytes.length; i++) {
    intValue = intValue * BigInt(256) + BigInt(bytes[i])
  }
  return intValue
}

export const TypeConverters: Record<string, ValueConverter<any>> = {
  BigDecimal: BigDecimalConverter,
  BigInt: BigIntConverter,
  String: StringConverter,
  Boolean: BooleanConverter,
  Uint8Array: BytesConverter,
  ID: IDConverter,
  Bytes: BytesConverter,
  Int: IntConverter,
  Int8: Int8Converter,
  Float: FloatConverter,
  Timestamp: TimestampConverter
}
