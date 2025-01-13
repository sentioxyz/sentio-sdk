import 'reflect-metadata'
import {
  array_,
  BigDecimalConverter,
  BigIntConverter,
  BooleanConverter,
  BytesConverter,
  FloatConverter,
  IDConverter,
  IntConverter,
  objectId_,
  required_,
  StringConverter,
  TimestampConverter,
  TypeConverters,
  ValueConverter
} from './convert.js'
import { RichStruct } from '@sentio/protos'
import { getStore } from './store.js'

type Constructor = { new (...args: any[]): any }

function handleError(entity: string, key: string, fn: () => any) {
  try {
    return fn()
  } catch (e) {
    throw new Error(`Get property "${key}" from Entity "${entity}" failed: ${e.message}`)
  }
}

export function Entity(entityName: string) {
  return function <T extends Constructor>(BaseClass: T) {
    const meta: Record<string, ValueConverter<any>> = (BaseClass as any).meta || {}
    const target = BaseClass.prototype
    for (const [propertyKey, type] of Object.entries(meta)) {
      if (type.isRelation && type.relationName) {
        const relationName = type.relationName.endsWith('!') ? type.relationName.slice(0, -1) : type.relationName
        const idGetter = function (this: any) {
          return handleError(this.constructor.entityName, propertyKey, () => type!.to(this._data.fields[propertyKey]))
        }
        const idSetter = function (this: any, value: any) {
          this._data.fields[propertyKey] = handleError(this.constructor.entityName, propertyKey, () =>
            type!.from(value)
          )
        }
        const idKey = type.isArray ? propertyKey + 'IDs' : propertyKey + 'ID'

        Reflect.defineProperty(target, idKey, {
          get: idGetter,
          set: idSetter
        })
        Reflect.defineProperty(target, propertyKey, {
          get: function () {
            const ids = idGetter.call(this)
            if (Array.isArray(ids)) {
              return Promise.all(
                ids.map((id) => {
                  return getStore()?.get(relationName, id)
                })
              )
            } else {
              return getStore()?.get(relationName, ids)
            }
          },
          set: function (value) {
            if (value instanceof Promise) {
              value.then((v) => {
                idSetter.call(this, v)
              })
            } else {
              idSetter.call(this, value)
            }
          }
        })
      } else {
        Reflect.defineProperty(target, propertyKey, {
          configurable: true,
          get: function () {
            return handleError(this.constructor.entityName, propertyKey, () => type!.to(this._data.fields[propertyKey]))
          },
          set: function (value) {
            this._data.fields[propertyKey] = handleError(this.constructor.entityName, propertyKey, () =>
              type!.from(value)
            )
          }
        })
      }
    }

    return class extends BaseClass {
      readonly _data: RichStruct = { fields: {} }
      static entityName = entityName
      constructor(...args: any[]) {
        super()
        for (const key of Object.getOwnPropertyNames(this)) {
          if (BaseClass.prototype.hasOwnProperty(key)) {
            delete this[key]
          }
        }
        if (args[0]) {
          Object.assign(this, args[0])
        }
      }
    }
  }
}

export function Column(type: string) {
  return function (target: any, propertyKey: string) {
    let required = false
    if (type.endsWith('!')) {
      required = true
      type = type.slice(0, -1)
    }
    let typeConverter = TypeConverters[type]
    if (!typeConverter) {
      throw new Error(`Unsupported type ${type}`)
    }
    if (required) {
      typeConverter = required_(typeConverter)
    }
    column(typeConverter)(target, propertyKey)
  }
}

export function ListColumn(type: string = '') {
  return function (target: any, propertyKey: string) {
    let required = false
    if (type.endsWith('!')) {
      required = true
      type = type.slice(0, -1)
    }

    let typeConverter = TypeConverters[type]
    if (!typeConverter) {
      // support list of list
      const meta = target.constructor.meta || {}
      const type = meta[propertyKey]
      if (type) {
        typeConverter = type
      } else {
        throw new Error(`Can't find inner type convert`)
      }
    }
    if (required) {
      typeConverter = required_(typeConverter)
    }
    column(array_(typeConverter))(target, propertyKey)
  }
}

export function column(type?: ValueConverter<any>) {
  return function (target: any, propertyKey: string) {
    const reflectType = Reflect.getMetadata('design:type', target, propertyKey)
    if (!type) {
      const typeName = reflectType.name
      type = TypeConverters[typeName]
      if (!type) {
        throw new Error(`Unsupported type ${typeName}`)
      }
    }

    const meta = target.constructor.meta || {}
    meta[propertyKey] = type
    target.constructor.meta = meta
  }
}

export const IDColumn = column(IDConverter)
export const IntColumn = column(IntConverter)
export const FloatColumn = column(FloatConverter)
export const BigDecimalColumn = column(BigDecimalConverter)
export const BigIntColumn = column(BigIntConverter)
export const StringColumn = column(StringConverter)
export const BooleanColumn = column(BooleanConverter)
export const TimestampColumn = column(TimestampConverter)
export const BytesColumn = column(BytesConverter)

export function Required(target: any, propertyKey: string) {
  const meta = target.constructor.meta || {}
  const type = meta[propertyKey]
  if (type) {
    meta[propertyKey] = required_(type)
  }
  target.constructor.meta = meta
}

export function One(entity: string) {
  return function (target: any, propertyKey: string) {
    column(objectId_(entity))(target, propertyKey)
  }
}

export function Many(entity: string) {
  return function (target: any, propertyKey: string) {
    column(array_(objectId_(entity)))(target, propertyKey)
  }
}
