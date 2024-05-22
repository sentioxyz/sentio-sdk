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
    const s = DatabaseSchemaState.INSTANCE.getValues().find((s) => {
      return s.entities[name] != null
    })
    return s?.entities[name]
  }
}
