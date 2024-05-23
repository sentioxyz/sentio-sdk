import { Entity, EntityClass } from './entity.js'
import { StoreContext } from './context.js'
import { DatabaseSchema } from '../core/index.js'

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
    await this.context.sendRequest({
      delete: {
        entity: entity.prototype.entityName,
        id: Array.isArray(id) ? id : [id]
      }
    })
  }

  async upsert<T extends Entity>(entity: T | T[]): Promise<T> {
    const promise = this.context.sendRequest({
      upsert: {
        entity: entity.constructor.prototype.entityName,
        data: Array.isArray(entity) ? entity.map((e) => e.data) : [entity.data],
        id: Array.isArray(entity) ? entity.map((e) => e.id) : [entity.id]
      }
    })

    if (Array.isArray(entity)) {
      entity.forEach((e) => (e.store = this))
    } else {
      entity.store = this
    }

    return promise as Promise<T>
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

    const e = new (entity as EntityClass<T>)(data)
    e.store = this
    return e
  }
}
