import { type RichStruct, type RichValue, timestampDate } from '@sentio/protos'
import { BigDecimalConverter, BigIntConverter } from './convert.js'
import { getEntityName, Store } from './store.js'
import { PluginManager } from '@sentio/runtime'
import { BigDecimal } from '@sentio/bigdecimal'

export type ID = string | Uint8Array | Int8
export type String = string
export type Int = number
export type Int8 = bigint
export type Float = number
export type Boolean = boolean
export type Timestamp = Date
export type Bytes = Uint8Array
export type BigInt = bigint

export type ValueType = String | Int | Int8 | Float | Boolean | Timestamp | Bytes | BigInt | BigDecimal | null

export abstract class UpdateOp<T> {}

export class AddOp<T> extends UpdateOp<T> {
  constructor(readonly value: T) {
    super()
  }
}

export class MultiplyOp<T> extends UpdateOp<T> {
  constructor(readonly value: T) {
    super()
  }
}

/**
 * Computes the new value of a field from the previous version of the entity, see {@link expr}.
 */
export class ExpressionOp<T> extends UpdateOp<T> {
  constructor(readonly expression: string) {
    super()
  }
}

export type UpdateValues<T> = {
  [K in keyof T]?: T[K] | UpdateOp<T[K]>
} & { id: ID }

export function add<K extends ValueType>(value: K): UpdateOp<K> {
  return new AddOp<K>(value)
}

export function multiply<K extends ValueType>(value: K): UpdateOp<K> {
  return new MultiplyOp<K>(value)
}

/**
 * Set a field to the result of an expression evaluated by the server against the previous version
 * of the entity. Unlike {@link add} and {@link multiply} the expression may reference other fields
 * of the same entity (by their schema field names), compare values and branch:
 *
 * ```ts
 * await Account.update({
 *   id,
 *   balance: expr('coalesce(balance, 0) + pending'),
 *   status: expr("if(gt(balance, 0), 'active', 'idle')"),
 *   updates: expr('if(exist(), updates + 1, 1)')
 * })
 * ```
 *
 * Supported syntax:
 * - arithmetic `+ - * /` with parentheses and number literals (`1`, `-2.5`, `1e18`)
 * - comparison `eq(a, b)`, `ne`, `gt`, `gte`, `lt`, `lte` on numbers or strings
 * - logic `and`, `or`, `not`, literals `true`, `false`, `null`, string literals `'abc'`
 * - `exist()`: whether the entity had a previous version
 * - `isNull(x)`: whether `x` evaluates to null
 * - `coalesce(a, b, ...)`: the first non-null argument
 * - `if(cond, a, b)`
 *
 * Null follows SQL rules: a field reference is null when the entity does not exist yet, arithmetic
 * and comparisons with a null operand are null, `and` / `or` use three-valued logic, and `if`
 * treats a null condition as false. Storing null into a non-null field fails the update, so use
 * `coalesce(field, 0)` for fields that may be written for the first time. Every numeric field type
 * is computed with decimal arithmetic and rounded when the field is an integer type.
 */
export function expr<K extends ValueType>(expression: string): UpdateOp<K> {
  return new ExpressionOp<K>(expression)
}

export abstract class AbstractEntity {
  abstract id: ID
  private readonly _data: RichStruct

  toJSON() {
    const obj: any = {}

    for (const [field, value] of Object.entries(this._data.fields)) {
      obj[field] = toJSValue(value)
    }
    return obj
  }

  toString() {
    const obj = this.toJSON()
    return `${getEntityName(this)} ${JSON.stringify(obj)}`
  }

  get store() {
    const ctx = PluginManager.INSTANCE.dbContextLocalStorage.getStore()
    if (!ctx) {
      throw new Error('Store not found in context')
    }
    return new Store(ctx)
  }
}

function toJSValue(value: RichValue): any {
  switch (value.value.case) {
    case 'nullValue':
      return null
    case 'bytesValue':
      return value.value.value
    case 'stringValue':
      return value.value.value
    case 'bigdecimalValue':
      return BigDecimalConverter.to(value)
    case 'bigintValue':
      return BigIntConverter.to(value)
    case 'boolValue':
      return value.value.value
    case 'timestampValue':
      return timestampDate(value.value.value)
    case 'floatValue':
      return value.value.value
    case 'intValue':
      return value.value.value
    case 'listValue':
      return value.value.value.values.map(toJSValue)
    case 'int64Value':
      return value.value.value
  }
  throw new Error('Unknown value type:' + JSON.stringify(value))
}
