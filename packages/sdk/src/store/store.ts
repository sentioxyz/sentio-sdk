import { Entity, EntityClass } from './entity.js'
import { StoreContext } from './context.js'
import { DatabaseSchema } from '../core/index.js'
import { BigDecimal } from '@sentio/bigdecimal'

export class Store {
  constructor(private readonly context: StoreContext) {}

  async get<T extends Entity>(entity: EntityClass<T> | string, id: string): Promise<T | undefined> {
    const promise = this.context.sendRequest({
      get: {
        entity: typeof entity == 'string' ? entity : entity.prototype.entityName,
        id
      }
    })

    const data = (await promise) as any
    if (data?.['id'] != null) {
      return this.newEntity(entity, data)
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
        data: entities.map((e) => serialize(e.data)),
        id: entities.map((e) => e.id)
      }
    })

    await promise
  }

  async list<T extends Entity>(entity: EntityClass<T>, limit?: number, offset?: number): Promise<T[]> {
    const promise = this.context.sendRequest({
      list: {
        entity: entity.constructor.prototype.entityName,
        limit,
        offset
      }
    })

    const list = (await promise) as any[]
    return list.map((data) => {
      return this.newEntity(entity, data)
    })
  }

  private newEntity<T extends Entity>(entity: EntityClass<T> | string, data: any) {
    if (typeof entity == 'string') {
      const en = DatabaseSchema.findEntity(entity)
      if (!en) {
        // it is an interface
        return new Entity(data) as T
      }
      entity = en
    }

    return new (entity as EntityClass<T>)(data)
  }
}

function serialize(data: Record<string, any>) {
  const ret: Record<string, any> = {}
  for (const [k, v] of Object.entries(data)) {
    if (v instanceof Entity) {
      ret[k] = v.id
    } else if (Array.isArray(v) && v[0] instanceof Entity) {
      ret[k] = v.map((e) => e.id)
    } else if (typeof v === 'bigint') {
      ret[k] = v.toString()
    } else if (typeof v === 'object') {
      if (v instanceof Date) {
        ret[k] = v.toISOString()
      } else if (v instanceof Uint8Array) {
        ret[k] = Buffer.from(v).toString('hex')
      } else if (v instanceof BigDecimal) {
        ret[k] = v.toString()
      } else {
        ret[k] = serialize(v)
      }
    } else {
      ret[k] = v
    }
  }
  return ret
}
