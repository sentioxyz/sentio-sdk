import { ListStateStorage } from '@sentio/runtime'
import { EntityClass } from '../store/index.js'
import { isInterfaceType, isObjectType, isScalarType, parse, printType } from 'graphql/index.js'
import { buildSchema } from '../store/schema.js'

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
  let ret = ''
  const types: Record<string, any> = {}
  for (const schema of schemas) {
    const gqlSchema = buildSchema(parse(schema.source))
    for (const type of Object.values(gqlSchema.getTypeMap())) {
      if (isScalarType(type) || type.name.startsWith('__')) {
        continue
      }
      if (types[type.name]) {
        console.warn(`Type ${type.name} is already registered, you have duplicate definitions in multiple schemas.`)
      } else if (isObjectType(type) || isInterfaceType(type)) {
        types[type.name] = type
        type.description = null
        for (const field of Object.values(type.getFields())) {
          field.description = null
        }
        ret += printType(type) + '\n'
      } else {
        types[type.name] = type
        ret += printType(type) + '\n'
      }
    }
  }
  return ret
}
