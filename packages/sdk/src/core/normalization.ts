import { Labels } from './meter.js'
import { BigDecimal } from './big-decimal.js'

function normalizeName(name: string): string {
  return name.slice(0, 100).replace(/[^_\-a-zA-Z0-9]/g, '_')
}

export function normalizeKey(name: string): string {
  if (name === 'labels') {
    return 'labels_'
  }
  return normalizeName(name)
}

function normalizeValue(name: string): string {
  return name.slice(0, 500)
}

export function normalizeLabels(labels: Labels): Labels {
  const normLabels: Labels = {}
  for (const key in labels) {
    normLabels[normalizeKey(key)] = normalizeValue(labels[key])
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
      return Number(obj)
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
      return obj.toNumber()
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
