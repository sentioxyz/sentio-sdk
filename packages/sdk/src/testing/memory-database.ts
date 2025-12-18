import { StoreContext } from '../store/context.js'
import {
  DBRequest,
  DBRequest_DBFilter,
  DBRequest_DBOperator,
  ProcessStreamResponse,
  RichStruct,
  RichValue,
  RichValueList
} from '@sentio/protos'
import { GraphQLField, GraphQLSchema, parse, StringValueNode } from 'graphql/index.js'
import { DatabaseSchemaState } from '../core/database-schema.js'
import { buildSchema } from '../store/schema.js'
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLOutputType } from 'graphql'
import { PluginManager } from '@sentio/runtime'
import { BigDecimalConverter, BigIntConverter } from '../store/convert.js'
import { BigDecimal } from '@sentio/bigdecimal'
import { Store } from '../store/store.js'

// Internal entity name used by MemoryCache - bypasses schema validation
const MEMORY_CACHE_ITEM_ENTITY = 'MemoryCacheItem'

export class MemoryDatabase {
  db = new Map<string, Record<string, any>>()
  public lastDbRequest: DBRequest | undefined
  _schema: GraphQLSchema

  constructor(readonly dbContext: StoreContext) {}

  get schema() {
    if (!this._schema) {
      if (DatabaseSchemaState.INSTANCE.getValues().length > 0) {
        const source = DatabaseSchemaState.INSTANCE.getValues()[0].source
        const doc = parse(source)
        this._schema = buildSchema(doc)
      }
    }
    return this._schema
  }

  get store() {
    return new Store(this.dbContext)
  }

  start() {
    this.dbContext.subject.subscribe(this.processRequest.bind(this))
  }

  stop() {
    this.dbContext.subject.unsubscribe()
    this.dbContext.subject.complete()
  }

  public hasEntity(entity: string, id: string) {
    const entityDB = this.db.get(entity)
    return entityDB ? entityDB[id] : undefined
  }

  protected upsert(entity: string, id: string, data: any) {
    const entityDB = this.db.get(entity) ?? {}
    entityDB[id] = { entity, fields: data.fields }
    this.db.set(entity, entityDB)
    // Skip interface handling for MemoryCacheItem (no schema required)
    if (entity === MEMORY_CACHE_ITEM_ENTITY || !this.schema) {
      return
    }
    const entityClass = this.schema.getType(entity)
    if (entityClass && entityClass instanceof GraphQLObjectType) {
      for (const intf of entityClass.getInterfaces()) {
        const intfName = intf.name
        const intfDB = this.db.get(intfName) ?? {}
        intfDB[id] = { entity, fields: data.fields }
        this.db.set(intfName, intfDB)
      }
    }
  }

  protected delete(entity: string, id: string) {
    const entityDB = this.db.get(entity)
    if (entityDB) {
      delete entityDB[id]
    }
  }

  protected getById(entity: string, id: string) {
    const entityDB = this.db.get(entity)
    if (entityDB) {
      const result = entityDB[id]
      return this.fillDerivedFromFields(entity, id, result)
    }
    return undefined
  }

  // a quick and dirty way to mimic how derivedFrom fields are filled in the real database
  private fillDerivedFromFields(entity: string, id: string, result: any) {
    // Skip derived fields processing for MemoryCacheItem (no schema required)
    if (entity === MEMORY_CACHE_ITEM_ENTITY || !this.schema) {
      return result
    }
    const entityClass = this.schema.getType(entity)
    if (entityClass && entityClass instanceof GraphQLObjectType) {
      for (const field of Object.values(entityClass.getFields())) {
        const derivedFrom = GetDerivedFrom(field)
        if (derivedFrom) {
          const elemType = getElemType(field.type) as GraphQLObjectType
          const elemClass = this.schema.getType(elemType.name)
          if (elemClass && elemClass instanceof GraphQLObjectType) {
            const derivedField = elemClass.getFields()[derivedFrom]
            if (derivedField) {
              const elemDb = this.db.get(elemType.name)
              if (elemDb) {
                for (const elemID of Object.keys(elemDb)) {
                  const value = elemDb[elemID]
                  const deriveField = value.fields[derivedFrom]
                  let hasRelation = false
                  if (deriveField?.stringValue === id) {
                    hasRelation = true
                  }
                  if (deriveField?.listValue) {
                    hasRelation = deriveField.listValue.values.some((v: any) => v.stringValue === id)
                  }
                  if (hasRelation) {
                    const arr = result.fields[field.name]
                    if (arr) {
                      arr.listValue.values.push({ stringValue: elemID })
                    } else {
                      result.fields[field.name] = { listValue: { values: [{ stringValue: elemID }] } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return result
  }

  private processRequest(request: ProcessStreamResponse) {
    const req = request.dbRequest

    // Check if schema is required for this request
    const requiresSchema = this.requestRequiresSchema(req)
    if (requiresSchema && !this.schema) {
      console.warn('No schema defined, please check if entity schema is defined and loaded')
      return
    }

    this.lastDbRequest = req
    if (req) {
      if (req.upsert) {
        const { entityData, entity } = req.upsert
        entityData.forEach((d, i) => {
          const id = d.fields['id'].stringValue!
          const entityName = entity[i]
          this.upsert(entityName, id, d)
        })

        this.dbContext.result({
          opId: req.opId
        })
      }
      if (req.delete) {
        const { id, entity } = req.delete
        id.forEach((i, idx) => {
          const entityName = entity[idx]
          this.delete(entityName, i)
        })
        this.dbContext.result({
          opId: req.opId
        })
      }

      if (req.get) {
        const { entity, id } = req.get
        const data = this.getById(entity, id)
        this.dbContext.result({
          opId: req.opId,
          // entities: { entities: data ? [data] : [] },
          entityList: {
            entities: data ? [toEntity(data)] : []
          }
        })
      }
      if (req.list) {
        const { entity, cursor, filters } = req.list
        const list = this.listEntities(entity, filters)

        if (cursor) {
          const idx = parseInt(cursor)

          this.dbContext.result({
            opId: req.opId,
            entityList: { entities: list.slice(idx, idx + 1).map((d) => toEntity(d)) },
            nextCursor: idx + 1 < list.length ? `${idx + 1}` : undefined
          })
        } else {
          this.dbContext.result({
            opId: req.opId,
            entityList: { entities: list.length ? [toEntity(list[0])] : [] },
            nextCursor: '1'
          })
        }
      }
    }
  }

  reset() {
    this.db.clear()
  }

  // Check if the request involves only MemoryCacheItem entity, which doesn't require schema
  private requestRequiresSchema(req: DBRequest | undefined): boolean {
    if (!req) return false

    // Check if all entities in the request are MemoryCacheItem
    if (req.upsert) {
      return !req.upsert.entity.every((e) => e === MEMORY_CACHE_ITEM_ENTITY)
    }
    if (req.delete) {
      return !req.delete.entity.every((e) => e === MEMORY_CACHE_ITEM_ENTITY)
    }
    if (req.get) {
      return req.get.entity !== MEMORY_CACHE_ITEM_ENTITY
    }
    if (req.list) {
      return req.list.entity !== MEMORY_CACHE_ITEM_ENTITY
    }
    return false
  }

  private listEntities(entity: string, filters?: DBRequest_DBFilter[]) {
    const entityDB = this.db.get(entity)
    const entities = entityDB
      ? Object.entries(entityDB)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([id, data]) => this.fillDerivedFromFields(entity, id, data))
      : []

    if (!filters || filters.length === 0) {
      return entities
    }

    let results = entities
    // filter combined with AND
    for (const f of filters ?? []) {
      results = results.filter((e) => filter(e, f))
    }
    return results
  }
}

function filter(entity: RichStruct, filter: DBRequest_DBFilter) {
  const value = getValue(entity, filter.field)

  switch (filter.op) {
    case DBRequest_DBOperator.EQ:
      return equal(value, filter.value)
    case DBRequest_DBOperator.NE:
      return !equal(value, filter.value)
    case DBRequest_DBOperator.GT:
      return greaterThan(value, filter.value)
    case DBRequest_DBOperator.LT:
      return lessThan(value, filter.value)
    case DBRequest_DBOperator.GE:
      return greaterThan(value, filter.value) || equal(value, filter.value)
    case DBRequest_DBOperator.LE:
      return lessThan(value, filter.value) || equal(value, filter.value)
    case DBRequest_DBOperator.IN:
      return filter.value?.values.some((v) => equal(value, { values: [v] }))
    case DBRequest_DBOperator.NOT_IN:
      return !filter.value?.values.some((v) => equal(value, { values: [v] }))
    case DBRequest_DBOperator.HAS_ALL:
      return filter.value?.values.every((v) => equal(value, { values: [v] }))
    case DBRequest_DBOperator.HAS_ANY:
      for (const a of filter.value?.values ?? []) {
        if ((value.listValue?.values ?? []).some((v) => equal(a, { values: [v] }))) {
          return true
        }
      }
      return false
    case DBRequest_DBOperator.LIKE:
      return like(value.stringValue, filter.value?.values[0]?.stringValue)
    default:
      return false
  }
}

function getValue(entity: RichStruct, field: string) {
  return entity.fields[field]
}

function equal(field: RichValue, value?: RichValueList): boolean {
  if (field.stringValue !== undefined) {
    return field.stringValue === value?.values[0]?.stringValue
  }
  if (field.listValue) {
    return field.listValue.values.every((v, i) => {
      const vv = value?.values[i]
      return equal(v, vv ? { values: [vv] } : undefined)
    })
  }
  const a = toNumber(field)
  const b = toNumber(value?.values[0])
  if (a !== undefined && b !== undefined) {
    return new BigDecimal(a.toString()).eq(new BigDecimal(b.toString()))
  }

  return false
}

function greaterThan(field: RichValue, value?: RichValueList) {
  const a = toNumber(field)
  const b = toNumber(value?.values[0])
  if (a !== undefined && b !== undefined) {
    const sa = a.toString()
    const sb = b.toString()
    return new BigDecimal(sa).isGreaterThan(new BigDecimal(sb))
  } else {
    return false
  }
}

function lessThan(field: RichValue, value: RichValueList | undefined) {
  const a = toNumber(field)
  const b = toNumber(value?.values[0])
  if (a !== undefined && b !== undefined) {
    const sa = a.toString()
    const sb = b.toString()
    return new BigDecimal(sa).isLessThan(new BigDecimal(sb))
  } else {
    return false
  }
}

function toNumber(value?: RichValue) {
  if (value?.intValue !== undefined) {
    return value.intValue
  }
  if (value?.floatValue !== undefined) {
    return value.floatValue
  }
  if (value?.bigintValue !== undefined) {
    return BigIntConverter.to(value) as bigint
  }
  if (value?.bigdecimalValue !== undefined) {
    return BigDecimalConverter.to(value) as BigDecimal
  }
  return undefined
}

function toEntity(data: any) {
  return {
    entity: data.entity,
    genBlockChain: '',
    genBlockNumber: 0n,
    genBlockTime: new Date(),
    data: { fields: data.fields }
  }
}

function like(field?: string, value?: string) {
  if (field === undefined || value === undefined) {
    return false
  }
  const regex = new RegExp(value.replace(/%/g, '.*').replace(/_/g, '.'))
  return regex.test(field)
}

function GetDerivedFrom(field: GraphQLField<any, any>): string {
  for (const directive of field.astNode?.directives ?? []) {
    if (directive.name.value === 'derivedFrom') {
      const value = directive.arguments?.[0].value as StringValueNode
      return value?.value
    }
  }
  return ''
}

function getElemType(type: GraphQLOutputType) {
  if (type instanceof GraphQLObjectType) {
    return type
  }
  if (type instanceof GraphQLList) {
    return getElemType(type.ofType)
  }
  if (type instanceof GraphQLNonNull) {
    return getElemType(type.ofType)
  }
  return type
}

export function withStoreContext(ctx: StoreContext, fn: () => Promise<void>) {
  return async () => {
    await PluginManager.INSTANCE.dbContextLocalStorage.run(ctx, fn)
  }
}
