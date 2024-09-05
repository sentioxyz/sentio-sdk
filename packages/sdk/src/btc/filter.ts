import {
  BTCTransactionFilter,
  BTCTransactionFilter_Condition,
  BTCTransactionFilter_Filter,
  BTCTransactionFilter_Filters,
  BTCTransactionFilter_VinFilter,
  BTCTransactionFilter_VOutFilter
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
  notContains?: string
  length?: number
  lengthGt?: number
  lengthLt?: number
  // array contains any of the values
  hasAny?: Array<Comparable>
  // array contains all the values
  hasAll?: Array<Comparable>
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
    const ret = BTCTransactionFilter_VinFilter.create()
    const filters = []
    const vouts: Filter<VOutFields>[] = []
    const txs: TransactionFilters = []

    for (const f of Array.isArray(inputFilter) ? inputFilter : [inputFilter]) {
      const { preVOut, preTransaction, ...rest } = f
      filters.push(rest)
      if (preVOut) {
        vouts.push(preVOut)
      }
      if (preTransaction) {
        txs.push(preTransaction)
      }
    }
    ret.filters = BTCTransactionFilter_Filters.create({
      filters: convertFilters(filters)
    })

    if (vouts.length > 0) {
      const voutFilters = convertFilters(vouts)
      if (voutFilters && voutFilters.length > 0) {
        ret.preVOut = voutFilters[0]
      }
    }
    if (txs.length > 0) {
      ret.preTransaction = filters2Proto(txs)?.[0]
    }

    return ret
  }

  return undefined
}

function toVOutFilter(outputFilter?: VOutFilter | VOutFilter[]): BTCTransactionFilter_VOutFilter | undefined {
  if (outputFilter) {
    const ret = BTCTransactionFilter_VOutFilter.create()
    const filters = Array.isArray(outputFilter) ? outputFilter : ([outputFilter] as Filter<VOutFields>[])
    ret.filters = BTCTransactionFilter_Filters.create({
      filters: convertFilters(filters)
    })

    return ret
  }
  return undefined
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
  const ret: BTCTransactionFilter_Condition = BTCTransactionFilter_Condition.create()
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
      case 'length':
        ret['lengthEq'] = v
        break
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
      const f: BTCTransactionFilter_Filter = BTCTransactionFilter_Filter.create()
      for (const [key, value] of Object.entries(filter)) {
        f.conditions[key] = toCondition(value as any)
      }
      ret.push(f)
    }
    return ret
  }
  return []
}
