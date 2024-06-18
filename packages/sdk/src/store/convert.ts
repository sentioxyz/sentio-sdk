import { RichStruct, RichValue, RichValue_NullValue } from '@sentio/protos'
import { String, Int, Float, ID, Bytes, DateTime, Boolean } from './types.js'
import { Entity } from './entity.js'
import { BigDecimal } from '@sentio/bigdecimal'

export interface ValueConverter<T> {
  from: (value: T) => RichValue
  to: (value: RichValue) => T
}

export function required_<T>(converter: ValueConverter<T | undefined>): ValueConverter<T> {
  return {
    from: (value: T | undefined) => {
      if (value == null) {
        throw new Error('Value is required but received null or undefined')
      }
      return converter.from(value)
    },
    to: (value: RichValue) => {
      if (value == null || value.nullValue) {
        throw new Error('Value is required but received null')
      }
      return converter.to(value)!
    }
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
    }
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

export function objectId_<T>(): ValueConverter<T | ID> {
  return {
    from: (value: T | ID) => {
      if (typeof value == 'string') {
        return {
          stringValue: value
        }
      }
      if (value instanceof Entity) {
        return {
          stringValue: value.id
        }
      }
      return {
        nullValue: RichValue_NullValue.NULL_VALUE
      }
    },
    to(v) {
      return v.stringValue as T | ID
    }
  }
}

/* eslint-disable */
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
      intValue: value
    }
  },
  to(v) {
    return v.intValue
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

export const DateTimeConverter: ValueConverter<DateTime | undefined> = {
  from: (value: DateTime | undefined) => {
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

export const IDConverter: ValueConverter<ID | undefined> = StringConverter

export const BigDecimalConverter: ValueConverter<BigDecimal | undefined> = {
  from: (value?: BigDecimal): RichValue => {
    if (value == null) {
      return {
        nullValue: RichValue_NullValue.NULL_VALUE
      }
    }

    const exp = value.decimalPlaces() ?? 0
    const s = value.multipliedBy(new BigDecimal(10).pow(exp)).toFixed()

    return {
      bigdecimalValue: {
        value: toBigInteger(BigInt(s)),
        exp: exp
      }
    }
  },
  to(v) {
    const d = v.bigdecimalValue
    if (d) {
      const i = bytesToBigInt(d.value!.data)
      return new BigDecimal(`${i}`).dividedBy(new BigDecimal(10).pow(d.exp)).multipliedBy(d.value?.negative ? -1 : 1)
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

export class StructConverter<T extends Entity> {
  constructor(private converters: Record<string, ValueConverter<any>>) {}

  from(data: any): RichStruct {
    const fields: Record<string, RichValue> = {}
    for (const [field, value] of Object.entries(data)) {
      if (this.converters[field] !== undefined) {
        fields[field] = this.converters[field].from(value)
      }
    }
    return { fields }
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
