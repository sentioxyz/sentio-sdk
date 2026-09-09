import { StoreContext } from '../store/context.js'
import {
  type DBRequest,
  type DBRequest_DBFilter,
  DBRequest_DBOperator,
  type DBResponse,
  DBResponseSchema,
  type ProcessStreamResponseV3,
  type RichStruct,
  type RichValue,
  RichValueSchema,
  type RichValueList,
  RichValueListSchema,
  timestampNow
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { GraphQLField, GraphQLSchema, parse, StringValueNode } from 'graphql/index.js'
import { DatabaseSchemaState } from '../core/database-schema.js'
import { buildSchema } from '../store/schema.js'
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLOutputType } from 'graphql'
import { type IStoreContext, PluginManager } from '@sentio/runtime'
import { BigDecimalConverter, BigIntConverter } from '../store/convert.js'
import { BigDecimal } from '@sentio/bigdecimal'
import { Store } from '../store/store.js'
import { Subject } from 'rxjs'

// Internal entity name used by MemoryCache - bypasses schema validation
const MEMORY_CACHE_ITEM_ENTITY = 'MemoryCacheItem'

type MemoryDatabaseContext = IStoreContext & {
  subject: Subject<any>
  result(dbResult: DBResponse, processId?: number): void
}

export class MemoryDatabase {
  db = new Map<string, Record<string, any>>()
  public lastDbRequest: DBRequest | undefined
  _schema!: GraphQLSchema

  constructor(readonly dbContext: MemoryDatabaseContext) {}

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
    // The subject is typed as the `ProcessStreamResponseV3` init-shape, but at runtime it always carries a
    // full response (the store context emits the complete oneof). Treat it as a full message and narrow inside.
    this.dbContext.subject.subscribe((request) => this.processRequest(request as unknown as ProcessStreamResponseV3))
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
                  const deriveField: RichValue | undefined = value.fields[derivedFrom]
                  let hasRelation = false
                  if (deriveField?.value.case === 'stringValue' && deriveField.value.value === id) {
                    hasRelation = true
                  }
                  if (deriveField?.value.case === 'listValue') {
                    hasRelation = deriveField.value.value.values.some(
                      (v) => v.value.case === 'stringValue' && v.value.value === id
                    )
                  }
                  if (hasRelation) {
                    const arr: RichValue | undefined = result.fields[field.name]
                    const elem = create(RichValueSchema, { value: { case: 'stringValue', value: elemID } })
                    if (arr && arr.value.case === 'listValue') {
                      arr.value.value.values.push(elem)
                    } else {
                      result.fields[field.name] = create(RichValueSchema, {
                        value: { case: 'listValue', value: { values: [elem] } }
                      })
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

  private processRequest(request: ProcessStreamResponseV3) {
    const req = request.value.case === 'dbRequest' ? request.value.value : undefined

    // Check if schema is required for this request
    const requiresSchema = this.requestRequiresSchema(req)
    if (requiresSchema && !this.schema) {
      console.warn('No schema defined, please check if entity schema is defined and loaded')
      return
    }

    this.lastDbRequest = req
    if (req) {
      if (req.op.case === 'upsert') {
        const { entityData, entity } = req.op.value
        entityData.forEach((d, i) => {
          const idField = d.fields['id']
          const id = idField?.value.case === 'stringValue' ? idField.value.value : ''
          const entityName = entity[i]
          this.upsert(entityName, id, d)
        })

        this.sendResult(request, create(DBResponseSchema, { opId: req.opId }))
      }
      if (req.op.case === 'delete') {
        const { id, entity } = req.op.value
        id.forEach((i, idx) => {
          const entityName = entity[idx]
          this.delete(entityName, i)
        })
        this.sendResult(request, create(DBResponseSchema, { opId: req.opId }))
      }

      if (req.op.case === 'get') {
        const { entity, id } = req.op.value
        const data = this.getById(entity, id)
        this.sendResult(
          request,
          create(DBResponseSchema, {
            opId: req.opId,
            value: {
              case: 'entityList',
              value: {
                entities: data ? [toEntity(data)] : []
              }
            }
          })
        )
      }
      if (req.op.case === 'list') {
        const { entity, cursor, filters } = req.op.value
        const list = this.listEntities(entity, filters)

        if (cursor) {
          const idx = parseInt(cursor)

          this.sendResult(
            request,
            create(DBResponseSchema, {
              opId: req.opId,
              value: { case: 'entityList', value: { entities: list.slice(idx, idx + 1).map((d) => toEntity(d)) } },
              nextCursor: idx + 1 < list.length ? `${idx + 1}` : undefined
            })
          )
        } else {
          this.sendResult(
            request,
            create(DBResponseSchema, {
              opId: req.opId,
              value: { case: 'entityList', value: { entities: list.length ? [toEntity(list[0])] : [] } },
              nextCursor: '1'
            })
          )
        }
      }
    }
  }

  private sendResult(request: ProcessStreamResponseV3, response: DBResponse) {
    this.dbContext.result(response, request.processId)
  }

  reset() {
    this.db.clear()
  }

  // Check if the request involves only MemoryCacheItem entity, which doesn't require schema
  private requestRequiresSchema(req: DBRequest | undefined): boolean {
    if (!req) return false

    // Check if all entities in the request are MemoryCacheItem
    switch (req.op.case) {
      case 'upsert':
        return !req.op.value.entity.every((e) => e === MEMORY_CACHE_ITEM_ENTITY)
      case 'delete':
        return !req.op.value.entity.every((e) => e === MEMORY_CACHE_ITEM_ENTITY)
      case 'get':
        return req.op.value.entity !== MEMORY_CACHE_ITEM_ENTITY
      case 'list':
        return req.op.value.entity !== MEMORY_CACHE_ITEM_ENTITY
      default:
        return false
    }
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
      return filter.value?.values.some((v) => equal(value, singleList(v)))
    case DBRequest_DBOperator.NOT_IN:
      return !filter.value?.values.some((v) => equal(value, singleList(v)))
    case DBRequest_DBOperator.HAS_ALL:
      return filter.value?.values.every((v) => equal(value, singleList(v)))
    case DBRequest_DBOperator.HAS_ANY:
      for (const a of filter.value?.values ?? []) {
        const listValues = value.value.case === 'listValue' ? value.value.value.values : []
        if (listValues.some((v) => equal(a, singleList(v)))) {
          return true
        }
      }
      return false
    case DBRequest_DBOperator.LIKE:
      return like(richString(value), filter.value?.values[0] ? richString(filter.value.values[0]) : undefined)
    default:
      return false
  }
}

function singleList(v: RichValue): RichValueList {
  return create(RichValueListSchema, { values: [v] })
}

function richString(v?: RichValue): string | undefined {
  return v?.value.case === 'stringValue' ? v.value.value : undefined
}

function getValue(entity: RichStruct, field: string) {
  return entity.fields[field]
}

function equal(field: RichValue, value?: RichValueList): boolean {
  if (field.value.case === 'stringValue') {
    return field.value.value === richString(value?.values[0])
  }
  if (field.value.case === 'listValue') {
    return field.value.value.values.every((v, i) => {
      const vv = value?.values[i]
      return equal(v, vv ? singleList(vv) : undefined)
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
  if (value === undefined) {
    return undefined
  }
  switch (value.value.case) {
    case 'intValue':
      return value.value.value
    case 'floatValue':
      return value.value.value
    case 'bigintValue':
      return BigIntConverter.to(value) as bigint
    case 'bigdecimalValue':
      return BigDecimalConverter.to(value) as BigDecimal
    default:
      return undefined
  }
}

function toEntity(data: any) {
  return {
    entity: data.entity,
    genBlockChain: '',
    genBlockNumber: 0n,
    genBlockTime: timestampNow(),
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
