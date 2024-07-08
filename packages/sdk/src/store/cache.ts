import { ID } from './types.js'
import type { Entity as EntityStruct } from '@sentio/protos'

export interface Entity {
  id: ID
}

export class LocalCache {
  private cache: Map<string, EntityStruct> = new Map()

  getKey(entity: string, id: ID) {
    return `${entity}-${id}`
  }

  has(entity: string, id: ID): boolean {
    return this.cache.has(this.getKey(entity, id))
  }

  get(entity: string, id: ID): EntityStruct | undefined {
    return this.cache.get(this.getKey(entity, id))
  }

  set(entity: EntityStruct) {
    const id = entity.data?.fields['id'].stringValue
    if (id) {
      const key = this.getKey(entity.entity, id)
      let fields = entity.data?.fields || {}
      if (this.cache.has(key)) {
        const existFields = this.cache.get(key)?.data?.fields || {}
        fields = Object.assign(existFields, fields)
      }
      this.cache.set(key, {
        ...entity,
        data: {
          fields
        }
      })
    }
  }

  delete(entityName: string, id: string | undefined) {
    if (id) {
      this.cache.delete(this.getKey(entityName, id))
    }
  }
}
