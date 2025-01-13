import { StoreContext } from '../context.js'
import { DBRequest, ProcessStreamResponse } from '@sentio/protos'
import { GraphQLField, GraphQLSchema, StringValueNode } from 'graphql/index.js'
import { DatabaseSchemaState } from '../../core/database-schema.js'
import { parse } from 'graphql/index.js'
import { buildSchema } from '../schema.js'
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLOutputType } from 'graphql'
import { PluginManager } from '@sentio/runtime'

export class MemoryDatabase {
  db = new Map<string, Record<string, any>>()
  public lastDbRequest: DBRequest | undefined
  schema: GraphQLSchema

  constructor(readonly dbContext: StoreContext) {
    const source = DatabaseSchemaState.INSTANCE.getValues()[0].source
    const doc = parse(source)
    this.schema = buildSchema(doc)
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
                  if (deriveField.listValue) {
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
        const { entity, cursor } = req.list
        const list = this.listEntities(entity)

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

  private listEntities(entity: string) {
    const entityDB = this.db.get(entity)
    return entityDB
      ? Object.entries(entityDB)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([id, data]) => this.fillDerivedFromFields(entity, id, data))
      : []
  }
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
