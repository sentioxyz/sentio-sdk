import { Store } from '../store.js'
import { User } from './generated/schema.js'
import { MemoryDatabase } from './memory-database.js'
import { afterAll, afterEach } from '@jest/globals'
import { StoreContext } from '../context.js'

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

  afterEach(() => {
    db.reset()
  })

  afterAll(() => {
    // db.stop()
  })
})
