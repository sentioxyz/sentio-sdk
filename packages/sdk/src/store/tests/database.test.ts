import { after, afterEach, describe, it } from 'node:test'
import assert from 'assert'
import { Store } from '../store.js'
import { Transaction, User } from './generated/schema.js'
import { MemoryDatabase } from './memory-database.js'
import { StoreContext } from '../context.js'
import { BigDecimal } from '@sentio/bigdecimal'
import { Subject } from 'rxjs'
import { DeepPartial, ProcessStreamResponse } from '@sentio/protos'

describe('Test Database', () => {
  const subject = new Subject<DeepPartial<ProcessStreamResponse>>()

  const storeContext = new StoreContext(subject, 1)
  const db = new MemoryDatabase(storeContext)
  db.start()

  function expectEntityEqual(a: any, b: any) {
    assert.equal(a._data, b._data)
  }

  function expectListEntityEqual(a: any[], b: any[]) {
    assert.deepEqual(
      a.map((e) => e._data),
      b.map((e) => e._data)
    )
  }

  it('should upsert to database', async () => {
    const store = new Store(storeContext)

    const user = new User({
      id: 'test-id-1',
      name: 'test',
      transactionsIDs: [],
      organizationsIDs: []
    })

    await store.upsert(user)
    assert.ok(db.db.has('User-test-id-1'))
    const u = await store.get(User, 'test-id-1')
    console.log(u)
    expectEntityEqual(u, user)
  })

  it('should delete from database', async () => {
    const store = new Store(storeContext)

    const user = new User({
      id: 'test-id-2',
      name: 'test',
      transactionsIDs: [],
      organizationsIDs: []
    })

    await store.upsert(user)
    assert.ok(db.db.has('User-test-id-2'))
    await store.delete(User, 'test-id-2')
    const u = await store.get(User, 'test-id-2')
    assert.ok(!u)
    assert.ok(!db.db.has('User-test-id-2'))
  })

  it('should list from database', async () => {
    const store = new Store(storeContext)

    const user1 = new User({
      id: 'test-id-1',
      name: 'test',
      transactionsIDs: [],
      organizationsIDs: []
    })

    const user2 = new User({
      id: 'test-id-2',
      name: 'test',
      transactionsIDs: [],
      organizationsIDs: []
    })

    await store.upsert([user1, user2])
    const list = []
    for (const u of await store.list(User, [])) {
      list.push(u)
    }
    expectListEntityEqual(list, [user1, user2])

    await store.list(Transaction, [
      {
        field: 'arrayValue',
        op: '=',
        value: ['']
      },
      {
        field: 'gas',
        op: 'in',
        value: [0n]
      },
      {
        field: 'senderID',
        op: 'like',
        value: 'aaa%'
      }
    ])
  })

  it('type tests', async () => {
    const store = new Store(storeContext)
    const tx = new Transaction({
      id: 'test-id-1',
      gas: 100n,
      count: 0,
      gasPrice: new BigDecimal('100.0'),
      raw: new Uint8Array([1, 2, 3])
    })
    await store.upsert(tx)
    const tx2 = await store.get(Transaction, 'test-id-1')
    assert.equal(tx2?.gas, tx.gas)
    assert.equal(tx2?.id, tx.id)
    assert.deepEqual(tx2?.gasPrice, tx.gasPrice)
  })

  it('filter constraints', async () => {
    const store = new Store(storeContext)
    // wrong type won't compile

    store.list(Transaction, [
      {
        field: 'arrayValue',
        op: '=',
        value: null
      }
    ])
    store.list(Transaction, [
      {
        field: 'arrayValue',
        op: '=',
        value: ['s']
      }
    ])
    store.list(Transaction, [
      {
        field: 'gas',
        op: '>',
        value: 1n
      }
    ])
    /* can't  bigint > null
    await store.list(Transaction, [
      {
        field: 'gas',
        op: '>',
        value: null
      }
    ])*/
    store.list(Transaction, [
      {
        field: 'gas',
        op: '=',
        value: null
      }
    ])
    store.list(Transaction, [
      {
        field: 'gas',
        op: 'in',
        value: [1n, 2n]
      }
    ])
    store.list(Transaction, [
      {
        field: 'gasPrice',
        op: '>',
        value: 0.0
      }
    ])
    store.list(Transaction, [
      {
        field: 'gasPrice',
        op: '>',
        value: new BigDecimal(0)
      }
    ])
    // "has any"/"has all" must followed by value in array
    /*await store.list(Transaction, [
      {
        field: 'arrayValue',
        op: 'has any',
        value: ""
      }
    ])*/
    store.list(Transaction, [
      {
        field: 'arrayValue',
        op: 'has all',
        value: ['']
      }
    ])
  })

  afterEach(() => {
    db.reset()
  })

  after(() => {
    // db.stop()
    storeContext.close()
  })
})
