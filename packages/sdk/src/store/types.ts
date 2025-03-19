import { RichStruct, RichValue } from '@sentio/protos'
import { BigDecimalConverter, BigIntConverter } from './convert.js'
import { getEntityName, Store } from './store.js'
import { PluginManager } from '@sentio/runtime'

export type ID = string | Uint8Array
export type String = string
export type Int = number
export type Int8 = bigint
export type Float = number
export type Boolean = boolean
export type Timestamp = Date
export type Bytes = Uint8Array
export type BigInt = bigint

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
  if (value.nullValue != null) {
    return null
  }
  if (value.bytesValue != null) {
    return value.bytesValue
  }
  if (value.stringValue != null) {
    return value.stringValue
  }
  if (value.bigdecimalValue != null) {
    return BigDecimalConverter.to(value)
  }
  if (value.bigintValue != null) {
    return BigIntConverter.to(value)
  }
  if (value.boolValue != null) {
    return value.boolValue
  }
  if (value.timestampValue != null) {
    return value.timestampValue
  }
  if (value.floatValue != null) {
    return value.floatValue
  }
  if (value.intValue != null) {
    return value.intValue
  }
  if (value.listValue != null) {
    return value.listValue.values.map(toJSValue)
  }
  if (value.int64Value) {
    return value.int64Value
  }
  throw new Error('Unknown value type:' + JSON.stringify(value))
}
