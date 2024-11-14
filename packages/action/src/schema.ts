import { InvalidTypeError } from './types.js'

export interface Type<T> {
  type: string
  default?: T
  validate?: (value: any) => void
  toJSONSchema: () => any
  nullable?: boolean
}

function string(defaultValue?: string): Type<string> {
  return {
    type: 'string',
    default: defaultValue,
    validate: (value: any) => {
      if (typeof value !== 'string') {
        throw new InvalidTypeError(value, 'string')
      }
    },
    toJSONSchema: () => {
      return {
        type: 'string',
        default: defaultValue
      }
    }
  }
}

function number(defaultValue?: number): Type<number> {
  return {
    type: 'number',
    default: defaultValue,
    validate: (value: any) => {
      if (typeof value !== 'number') {
        throw new InvalidTypeError(value, 'number')
      }
    },
    toJSONSchema: () => {
      return {
        type: 'number',
        default: defaultValue
      }
    }
  }
}

function nullable<T>(item: Type<T>): Type<T | null | undefined> {
  return {
    type: `Nuallable<${item.type}>`,
    default: null,
    nullable: true,
    validate: (value: any) => {
      if (value != null) {
        item.validate?.(value)
      }
    },
    toJSONSchema: () => {
      return {
        type: item.type,
        required: false,
        default: item.default
      }
    }
  }
}

function boolean(defaultValue?: boolean): Type<boolean> {
  return {
    type: 'boolean',
    default: defaultValue,
    validate: (value: any) => {
      if (typeof value !== 'boolean') {
        throw new InvalidTypeError(value, 'boolean')
      }
    },
    toJSONSchema: () => {
      return {
        type: 'boolean',
        required: true,
        default: defaultValue
      }
    }
  }
}

interface TypeArray<T> extends Type<T[]> {
  type: 'array'
  elementType: string
}

export function array<T>(item: Type<T>): TypeArray<T> {
  return {
    type: 'array',
    elementType: item.type,
    validate: (value: any) => {
      if (!Array.isArray(value)) {
        throw new InvalidTypeError(value, 'array')
      }
      for (const itemValue of value) {
        item.validate?.(itemValue)
      }
    },
    toJSONSchema: () => {
      return {
        type: 'array',
        items: item.toJSONSchema?.()
      }
    }
  }
}

export type TPropertyKey = string | number
export type TProperties = Record<TPropertyKey, Type<any>>

export interface TSchema<TBody extends Type<any>, TQuery extends Type<any>, TPath extends Type<any>> {
  body?: TBody
  query?: TQuery
  params?: TPath
}

export type TSchemNoBody<TQuery extends Type<any>, TPath extends Type<any>> = TSchema<never, TQuery, TPath>

export function toJsonSchema(schema: TSchema<Type<any>, Type<any>, Type<any>>) {
  return {
    body: schema.body?.toJSONSchema?.(),
    querystring: schema.query?.toJSONSchema?.(),
    params: schema.params?.toJSONSchema?.()
  }
}

type Infer<T> = T extends TypeArray<infer U> ? U[] : T extends Type<infer U> ? U : never

export type TypedActionRequest<TBody, TQuery, TPath> = {
  body?: Infer<TBody>
  query?: Infer<TQuery>
  params?: Infer<TPath>
  headers: Record<string, string[]>
}

export type TypedActionHandler<TBody, TQuery, TPath> = (
  request: TypedActionRequest<TBody, TQuery, TPath>,
  context: any
) => Promise<any>

export function object<T extends TProperties>(props: T): Type<{ [K in keyof T]: Infer<T[K]> }> {
  return {
    type: 'object',
    validate: (value: any) => {
      if (typeof value !== 'object') {
        throw new InvalidTypeError(value, 'object')
      }
      for (const key in props) {
        props[key as TPropertyKey].validate?.(value[key])
      }
    },
    toJSONSchema: () => {
      const properties: Record<string, any> = {}
      for (const key in props) {
        properties[key] = props[key as TPropertyKey].toJSONSchema?.()
      }
      return {
        type: 'object',
        properties,
        required: Object.keys(props).filter((key) => props[key as TPropertyKey].nullable != true)
      }
    }
  }
}

export const T = {
  string,
  number,
  boolean,
  array,
  object,
  nullable,
  optional: nullable
}
