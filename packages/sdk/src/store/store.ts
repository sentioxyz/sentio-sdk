import { StoreContext } from './context.js'
import { DatabaseSchema } from '../core/index.js'
import { BigDecimal } from '@sentio/bigdecimal'
import { Bytes, Float, ID, Int, Timestamp } from './types.js'
import type { Entity as EntityStruct, RichValue } from '@sentio/protos'
import { DBRequest_DBOperator, DBResponse } from '@sentio/protos'
import { toBigInteger } from './convert.js'
import { PluginManager } from '@sentio/runtime'

type Value = ID | string | Int | Float | boolean | Timestamp | Bytes | BigDecimal | bigint

interface Entity {
  id: ID
}

export interface EntityClass<T> {
  new (data: Partial<T>): T
}

function getEntityName<T>(entity: EntityClass<T> | T | string): string {
  if (entity == null) {
    throw new Error("can't figure out entityName from undefined")
  }
  if (typeof entity == 'string') {
    return entity
  }
  if (typeof entity == 'function') {
    return (entity as any).entityName
  }
  if (typeof entity == 'object') {
    return (entity.constructor as any).entityName
  }
  throw new Error(`can't figure out entityName from ${typeof entity}`)
}

export class Store {
  constructor(private readonly context: StoreContext) {}

  async get<T extends Entity>(entity: EntityClass<T> | string, id: ID): Promise<T | undefined> {
    const promise = this.context.sendRequest({
      get: {
        entity: getEntityName(entity),
        id: id.toString()
      }
    })

    const data = (await promise) as DBResponse
    if (data.entityList?.entities[0]) {
      const entityData = data.entityList?.entities[0]
      return this.newEntity(entity, entityData)
    }

    return undefined
  }

  async delete<T extends Entity>(entity: EntityClass<T> | T | T[], id?: string | string[]): Promise<void> {
    const request = {
      entity: [] as string[],
      id: [] as string[]
    }
    if (id) {
      if (Array.isArray(id)) {
        for (const i of id) {
          request.entity.push(getEntityName(entity))
          request.id.push(i.toString())
        }
      } else {
        request.entity.push(getEntityName(entity))
        request.id.push(id)
      }
    } else {
      const entities = Array.isArray(entity) ? entity : [entity]
      for (const e of entities) {
        request.entity.push(getEntityName(entity))
        request.id.push((e as Entity).id.toString())
      }
    }

    await this.context.sendRequest({
      delete: request
    })
  }

  async upsert<T extends Entity>(entity: T | T[]): Promise<void> {
    const entities = Array.isArray(entity) ? entity : [entity]
    const promise = this.context.sendRequest({
      upsert: {
        entity: entities.map((e) => getEntityName(e)),
        // data: entities.map((e) => serialize(e.data)),
        id: entities.map((e) => e.id.toString()),
        entityData: entities.map((e: any) => e._data)
      }
    })

    await promise
  }

  async *listIterator<T extends Entity>(entity: EntityClass<T>, filters?: ListFilter<T>[]) {
    let cursor: string | undefined = undefined

    while (true) {
      const promise = this.context.sendRequest({
        list: {
          entity: getEntityName(entity),
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
      for (const data of response.entityList?.entities || []) {
        yield this.newEntity(entity, data)
      }
      if (!response.nextCursor) {
        break
      }
      cursor = response.nextCursor
    }
  }

  async list<T extends Entity>(entity: EntityClass<T>, filters?: ListFilter<T>[]) {
    // TODO Array.fromAsync when upgrade to node 22
    return this.fromAsync(this.listIterator(entity, filters))
  }

  private async fromAsync<T>(gen: AsyncIterable<T>): Promise<T[]> {
    const out: T[] = []
    for await (const x of gen) {
      out.push(x)
    }
    return out
  }

  private newEntity<T extends Entity>(entity: EntityClass<T> | string, data: EntityStruct) {
    if (typeof entity == 'string') {
      let en = DatabaseSchema.findEntity(entity)
      if (!en) {
        // it is an interface
        en = DatabaseSchema.findEntity(data.entity)
        if (!en) {
          throw new Error(`Entity ${entity} not found`)
        }
      }
      entity = en
    }

    const res = new (entity as EntityClass<T>)({}) as T
    ;(res as any)._data = data.data
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

export function getStore() {
  const dbContext = PluginManager.INSTANCE.dbContextLocalStorage.getStore()
  if (dbContext) {
    return new Store(dbContext)
  }
  return undefined
}
