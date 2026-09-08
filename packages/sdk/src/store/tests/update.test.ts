import { describe, it } from 'node:test'
import assert from 'assert'
import { create } from '@bufbuild/protobuf'
import { type DBResponse, DBResponseSchema, EntityUpdateData_Operator } from '@sentio/protos'
import type { IStoreContext, Request } from '@sentio/runtime'

import { Entity, IDColumn, IntColumn, Required, StringColumn } from '../decorators.js'
import { AbstractEntity, add, expr, multiply, type ID, type Int, type String } from '../types.js'
import { Store } from '../store.js'
import { DatabaseSchema } from '../../core/database-schema.js'

@Entity('Counter')
class Counter extends AbstractEntity {
  @Required
  @IDColumn
  id: ID

  @IntColumn
  count?: Int

  @IntColumn
  total?: Int

  @StringColumn
  status?: String

  constructor(data: Partial<Counter>) {
    super()
  }
}

DatabaseSchema.register({
  source: `
type Counter @entity {
  id: ID!
  count: Int
  total: Int
  status: String
}
`,
  entities: { Counter }
})

class RecordingContext implements IStoreContext {
  requests: Request[] = []

  sendRequest(request: Request): Promise<DBResponse> {
    this.requests.push(request)
    return Promise.resolve(create(DBResponseSchema, {}))
  }

  result(): void {}
  error(): void {}
  close(): void {}
}

describe('store update operators', () => {
  it('serializes add, multiply, expression and set', async () => {
    const context = new RecordingContext()
    const store = new Store(context)
    await store.update(Counter, {
      id: 'c1',
      count: add(1),
      total: multiply(2),
      status: expr("if(count > 10, 'hot', 'cold')")
    })

    assert.equal(context.requests.length, 1)
    const request = context.requests[0]
    assert.equal(request.case, 'update')
    if (request.case !== 'update') {
      return
    }
    assert.deepEqual(request.value.entity, ['Counter'])
    assert.deepEqual(request.value.id, ['c1'])
    const fields = request.value.entityData![0].fields!
    assert.equal(fields['count'].op, EntityUpdateData_Operator.ADD)
    assert.equal(fields['total'].op, EntityUpdateData_Operator.MULTIPLY)
    assert.equal(fields['status'].op, EntityUpdateData_Operator.EXPRESSION)
    assert.equal(fields['status'].expression, "if(count > 10, 'hot', 'cold')")
    assert.equal(fields['status'].value, undefined)
  })

  it('rejects an update without id', async () => {
    const store = new Store(new RecordingContext())
    await assert.rejects(store.update(Counter, { count: expr('count + 1') } as any), /Update must have id field/)
  })
})
