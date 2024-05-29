import { Store } from '../store.js'
import { User, Transaction } from './generated/schema.js'
import { MemoryDatabase } from './memory-database.js'
import { afterAll, afterEach } from '@jest/globals'
import { StoreContext } from '../context.js'
import { BigDecimal } from '@sentio/bigdecimal'

describe('Test Database', () => {
  const storeContext = new StoreContext()
  const db = new MemoryDatabase(storeContext)
  db.start()

  it('should upsert to database', async () => {
    const store = new Store(storeContext)

    const user = new User({
      id: 'test-id-1',
      name: 'test'
    })

    await store.upsert(user)
    const u = await store.get(User, 'test-id-1')
    console.log(u)
    expect(u).toEqual(user)
  })

  it('should delete from database', async () => {
    const store = new Store(storeContext)

    const user = new User({
      id: 'test-id-2',
      name: 'test'
    })

    await store.upsert(user)
    await store.delete(User, 'test-id-2')
    const u = await store.get(User, 'test-id-2')

    expect(u).toBeUndefined()
  })

  it('should list from database', async () => {
    const store = new Store(storeContext)

    const user1 = new User({
      id: 'test-id-1',
      name: 'test'
    })

    const user2 = new User({
      id: 'test-id-2',
      name: 'test'
    })

    await store.upsert([user1, user2])

    const list = await store.list(User, 2, 0)
    expect(list).toEqual([user1, user2])
  })

  it('type tests', async () => {
    const store = new Store(storeContext)
    const tx = new Transaction({
      id: 'test-id-1',
      gas: 100n,
      gasPrice: new BigDecimal('100.0'),
      raw: new Uint8Array([1, 2, 3])
    })
    await store.upsert(tx)
    const tx2 = await store.get(Transaction, 'test-id-1')
    expect(tx2?.gas).toEqual(tx.gas)
    expect(tx2?.id).toEqual(tx.id)
    expect(tx2?.gasPrice).toEqual(tx.gasPrice)
  })

  afterEach(() => {
    db.reset()
  })

  afterAll(() => {
    // db.stop()
  })
})
