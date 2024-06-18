import { ID } from './types.js'
import { PluginManager } from '@sentio/runtime'
import { Store } from './store.js'
import { RichStruct } from '@sentio/protos'
import { array_, IDConverter, required_, ValueConverter } from './convert.js'

export interface EntityClass<T extends Entity> {
  new (data: any): T
}

export class Entity {
  get id(): ID {
    return this.get('id', required_(IDConverter))
  }

  protected fromPojo(data: any, converters: Record<string, ValueConverter<any>>) {
    for (const [field, value] of Object.entries(data)) {
      if (converters[field] !== undefined) {
        this.set(field, value, converters[field])
      }
    }
  }

  constructor(private _data: RichStruct = { fields: {} }) {}

  setData(data: RichStruct) {
    this._data = data
  }

  private getIdFromEntity(entity: any): any {
    if (typeof entity === 'object' && entity.id) {
      return entity.id
    }
    return entity
  }

  private getStore() {
    const dbContext = PluginManager.INSTANCE.dbContextLocalStorage.getStore()
    if (dbContext) {
      return new Store(dbContext)
    }
    return undefined
  }

  get<T>(field: string, converter: ValueConverter<T>): T {
    const value = this._data.fields[field]
    return converter.to(value)
  }

  set<T>(field: string, value: T, serializer: ValueConverter<T>): void {
    if (Array.isArray(value)) {
      this._data.fields[field] = {
        listValue: { values: value.map((v) => serializer.from(v)) }
      }
    } else {
      this._data.fields[field] = serializer.from(value)
    }
  }

  protected getObject<T extends Entity>(entity: EntityClass<T> | string, field: string): Promise<T | undefined> {
    const id = this.get(field, IDConverter)
    return id ? (this.getStore()?.get(entity, id) as Promise<T>) : Promise.resolve(undefined)
  }

  protected setObject(field: string, value: any): void {
    this.set(field, this.getIdFromEntity(value), IDConverter)
  }

  protected getFieldObjectArray<T extends Entity>(entity: EntityClass<T>, field: string): Promise<T[]> {
    const ids = this.get(field, array_(IDConverter))
    const promises = ids.map((id: string) => this.getStore()?.get(entity, id))
    return Promise.all(promises) as Promise<T[]>
  }

  toString(): string {
    const entityName = this.constructor.prototype.entityName
    const id = this.id
    return `${entityName}#${id} ${JSON.stringify(this._data)}`
  }

  serialize(): RichStruct {
    return this._data
  }
}
