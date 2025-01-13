import { StoreContext } from './context.js'
import { DatabaseSchema } from '../core/index.js'
import { BigDecimal } from '@sentio/bigdecimal'
import { AbstractEntity as Entity, Bytes, Float, ID, Int, Timestamp } from './types.js'
import type { DBRequest, Entity as EntityStruct, RichValue } from '@sentio/protos'
import { DBRequest_DBOperator, DBResponse } from '@sentio/protos'
import { PluginManager } from '@sentio/runtime'
import { Cursor } from './cursor.js'
import { serializeRichValue } from './util.js'

export interface EntityClass<T> {
  new (data: Partial<T>): T
}

export function getEntityName<T>(entity: EntityClass<T> | T | string): string {
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
    const entityName = getEntityName(entity)

    const promise = this.context.sendRequest({
      get: {
        entity: entityName,
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
    const entityName = getEntityName(entity)
    if (id) {
      if (Array.isArray(id)) {
        for (const i of id) {
          request.entity.push(entityName)
          request.id.push(i.toString())
        }
      } else {
        request.entity.push(entityName)
        request.id.push(id)
      }
    } else {
      const entities = Array.isArray(entity) ? entity : [entity]
      for (const e of entities) {
        request.entity.push(entityName)
        request.id.push((e as Entity).id.toString())
      }
    }

    await this.context.sendRequest({
      delete: request
    })
  }

  async upsert<T extends Entity>(entity: T | T[]): Promise<void> {
    const entities = Array.isArray(entity) ? entity : [entity]
    const request = {
      upsert: {
        entity: entities.map((e) => getEntityName(e)),
        // data: entities.map((e) => serialize(e.data)),
        id: entities.map((e) => e.id.toString()),
        entityData: entities.map((e: any) => e._data)
      }
    } as DBRequest
    await this.context.sendRequest(request)
  }

  async *listIterator<T extends Entity, P extends keyof T, O extends Operators<T[P]>>(
    entity: EntityClass<T>,
    filters: ListFilter<T, P, O>[]
  ) {
    let cursor: string | undefined = undefined

    while (true) {
      const response: DBResponse = await this.listRequest(entity, filters || [], cursor)
      for (const data of response.entityList?.entities || []) {
        yield this.newEntity(entity, data)
      }
      if (!response.nextCursor) {
        break
      }
      cursor = response.nextCursor
    }
  }

  async *listBatched<T extends Entity, P extends keyof T, O extends Operators<T[P]>>(
    entity: EntityClass<T>,
    filters: ListFilter<T, P, O>[],
    batchSize = 100
  ) {
    let cursor: string | undefined = undefined

    while (true) {
      const response: DBResponse = await this.listRequest(entity, filters || [], cursor, batchSize)
      const entities = (response.entityList?.entities || []).map((data) => this.newEntity(entity, data))
      yield entities
      if (!response.nextCursor) {
        break
      }
      cursor = response.nextCursor
    }
  }

  private async listRequest<T extends Entity, P extends keyof T, O extends Operators<T[P]>>(
    entity: EntityClass<T>,
    filters: ListFilter<T, P, O>[],
    cursor: string | undefined,
    pageSize?: number
  ): Promise<DBResponse> {
    const response = (await this.context.sendRequest(
      {
        list: {
          entity: getEntityName(entity),
          cursor,
          pageSize,
          filters:
            filters?.map((f) => {
              let values: RichValue[]
              switch (f.op) {
                case 'in':
                case 'not in':
                case 'has all':
                case 'has any':
                  values = Array.isArray(f.value)
                    ? f.value.map((v) => serializeRichValue(v))
                    : [serializeRichValue(f.value)]
                  break
                default:
                  //   = , != should set it to  [[]]
                  values = [serializeRichValue(f.value)]
              }

              return {
                field: f.field as string,
                op: ops[f.op],
                value: {
                  values
                }
              }
            }) || []
        }
      },
      3600
    )) as DBResponse

    return response
  }

  async list<T extends Entity, P extends keyof T, O extends Operators<T[P]>>(
    entity: EntityClass<T>,
    filters?: ListFilter<T, P, O>[],
    cursor?: Cursor
  ) {
    if (cursor) {
      const response = await this.listRequest(entity, filters || [], cursor.cursor, cursor.pageSize)
      cursor.cursor = response.nextCursor
      return response.entityList?.entities.map((data) => this.newEntity(entity, data)) || []
    }
    // TODO Array.fromAsync when upgrade to node 22
    return this.fromAsync(this.listIterator(entity, filters ?? []))
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

type ArrayOperators = 'in' | 'not in' | 'has all' | 'has any'

export type Operators<T> =
  T extends Array<any>
    ? 'in' | 'not in' | '=' | '!=' | 'has all' | 'has any'
    : T extends Int
      ? '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not in'
      : T extends Float
        ? '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not in'
        : T extends Bytes
          ? '=' | '!=' | 'in' | 'not in'
          : T extends ID
            ? '=' | '!=' | 'like' | 'not like' | 'in' | 'not in'
            : T extends string
              ? '=' | '!=' | 'like' | 'not like' | 'in' | 'not in'
              : T extends Timestamp
                ? '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not in'
                : T extends boolean
                  ? '=' | '!=' | 'in' | 'not in'
                  : T extends BigDecimal
                    ? '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not in'
                    : T extends bigint
                      ? '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not in'
                      : '=' | '!=' | 'in' | 'not in'

type CompatibleValue<T, O extends Operators<T>> = O extends ArrayOperators
  ? T extends Array<infer U>
    ? U[]
    : T[]
  :
      | (T extends bigint
          ? bigint
          : T extends Int
            ? number
            : T extends Float
              ? number
              : T extends Bytes
                ? Bytes | string
                : T extends ID
                  ? ID | string
                  : T extends BigDecimal
                    ? BigDecimal | number
                    : T extends Int
                      ? number
                      : T)
      | Nullable<O>

type Nullable<O> = O extends '=' | '!=' ? null : never

export type ListFilter<T extends Entity, P extends keyof T, O extends Operators<T[P]>> = {
  field: P
  op: O
  value: CompatibleValue<T[P], O>
}

export type ArrayFilter<T extends Entity, P extends keyof T, O extends Operators<T[P]>> = [
  P,
  O,
  CompatibleValue<T[P], O>
]

const ops: Record<Operators<any>, DBRequest_DBOperator> = {
  '=': DBRequest_DBOperator.EQ,
  '!=': DBRequest_DBOperator.NE,
  '<': DBRequest_DBOperator.LT,
  '<=': DBRequest_DBOperator.LE,
  '>': DBRequest_DBOperator.GT,
  '>=': DBRequest_DBOperator.GE,
  in: DBRequest_DBOperator.IN,
  'not in': DBRequest_DBOperator.NOT_IN,
  like: DBRequest_DBOperator.LIKE,
  'not like': DBRequest_DBOperator.NOT_LIKE,
  'has all': DBRequest_DBOperator.HAS_ALL,
  'has any': DBRequest_DBOperator.HAS_ANY
}

export function getStore() {
  const dbContext = PluginManager.INSTANCE.dbContextLocalStorage.getStore()
  if (dbContext) {
    return new Store(dbContext)
  }
  return undefined
}
