import { ListStateStorage } from '@sentio/runtime'

export class DatabaseSchemaState extends ListStateStorage<string> {
  static INSTANCE = new DatabaseSchemaState()
}

export class DatabaseSchema {
  static register(schema: string) {
    DatabaseSchemaState.INSTANCE.addValue(schema)
  }
}
