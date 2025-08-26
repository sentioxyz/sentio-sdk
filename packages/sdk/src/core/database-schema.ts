import { ListStateStorage } from '@sentio/runtime'
import { EntityClass } from '../store/index.js'
import { isInterfaceType, isObjectType, isScalarType, parse } from 'graphql/index.js'
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
  const allTypes: Record<string, any> = {}
  let ret = ''
  for (const schema of schemas) {
    let source = schema.source
    const gqlSchema = buildSchema(parse(source))
    for (const type of Object.values(gqlSchema.getTypeMap())) {
      if (isScalarType(type) || type.name.startsWith('__')) {
        // types.push(type)
        continue
      }
      if (allTypes[type.name]) {
        console.warn(`Type ${type.name} is already registered, you have duplicate definitions in multiple schemas.`)
        // remove the definition from source using regex
        if (isObjectType(type)) {
          const p = `type\\s+${type.name}\\s+[^}]+\\}`
          source = source.replace(new RegExp(p, 'g'), '')
        } else if (isInterfaceType(type)) {
          source = source.replace(new RegExp(`interface\s+${type.name}\s+[^}]+\}`, 'g'), '')
        }
      } else {
        allTypes[type.name] = type
      }
    }
    ret += source + '\n'
  }
  return ret
}
