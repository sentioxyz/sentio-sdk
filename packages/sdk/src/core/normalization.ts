import { Labels } from './meter.js'
import { BigDecimal } from './big-decimal.js'
import { BN } from 'fuels'
import {
  type CoinID,
  CoinIDSchema,
  CoinID_AddressIdentifierSchema,
  type RichStruct,
  RichStructSchema,
  type RichValue,
  RichValueSchema,
  RichValue_NullValue,
  type TokenAmount,
  TokenAmountSchema,
  timestampFromDate
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { toBigInteger, toBigDecimal } from './numberish.js'

export const SENTIO_BIGINT_STRING_SUFFIX = ':sto_bi'
export const SENTIO_BIGDECIMAL_STRING_SUFFIX = ':sto_bd'

function normalizeName(name: string): string {
  return name.slice(0, 128).replace(/[^_a-zA-Z0-9]/g, '_')
}

export function normalizeKey(name: string): string {
  if (name === 'labels') {
    return 'labels_'
  }
  return normalizeName(name)
}

function normalizeValue(name: string): string {
  if (name.length > 1024) {
    console.warn(`${name} is exceed max length for value storage, will be truncate to 1024 characters`)
    return name.slice(0, 1024)
  }
  return name
}

export function normalizeLabels(labels: Labels): Labels {
  if (Object.keys(labels).length === 0) {
    return labels
  }

  const normLabels: Labels = {}
  for (const key in labels) {
    const value = labels[key]
    if (value !== undefined) {
      normLabels[normalizeKey(key)] = normalizeValue(labels[key])
    } else {
      console.warn(`key: ${key} has empty value in attributes`)
    }
  }
  return normLabels
}

function normalizeObject(obj: any, length: number, path?: string): any {
  let ret: any

  const typeString = typeof obj
  switch (typeString) {
    case 'string':
      return obj.slice(0, length)
    case 'bigint':
      return obj.toString() + SENTIO_BIGINT_STRING_SUFFIX
    // return Number(obj)
    case 'number':
      return obj
    case 'function':
      return null
    case 'symbol':
      return null
  }
  if (Array.isArray(obj)) {
    console.warn(
      `Array type inside log/event payload is not currently supported and will be ignored. Path: ${path ?? ''}`
    )
    return null
    // ret = []
    // for (const val of obj) {
    //   ret.push(normalizeObject(val, length))
    // }
  } else if (obj === Object(obj)) {
    if (obj instanceof Date) {
      return obj.toISOString()
    }
    if (obj instanceof BigDecimal) {
      if (obj.isNaN() || !obj.isFinite()) {
        console.error("can't submit NaN or Infinity value, will store as 0")
        return 0
      }
      return obj.toString() + SENTIO_BIGDECIMAL_STRING_SUFFIX
      // return obj.toNumber()
    }
    if (BN.isBN(obj)) {
      return obj.toString(10) + SENTIO_BIGINT_STRING_SUFFIX
    }
    if (obj instanceof Promise) {
      console.error('Cannot submit promise')
      return null
    }
    ret = {}
    for (const [key, value] of Object.entries(obj)) {
      const normValue = normalizeObject(value, length, `${path ?? ''}.${key}`)
      if (normValue != null) {
        ret[key] = normValue
      }
    }
  } else {
    ret = obj
  }
  return ret
}

export function normalizeAttribute(record: Record<string, any>): any {
  return normalizeObject(record, 1000)
}

function normalizeToRichValue(value: any): RichValue {
  if (value == null) {
    return create(RichValueSchema, { value: { case: 'nullValue', value: RichValue_NullValue.NULL_VALUE } })
  }
  switch (typeof value) {
    case 'string':
      return create(RichValueSchema, { value: { case: 'stringValue', value } })
    case 'bigint':
      const v = BigInt(value)
      return create(RichValueSchema, { value: { case: 'bigintValue', value: toBigInteger(v) } })
    case 'number':
      if (isNaN(value) || !isFinite(value)) {
        throw new Error("can't submit NaN or Infinity value")
      }
      return create(RichValueSchema, {
        value: { case: 'bigdecimalValue', value: toBigDecimal(new BigDecimal(value)) }
      })
    case 'function':
      return create(RichValueSchema, { value: { case: 'nullValue', value: RichValue_NullValue.NULL_VALUE } })
    case 'symbol':
      return create(RichValueSchema, { value: { case: 'stringValue', value: String(value) } })
    case 'boolean':
      return create(RichValueSchema, { value: { case: 'boolValue', value } })
    default:
      if (value instanceof Uint8Array) {
        return create(RichValueSchema, { value: { case: 'bytesValue', value } })
      }
      if (value instanceof Date) {
        return create(RichValueSchema, { value: { case: 'timestampValue', value: timestampFromDate(value) } })
      }
      if (value instanceof BigDecimal) {
        return create(RichValueSchema, { value: { case: 'bigdecimalValue', value: toBigDecimal(value) } })
      }
      if (BN.isBN(value)) {
        const value1 = new BigDecimal(value.toString())
        if (value1.isNaN() || !value1.isFinite()) {
          throw new Error("can't submit NaN or Infinity value")
        }
        return create(RichValueSchema, { value: { case: 'bigdecimalValue', value: toBigDecimal(value1) } })
      }
      if (Array.isArray(value)) {
        return create(RichValueSchema, {
          value: {
            case: 'listValue',
            value: {
              values: value.map((v) => normalizeToRichValue(v))
            }
          }
        })
      }
      if (value instanceof Promise) {
        console.error('Cannot submit promise')
        return create(RichValueSchema, { value: { case: 'nullValue', value: RichValue_NullValue.NULL_VALUE } })
      }
      if (typeof value === 'object') {
        const tokenAmount = toTokenAmount(value)
        if (tokenAmount) {
          return create(RichValueSchema, { value: { case: 'tokenValue', value: tokenAmount } })
        }

        return create(RichValueSchema, {
          value: { case: 'structValue', value: normalizeToRichStruct(value) }
        })
      }

      console.warn('Cannot submit unsupported type ' + typeof value)
      return create(RichValueSchema, { value: { case: 'nullValue', value: RichValue_NullValue.NULL_VALUE } })
  }
}

export function normalizeToRichStruct(...objs: any[]): RichStruct {
  const ret: RichStruct = create(RichStructSchema, {
    fields: {}
  })
  for (const obj of objs) {
    for (const [key, value] of Object.entries(obj)) {
      try {
        ret.fields[key] = normalizeToRichValue(value)
      } catch (e) {
        throw new Error(
          "error when converting data for key '" + key + "': " + (e instanceof Error ? e.message : String(e))
        )
      }
    }
  }
  return ret
}

function toTokenAmount(value: any): TokenAmount | undefined {
  const ret = create(TokenAmountSchema)

  for (const key of Object.getOwnPropertyNames(value)) {
    switch (key) {
      case 'token':
        const token = toCoinID(value.token)
        if (!token) {
          return undefined
        }
        ret.token = token
        break
      case 'amount':
        if (value.amount instanceof BigDecimal) {
          ret.amount = toBigDecimal(value)
        } else if (typeof value.amount == 'string' || typeof value.amount == 'number') {
          ret.amount = toBigDecimal(new BigDecimal(value.amount))
        } else {
          return undefined
        }
        break
      case 'specifiedAt':
        if (value.specifiedAt instanceof Date) {
          ret.specifiedAt = timestampFromDate(value.specifiedAt)
        } else {
          return undefined
        }
        break
      default:
        return undefined
    }
  }

  return ret.amount && ret.token ? ret : undefined
}

function toCoinID(coin: any): CoinID | undefined {
  const ret = create(CoinIDSchema)
  if (typeof coin.symbol === 'string') {
    ret.id = { case: 'symbol', value: coin.symbol }
    return ret
  } else if (coin.hasOwnProperty('address')) {
    ret.id = {
      case: 'address',
      value: create(CoinID_AddressIdentifierSchema, {
        address: coin.address.address,
        chain: coin.address.chain
      })
    }
  } else {
    return undefined
  }

  return ret
}
