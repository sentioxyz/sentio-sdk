import { Entity, EntityClass } from './entity.js'
import { StoreContext } from './context.js'

export class Store {
  constructor(private readonly context: StoreContext) {}

  async get<T extends Entity>(entity: EntityClass<T> | string, id: string): Promise<T | undefined> {
    const promise = this.context.sendRequest({
      get: {
        entity: typeof entity == 'string' ? entity : entity.name,
        id
      }
    })

    const data =  await promise as any
    if (data?.["id"] != null) {
      return this.newEntity(entity as EntityClass<T>, data)
    }
    return undefined
  }

  async delete(entity: EntityClass<any>, id: string | string[]): Promise<void> {
    await this.context.sendRequest({
      delete: {
        entity: entity.name,
        id: Array.isArray(id) ? id : [id]
      }
    })
  }

  async upsert<T extends Entity>(entity: T | T[]): Promise<T> {
    const promise = this.context.sendRequest({
      upsert: {
        entity: entity.constructor.name,
        data: Array.isArray(entity) ? entity.map(e=>e.data) : [entity.data]
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
        entity: entity.name,
        limit,
        offset
      }
    })

    const list = await promise as any[]
    return list.map((data) => {
      return this.newEntity(entity, data)
    })
  }

  private newEntity<T extends Entity>(entity: EntityClass<T>, data: any) {
    const e = new (entity as EntityClass<T>)(data)
    e.store = this
    return e
  }
}
