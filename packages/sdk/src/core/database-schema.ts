import { ListStateStorage } from '@sentio/runtime'
import { EntityClass } from '../store/index.js'

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
