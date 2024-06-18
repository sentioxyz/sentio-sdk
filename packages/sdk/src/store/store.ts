import { Entity, EntityClass } from './entity.js'
import { StoreContext } from './context.js'
import { DatabaseSchema } from '../core/index.js'
import { BigDecimal } from '@sentio/bigdecimal'
import { Bytes, DateTime, Float, ID, Int } from './types.js'
import { DBRequest_DBOperator, DBResponse } from '@sentio/protos'
import type { RichStruct, RichValue } from '@sentio/protos'
import { toBigInteger } from './convert.js'

type Value = ID | string | Int | Float | boolean | DateTime | Bytes | BigDecimal | bigint

export class Store {
  constructor(private readonly context: StoreContext) {}

  async get<T extends Entity>(entity: EntityClass<T> | string, id: string): Promise<T | undefined> {
    const promise = this.context.sendRequest({
      get: {
        entity: typeof entity == 'string' ? entity : entity.prototype.entityName,
        id
      }
    })

    const data = (await promise) as DBResponse
    if (data.entities?.entities[0]) {
      const entityData = data.entities.entities[0]
      return this.newEntity(entity, entityData)
    }

    return undefined
  }

  async delete(entity: EntityClass<any>, id: string | string[]): Promise<void> {
    const toBeDeleted = []
    if (Array.isArray(id)) {
      for (const i of id) {
        toBeDeleted.push({ entity: entity.prototype.entityName, id: i })
      }
    } else {
      toBeDeleted.push({ entity: entity.prototype.entityName, id })
    }
    await this.context.sendRequest({
      delete: {
        entity: toBeDeleted.map((e) => e.entity) as string[],
        id: toBeDeleted.map((e) => e.id) as string[]
      }
    })
  }

  async upsert<T extends Entity>(entity: T | T[]): Promise<void> {
    const entities = Array.isArray(entity) ? entity : [entity]
    const promise = this.context.sendRequest({
      upsert: {
        entity: entities.map((e) => e.constructor.prototype.entityName),
        // data: entities.map((e) => serialize(e.data)),
        id: entities.map((e) => e.id),
        entityData: entities.map((e) => e.serialize())
      }
    })

    await promise
  }

  async *list<T extends Entity>(entity: EntityClass<T>, filters?: ListFilter<T>[]) {
    let cursor: string | undefined = undefined

    while (true) {
      const promise = this.context.sendRequest({
        list: {
          entity: entity.prototype.entityName,
          cursor,
          filters:
            filters?.map((f) => ({
              field: f.field as string,
              op: ops[f.op],
              value: { values: Array.isArray(f.value) ? f.value.map((v) => serialize(v)) : [serialize(f.value)] }
            })) || []
        }
      })
      const response = (await promise) as DBResponse
      for (const data of response.entities?.entities || []) {
        yield this.newEntity(entity, data)
      }
      if (!response.nextCursor) {
        break
      }
      cursor = response.nextCursor
    }
  }

  private newEntity<T extends Entity>(entity: EntityClass<T> | string, data: RichStruct) {
    if (typeof entity == 'string') {
      const en = DatabaseSchema.findEntity(entity)
      if (!en) {
        // it is an interface
        return new Entity() as T
      }
      entity = en
    }

    const res = new (entity as EntityClass<T>)({}) as T
    res.setData(data)
    return res
  }
}

export type Operators = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not in'

export interface ListFilter<T extends Entity> {
  field: keyof T
  op: Operators
  value: Value | Value[] | null
}

export interface ListOptions<T extends Entity> {
  cursor: string
}

const ops: Record<Operators, DBRequest_DBOperator> = {
  '=': DBRequest_DBOperator.EQ,
  '!=': DBRequest_DBOperator.NE,
  '<': DBRequest_DBOperator.LT,
  '<=': DBRequest_DBOperator.LE,
  '>': DBRequest_DBOperator.GT,
  '>=': DBRequest_DBOperator.GE,
  in: DBRequest_DBOperator.IN,
  'not in': DBRequest_DBOperator.NOT_IN
}

function serialize(v: any): RichValue {
  if (v == null) {
    return { nullValue: 0 }
  }
  if (typeof v == 'boolean') {
    return { boolValue: v }
  }
  if (typeof v == 'string') {
    return { stringValue: v }
  }

  if (typeof v == 'number') {
    return { floatValue: v }
  }
  if (typeof v == 'bigint') {
    return {
      bigintValue: toBigInteger(v)
    }
  }

  if (v instanceof BigDecimal) {
    return serializeBigDecimal(v)
  }

  if (v instanceof Date) {
    return {
      timestampValue: v
    }
  }

  if (v instanceof Uint8Array) {
    return { bytesValue: v }
  }

  if (Array.isArray(v)) {
    return {
      listValue: { values: v.map((v) => serialize(v)) }
    }
  }
  return {
    nullValue: 0
  }
}

function serializeBigDecimal(v: BigDecimal): RichValue {
  return {
    bigdecimalValue: undefined
  }
}
