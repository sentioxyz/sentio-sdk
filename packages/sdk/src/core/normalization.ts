import { Labels } from './meter.js'
import { BigDecimal } from './big-decimal.js'
import { BN } from '@fuel-ts/math'

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

function normalizeObject(obj: any, length: number): any {
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
    console.warn('Array type inside log/event payload is not currently supported and will be ignored.')
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
      const normValue = normalizeObject(value, length)
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
