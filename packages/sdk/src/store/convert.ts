import { RichValue, RichValue_NullValue } from '@sentio/protos'
import type { String, Int, Float, ID, Bytes, Timestamp, Boolean } from './types.js'
import { BigDecimal } from '@sentio/bigdecimal'

export interface ValueConverter<T> {
  from: (value: T) => RichValue
  to: (value: RichValue) => T
  required?: boolean
  isArray?: boolean
  isRelation?: boolean
  relationName?: string
}

export const ValueRequiredError = new Error('Value is required but received null or undefined')

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
      if (value == null || value.nullValue) {
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
      return {
        listValue: {
          values: value.map(converter.from)
        }
      }
    },
    to: (value: RichValue) => {
      return value.listValue?.values.map(converter.to) || []
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
        return {
          nullValue: RichValue_NullValue.NULL_VALUE
        }
      }
      return {
        stringValue: values[value]
      }
    },
    to(v: RichValue): T {
      return v.stringValue as T
    }
  }
}

export function objectId_<T>(entityName: string): ValueConverter<T | ID> {
  return {
    from: (value: T | ID) => {
      if (typeof value == 'string') {
        return {
          stringValue: value
        }
      }
      if (value instanceof Uint8Array) {
        return {
          stringValue: `0x${Buffer.from(value).toString('hex')}`
        }
      }

      if (typeof value == 'object') {
        const entity = value as any
        return {
          stringValue: entity.id.toString()
        }
      }
      return {
        nullValue: RichValue_NullValue.NULL_VALUE
      }
    },
    to(v) {
      return v.stringValue as T | ID
    },
    isRelation: true,
    relationName: entityName
  }
}

export const StringConverter: ValueConverter<String | undefined> = {
  from: (value?: String) => {
    if (value == null) {
      return {
        nullValue: RichValue_NullValue.NULL_VALUE
      }
    }
    return {
      stringValue: value
    }
  },
  to(v) {
    return v.stringValue
  }
}

export const IntConverter: ValueConverter<Int | undefined> = {
  from: (value?: Int) => {
    if (value == null) {
      return {
        nullValue: RichValue_NullValue.NULL_VALUE
      }
    }
    return {
      intValue: Math.floor(value)
    }
  },
  to(v) {
    return v.intValue as Int
  }
}

export const FloatConverter: ValueConverter<Float | undefined> = {
  from: (value?: Float) => {
    if (value == null) {
      return {
        nullValue: RichValue_NullValue.NULL_VALUE
      }
    }
    return {
      floatValue: value
    }
  },
  to(v) {
    return v.floatValue
  }
}

export const BooleanConverter: ValueConverter<Boolean | undefined> = {
  from: (value?: Boolean) => {
    if (value == null) {
      return {
        nullValue: RichValue_NullValue.NULL_VALUE
      }
    }
    return {
      boolValue: value
    }
  },
  to(v) {
    return v.boolValue
  }
}

export const TimestampConverter: ValueConverter<Timestamp | undefined> = {
  from: (value: Timestamp | undefined) => {
    if (value == null) {
      return {
        nullValue: RichValue_NullValue.NULL_VALUE
      }
    }
    return {
      timestampValue: value
    }
  },
  to(v) {
    return v.timestampValue
  }
}

export const BytesConverter: ValueConverter<Bytes | undefined> = {
  from: (value?: Bytes) => {
    if (value == null) {
      return {
        nullValue: RichValue_NullValue.NULL_VALUE
      }
    }
    return {
      bytesValue: value
    }
  },
  to(v) {
    return v.bytesValue
  }
}

export const IDConverter: ValueConverter<ID | undefined> = {
  from(value: ID | undefined): RichValue {
    if (typeof value == 'string') {
      return {
        stringValue: value
      }
    }
    if (value instanceof Uint8Array) {
      return {
        stringValue: `0x${Buffer.from(value).toString('hex')}`
      }
    }
    return {
      nullValue: RichValue_NullValue.NULL_VALUE
    }
  },
  to(value: RichValue): ID | undefined {
    if (value.stringValue) {
      return value.stringValue as ID
    }
    if (value.bytesValue) {
      const v = `0x${Buffer.from(value.bytesValue).toString('hex')}`
      return v as ID
    }
    return undefined
  }
}

export const BigDecimalConverter: ValueConverter<BigDecimal | undefined> = {
  from: (value?: BigDecimal): RichValue => {
    if (value == null) {
      return {
        nullValue: RichValue_NullValue.NULL_VALUE
      }
    }
    const s = (value.c || [])
      .map((v, idx) => {
        return idx == 0 ? v.toString() : v.toString().padStart(14, '0')
      })
      .join('')
    const exp = -(s.length - (value.e ?? 0) - 1)

    return {
      bigdecimalValue: {
        value: toBigInteger(BigInt(s) * BigInt(value.s ?? 1)),
        exp: exp
      }
    }
  },
  to(v) {
    const d = v.bigdecimalValue
    if (d) {
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
      return {
        nullValue: RichValue_NullValue.NULL_VALUE
      }
    }
    return {
      bigintValue: toBigInteger(value)
    }
  },
  to(v) {
    if (v.bigintValue) {
      let res = bytesToBigInt(v.bigintValue?.data)
      if (v.bigintValue.negative) {
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

export function toBigInteger(a: bigint) {
  const negative = a < 0
  if (negative) {
    a = -a
  }
  let hex = a.toString(16)
  if (hex.length % 2 === 1) {
    hex = '0' + hex
  }
  const buffer = Buffer.from(hex, 'hex')

  return {
    negative: negative,
    data: new Uint8Array(buffer)
  }
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
  Float: FloatConverter,
  Timestamp: TimestampConverter
}
