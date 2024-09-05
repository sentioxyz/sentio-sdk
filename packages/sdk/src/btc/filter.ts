import {
  BTCTransactionFilter,
  BTCTransactionFilter_Condition,
  BTCTransactionFilter_Filter,
  BTCTransactionFilter_VinFilter
} from '@sentio/protos'
import { serializeRichValue } from '../store/util.js'
import { BigDecimal } from '@sentio/bigdecimal'
import { Transaction, Vin, Vout } from './types.js'

export type TransactionFields = keyof Omit<Transaction, 'vin' | 'vout'>

export type VinFields = keyof Omit<Vin, 'pre_vout' | 'pre_transaction'>

export type VOutFields = keyof Vout

export type Filter<F extends string> = {
  [K in F]?: Condition | Comparable
}

export type Condition = {
  eq?: Comparable
  gt?: Comparable
  gte?: Comparable
  lt?: Comparable
  lte?: Comparable
  ne?: Comparable
  // string has the prefix
  prefix?: string
  // string contains
  contains?: string
  not_contains?: string
  length_eq?: number
  length_gt?: number
  length_lt?: number
  // array contains any of the values
  has_any?: Array<Comparable>
  // array contains all the values
  has_all?: Array<Comparable>
  in?: Array<Comparable>
}

export type Filters<T extends string> = Filter<T> | Filter<T>[]

export type VinFilter = Filter<VinFields> & {
  preVOut?: Filter<VOutFields>
  preTransaction?: {
    filter?: Array<Filter<TransactionFields>>
    outputFilter?: Filters<VOutFields>
    // can't have inputFilter here, we can only support one level of nesting
  }
}

export type VOutFilter = Filter<VOutFields>

export type TransactionFilter = {
  inputFilter?: VinFilter | VinFilter[]
  outputFilter?: VOutFilter | VOutFilter[]
  filter?: Array<Filter<TransactionFields>>
}

export type Comparable = number | BigDecimal | bigint | Date | string | boolean

export type TransactionFilters = TransactionFilter | TransactionFilter[]

function toVinFilter(inputFilter?: VinFilter | VinFilter[]): BTCTransactionFilter_VinFilter | undefined {
  if (inputFilter) {
    const filters = Array.isArray(inputFilter) ? inputFilter : [inputFilter]

    const protoFilters = convertFilters(filters as Filter<VinFields>[])
    const preVOutFilters = filters.map((f) => f.preVOut)
    const preTxFilters = filters.map((f) => f.preTransaction) as TransactionFilters

    return {
      filters: protoFilters
        ? {
            filters: protoFilters
          }
        : undefined,
      preVOut: convertFilters(preVOutFilters as Filter<VOutFields>[])?.[0],
      preTransaction: filters2Proto(preTxFilters)?.[0]
    }
  }

  return undefined
}

function toVOutFilter(outputFilter?: VOutFilter | VOutFilter[]) {
  const filters = Array.isArray(outputFilter) ? outputFilter : ([outputFilter] as Filter<VOutFields>[])
  return convertFilters(filters)?.[0]
}

export function filters2Proto(filter: TransactionFilters): BTCTransactionFilter[] {
  const filters = Array.isArray(filter) ? filter : [filter]
  return filters.map((f) => {
    return {
      filter: convertFilters(f.filter),
      inputFilter: toVinFilter(f.inputFilter),
      outputFilter: toVOutFilter(f.outputFilter)
    } as BTCTransactionFilter
  })
}

function toCondition(value: Condition | Comparable): BTCTransactionFilter_Condition {
  const ret: BTCTransactionFilter_Condition = {}
  if (value instanceof Date) {
    ret.eq = serializeRichValue(value)
  }
  if (typeof value === 'number') {
    ret.eq = serializeRichValue(value)
  }
  if (typeof value === 'string') {
    ret.eq = serializeRichValue(value)
  }
  if (value instanceof BigDecimal) {
    ret.eq = serializeRichValue(value)
  }
  if (typeof value === 'bigint') {
    ret.eq = serializeRichValue(value)
  }
  if (typeof value === 'boolean') {
    ret.eq = serializeRichValue(value)
  }
  if (Array.isArray(value)) {
    ret.in = { values: value.map((v) => serializeRichValue(v)) }
  }

  for (const [k, v] of Object.entries(value)) {
    switch (k) {
      case 'prefix':
      case 'contains':
      case 'notContains':
        ret[k] = v.toString()
        break
      case 'lengthEq':
      case 'lengthGt':
      case 'lengthLt':
        ret[k] = v
        break
      case 'hasAny':
      case 'hasAll':
      case 'in':
        ret[k] = { values: v.map((v: any) => serializeRichValue(v)) }
        break
      case 'eq':
      case 'gt':
      case 'gte':
      case 'lt':
      case 'lte':
      case 'ne':
        ret[k] = serializeRichValue(v)
        break
      default:
        throw new Error('Unknown condition op: ' + k)
    }
  }

  return ret
}

function convertFilters<T extends string>(filters?: Array<Filter<T>>): BTCTransactionFilter_Filter[] | undefined {
  if (filters && filters.length > 0) {
    const ret: BTCTransactionFilter_Filter[] = []
    for (const filter of filters) {
      const f: BTCTransactionFilter_Filter = {
        conditions: {}
      }
      for (const [key, value] of Object.entries(filter)) {
        f.conditions[key] = toCondition(value as any)
      }
      ret.push(f)
    }
    return ret
  }
  return undefined
}
