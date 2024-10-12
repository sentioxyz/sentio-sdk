import { RichStruct, RichValue } from '@sentio/protos'
import { BigDecimalConverter, BigIntConverter } from './convert.js'
import { getEntityName } from './store.js'

export type ID = string | Uint8Array
export type String = string
export type Int = number
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
}

function toJSValue(value: RichValue): any {
  if (value.nullValue) {
    return null
  }
  if (value.bytesValue) {
    return value.bytesValue
  }
  if (value.stringValue) {
    return value.stringValue
  }
  if (value.bigdecimalValue) {
    return BigDecimalConverter.to(value)
  }
  if (value.bigintValue) {
    return BigIntConverter.to(value)
  }
  if (value.boolValue != undefined) {
    return value.boolValue
  }
  if (value.timestampValue) {
    return value.timestampValue
  }
  if (value.floatValue) {
    return value.floatValue
  }
  if (value.intValue) {
    return value.intValue
  }
  if (value.listValue) {
    return value.listValue.values.map(toJSValue)
  }
  throw new Error('Unknown value type:' + JSON.stringify(value))
}
