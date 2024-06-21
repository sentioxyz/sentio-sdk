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
import { getStore } from './store.js'
import { RichStruct } from '@sentio/protos'

type Constructor = { new (...args: any[]): any }

function handleError(entity: string, key: string, fn: () => any) {
  try {
    return fn()
  } catch (e) {
    throw new Error(`Get property "${key}" from Entity "${entity}" failed: ${e.message}`)
  }
}

export function Entity(name: string) {
  return function <T extends Constructor>(BaseClass: T) {
    return class extends BaseClass {
      static entityName = name
      readonly _data: RichStruct = { fields: {}, entityName: name }

      constructor(...args: any[]) {
        super()
        const meta = (BaseClass as any).meta
        for (const [propertyKey, t] of Object.entries(meta)) {
          const converter = t as ValueConverter<any>
          if (converter.isRelation && converter.relationName) {
            const relationName = converter.relationName
            const idGetter = () => {
              return handleError(name, propertyKey, () => converter.to(this._data.fields[propertyKey]))
            }
            const idSetter = (value: any) => {
              this._data.fields[propertyKey] = handleError(name, propertyKey, () => converter.from(value))
            }
            const idKey = converter.isArray ? propertyKey + 'IDs' : propertyKey + 'ID'

            Object.defineProperty(this, idKey, {
              get: idGetter,
              set: idSetter
            })

            Object.defineProperty(this, propertyKey, {
              get: () => {
                const ids = idGetter()
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
              set: (value) => {
                if (value instanceof Promise) {
                  value.then((v) => {
                    idSetter(v)
                  })
                } else {
                  idSetter(value)
                }
              }
            })
          } else {
            Object.defineProperty(this, propertyKey, {
              get: () => {
                return handleError(name, propertyKey, () => converter.to(this._data.fields[propertyKey]))
              },
              set: (value) => {
                this._data.fields[propertyKey] = handleError(name, propertyKey, () => converter.from(value))
              }
            })
          }
          const initData = args[0]
          if (initData) {
            for (const [key, value] of Object.entries(initData)) {
              if (this.hasOwnProperty(key)) {
                this[key] = value
              }
            }
          }
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
