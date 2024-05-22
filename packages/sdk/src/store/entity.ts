import { Store } from './store.js'
import { ID } from './types.js'

export interface EntityClass<T extends Entity> {
  new (data: any): T
}

export class Entity {
  get id(): ID {
    return this.get('id')
  }

  private _store: Store | undefined
  data: Record<string, any> = {}
  constructor(data: any) {
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        this.data[key] = value.map((v) => this.getIdFromEntity(v))
      } else {
        this.data[key] = this.getIdFromEntity(value)
      }
    })
  }

  private getIdFromEntity(entity: any): any {
    if (entity instanceof Entity) {
      return entity.id
    } else if (typeof entity === 'object' && entity.id) {
      return entity.id
    }
    return entity
  }

  set store(store: Store) {
    this._store = store
  }

  get<T>(field: string): T {
    return this.data[field]
  }

  set<T>(field: string, value: T | T[] | ID | ID[]): void {
    if (Array.isArray(value) && value instanceof Entity) {
      this.data[field] = value.map((v) => (v as Entity).id)
    } else if (value instanceof Entity) {
      this.data[field] = (value as Entity).id
    }
    this.data[field] = value
  }

  protected getFieldObject<T extends Entity>(entity: EntityClass<T> | string, field: string): Promise<T | undefined> {
    const id = this.data[field]
    return id ? (this._store?.get(entity, id) as Promise<T>) : Promise.resolve(undefined)
  }

  protected getFieldObjectArray<T extends Entity>(entity: EntityClass<T>, field: string): Promise<T[]> {
    const ids = this.data[field]
    const promises = ids.map((id: string) => this._store?.get(entity, id))
    return Promise.all(promises) as Promise<T[]>
  }
}
