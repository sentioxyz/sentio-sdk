import { ListStateStorage } from '@sentio/runtime'
import { EntityClass } from '../store/index.js'
import { isInterfaceType, isObjectType, isScalarType, parse } from 'graphql/index.js'
import { buildSchema } from '../store/schema.js'
import { printSchemaWithDirectives } from '@graphql-tools/utils'
import { GraphQLSchema } from 'graphql'

type Schema = {
  source: string
  entities: Record<string, EntityClass<any>>
}

export class DatabaseSchemaState extends ListStateStorage<Schema> {
  static INSTANCE = new DatabaseSchemaState()
}

export class DatabaseSchema {
  static register(schema: Schema) {
    DatabaseSchemaState.INSTANCE.addValue(schema)
  }

  static findEntity(name: string) {
    for (const schema of DatabaseSchemaState.INSTANCE.getValues()) {
      if (schema.entities[name]) {
        return schema.entities[name]
      }
    }

    return undefined
  }
}

export function mergeSchemas(schemas: Schema[]) {
  const allTypes: Record<string, any> = {}
  let mergedSchema = new GraphQLSchema({})
  for (const schema of schemas) {
    const gqlSchema = buildSchema(parse(schema.source))
    for (const type of Object.values(gqlSchema.getTypeMap())) {
      if (isScalarType(type) || type.name.startsWith('__')) {
        // types.push(type)
        continue
      }
      if (allTypes[type.name]) {
        console.warn(`Type ${type.name} is already registered, you have duplicate definitions in multiple schemas.`)
      } else if (isObjectType(type) || isInterfaceType(type)) {
        allTypes[type.name] = type
      } else {
        allTypes[type.name] = type
      }
    }
    mergedSchema = new GraphQLSchema({
      types: [...Object.values(allTypes)]
    })
  }
  return printSchemaWithDirectives(mergedSchema, {
    commentDescriptions: false,
    assumeValid: true
  })
}
