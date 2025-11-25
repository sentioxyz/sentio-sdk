import { after, afterEach, describe, it } from 'node:test'
import assert from 'assert'
import { Store } from '../store.js'
import { Transaction, TransactionReceipt, User, TransactionStatus, Organization } from './generated/schema.js'
import { MemoryDatabase, withStoreContext } from '../../testing/memory-database.js'
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
    assert.strictEqual(JSON.stringify(a._data), JSON.stringify(b._data))
  }

  function expectListEntityEqual(a: any[], b: any[]) {
    assert.deepEqual(
      a.map((e) => e._data),
      b.map((e) => e._data)
    )
  }

  it(
    'should upsert to database',
    withStoreContext(storeContext, async () => {
      const store = new Store(storeContext)

      const user = new User({
        id: 'test-id-1',
        name: 'test'
      })

      await store.upsert(user)
      assert.ok(db.hasEntity('User', 'test-id-1'))
      const u = await store.get(User, 'test-id-1')
      console.log(u)
      expectEntityEqual(u, user)
    })
  )

  it(
    'should delete from database',
    withStoreContext(storeContext, async () => {
      const store = new Store(storeContext)

      const user = new User({
        id: 'test-id-2',
        name: 'test'
      })

      await store.upsert(user)
      assert.ok(db.hasEntity('User', 'test-id-2'))
      await store.delete(User, 'test-id-2')
      const u = await store.get(User, 'test-id-2')
      assert.ok(!u)
      assert.ok(!db.hasEntity('User', 'test-id-2'))
    })
  )

  it('type tests', async () => {
    const store = new Store(storeContext)
    const tx = new Transaction({
      id: 'test-id-1',
      gas: 100n,
      count: 0,
      gasPrice: new BigDecimal('100.0'),
      raw: new Uint8Array([1, 2, 3]),
      arrayValue: [],
      arrayOfArrayValue: [],
      int8Value: 9223372036854775807n
    })
    await store.upsert(tx)

    const tx2 = await store.get(Transaction, 'test-id-1')
    assert.equal(tx2?.gas, tx.gas)
    assert.equal(tx2?.id, tx.id)
    assert.equal(tx2?.int8Value, 9223372036854775807n)
    assert.deepEqual(tx2?.gasPrice, tx.gasPrice)
  })

  it('special filter test', async () => {
    const store = new Store(storeContext)
    await store.list(Transaction, [
      {
        field: 'arrayValue',
        op: '!=',
        value: []
      }
    ])
    assert.deepEqual(db.lastDbRequest?.list?.filters, [
      {
        field: 'arrayValue',
        op: 1,
        value: {
          values: [
            {
              listValue: {
                values: []
              }
            }
          ]
        }
      }
    ])
  })

  it('filter constraints', async () => {
    const store = new Store(storeContext)
    // wrong type won't compile

    // must extends AbstractEntity
    /*const tx1= {
      id: 'test-id-1',
      gas: 100n,
      count: 0,
    }
    await store.upsert(tx1)*/

    await store.list(Transaction, [
      {
        field: 'arrayValue',
        op: '=',
        value: null
      }
    ])
    await store.list(Transaction, [
      {
        field: 'arrayValue',
        op: '=',
        value: ['s']
      }
    ])
    await store.list(Transaction, [
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
    await store.list(Transaction, [
      {
        field: 'gas',
        op: '=',
        value: null
      }
    ])
    await store.list(Transaction, [
      {
        field: 'gas',
        op: 'in',
        value: [1n, 2n]
      }
    ])
    await store.list(Transaction, [
      {
        field: 'gasPrice',
        op: '>',
        value: 0.0
      }
    ])
    await store.list(Transaction, [
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
    await store.list(Transaction, [
      {
        field: 'arrayValue',
        op: 'has all',
        value: ['']
      }
    ])
  })

  it(
    'should allow accessing required TransactionReceipt[] through Transaction',
    withStoreContext(storeContext, async () => {
      const store = new Store(storeContext)

      const USER_ID = 'user-1'
      const TX_ID = 'tx-1'
      const RECEIPT_IDS = {
        first: 'receipt-1',
        second: 'receipt-2'
      }

      // Create a user first
      const user = new User({
        id: USER_ID,
        name: 'test user'
      })
      await store.upsert(user)

      // Create the main transaction with senderID
      const transaction = new Transaction({
        id: TX_ID,
        senderID: USER_ID,
        gas: 100n,
        gasPrice: new BigDecimal('1.5'),
        arrayValue: [],
        arrayOfArrayValue: []
      })

      // Create transaction receipts with transactionID
      const receipt1 = new TransactionReceipt({
        id: RECEIPT_IDS.first,
        status: TransactionStatus.SUCCESS,
        transactionID: TX_ID
      })

      const receipt2 = new TransactionReceipt({
        id: RECEIPT_IDS.second,
        status: TransactionStatus.FAILURE,
        transactionID: TX_ID
      })

      // Save everything to the database
      await store.upsert(transaction)
      await store.upsert([receipt1, receipt2])

      // Retrieve the transaction and verify its receipts
      const retrievedTx = await store.get(Transaction, TX_ID)
      assert.ok(retrievedTx, 'Transaction should be retrieved')

      const receipts = await retrievedTx.receipts()
      assert.equal(receipts.length, 2, 'Should have 2 receipts')
      assert.ok(
        receipts.some((r) => r.id === RECEIPT_IDS.first && r.status === TransactionStatus.SUCCESS),
        'Should find receipt1'
      )
      assert.ok(
        receipts.some((r) => r.id === RECEIPT_IDS.second && r.status === TransactionStatus.FAILURE),
        'Should find receipt2'
      )
    })
  )

  it(
    'should allow accessing optional Transaction from TransactionReceipt',
    withStoreContext(storeContext, async () => {
      const store = new Store(storeContext)

      const USER_ID = 'user-1'
      const TX_ID = 'tx-1'
      const RECEIPT_ID = 'receipt-1'

      // Create a user
      const user = new User({
        id: USER_ID,
        name: 'test user'
      })
      await store.upsert(user)

      // Create transaction
      const transaction = new Transaction({
        id: TX_ID,
        senderID: USER_ID,
        gas: 100n,
        gasPrice: new BigDecimal('1.5'),
        arrayValue: [],
        arrayOfArrayValue: []
      })

      // Create receipt with reference to transaction
      const receipt = new TransactionReceipt({
        id: RECEIPT_ID,
        status: TransactionStatus.SUCCESS,
        transactionID: TX_ID
      })

      // Save both to database
      await store.upsert(transaction)
      await store.upsert(receipt)

      // Retrieve receipt and verify transaction reference
      const retrievedReceipt = await store.get(TransactionReceipt, RECEIPT_ID)
      assert.ok(retrievedReceipt, 'Receipt should be retrieved')

      const linkedTransaction = await retrievedReceipt.transaction()
      assert.ok(linkedTransaction, 'Should be able to access linked transaction')
      assert.equal(linkedTransaction.id, TX_ID, 'Should have correct transaction ID')

      // Verify some transaction fields to ensure full object retrieval
      assert.equal(linkedTransaction.gas, 100n, 'Should have correct gas value')
      assert.equal(linkedTransaction.gasPrice.toString(), '1.5', 'Should have correct gasPrice')
    })
  )

  it(
    'should allow accessing User(Owner) through Transaction.sender',
    withStoreContext(storeContext, async () => {
      const store = new Store(storeContext)

      const USER_ID = 'user-1'
      const TX_ID = 'tx-1'

      // Create a user that implements Owner interface
      const user = new User({
        id: USER_ID,
        name: 'test user'
      })
      await store.upsert(user)

      // Create transaction with reference to user as sender (Owner)
      const transaction = new Transaction({
        id: TX_ID,
        senderID: USER_ID, // Reference to Owner (User in this case)
        gas: 100n,
        gasPrice: new BigDecimal('1.5'),
        arrayValue: [],
        arrayOfArrayValue: []
      })
      await store.upsert(transaction)

      // Retrieve transaction and verify sender (Owner) access
      const retrievedTx = await store.get(Transaction, TX_ID)
      assert.ok(retrievedTx, 'Transaction should be retrieved')

      const sender = await retrievedTx.sender()
      assert.ok(sender, 'Should be able to access sender')
      assert.equal(sender.id, USER_ID, 'Should have correct sender ID')
      assert.equal(sender.name, 'test user', 'Should have correct sender name')

      // Verify sender is instance of User implementing Owner interface
      assert.ok(sender instanceof User, 'Sender should be instance of User')
    })
  )

  it(
    'should allow accessing User(Owner) through Transaction.sender',
    withStoreContext(storeContext, async () => {
      const store = new Store(storeContext)

      const USER_ID = 'user-1'
      const TX_ID = 'tx-1'

      // Create a user that implements Owner interface
      const user = new User({
        id: USER_ID,
        name: 'test user'
      })
      await store.upsert(user)

      // Create transaction with reference to user as sender (Owner)
      const transaction = new Transaction({
        id: TX_ID,
        senderID: USER_ID, // Reference to Owner (User in this case)
        gas: 100n,
        gasPrice: new BigDecimal('1.5'),
        arrayValue: [],
        arrayOfArrayValue: []
      })
      await store.upsert(transaction)

      // Retrieve transaction and verify sender (Owner) access
      const retrievedTx = await store.get(Transaction, TX_ID)
      assert.ok(retrievedTx, 'Transaction should be retrieved')

      const sender = await retrievedTx.sender()
      assert.ok(sender, 'Should be able to access sender')
      assert.equal(sender.id, USER_ID, 'Should have correct sender ID')
      assert.equal(sender.name, 'test user', 'Should have correct sender name')

      // Verify sender is instance of User implementing Owner interface
      assert.ok(sender instanceof User, 'Sender should be instance of User')
    })
  )

  it(
    'should allow accessing Organization[] through User.organizations',
    withStoreContext(storeContext, async () => {
      const store = new Store(storeContext)

      const USER_ID = 'user-1'
      const ORG_IDS = {
        first: 'org-1',
        second: 'org-2'
      }

      // Create a user first
      const user = new User({
        id: USER_ID,
        name: 'test user'
      })
      await store.upsert(user)

      // Create organizations with the user as a member
      const org1 = new Organization({
        id: ORG_IDS.first,
        name: 'First Org',
        membersIDs: [USER_ID]
      })

      const org2 = new Organization({
        id: ORG_IDS.second,
        name: 'Second Org',
        membersIDs: [USER_ID]
      })

      await store.upsert([org1, org2])

      // Retrieve user and verify organizations access
      const retrievedUser = await store.get(User, USER_ID)
      assert.ok(retrievedUser, 'User should be retrieved')

      // Since organizations is @derivedFrom(field: "members"), we should be able to access them
      const organizations = await retrievedUser.organizations()
      assert.equal(organizations.length, 2, 'Should have 2 organizations')

      assert.ok(
        organizations.some((org) => org.id === ORG_IDS.first && org.name === 'First Org'),
        'Should find first organization'
      )
      assert.ok(
        organizations.some((org) => org.id === ORG_IDS.second && org.name === 'Second Org'),
        'Should find second organization'
      )

      // Verify the bidirectional relationship
      const org = organizations[0]
      const members = await org.members()
      assert.equal(members.length, 1, 'Organization should have 1 member')
      assert.equal(members[0].id, USER_ID, 'Member should be our test user')
    })
  )

  it(
    'should handle nested relationships (Transaction -> Receipt -> Transaction -> Receipt)',
    withStoreContext(storeContext, async () => {
      const store = new Store(storeContext)

      const USER_ID = 'user-1'
      const TX_IDS = {
        first: 'tx-1',
        second: 'tx-2'
      }
      const RECEIPT_IDS = {
        first: 'receipt-1',
        second: 'receipt-2'
      }

      // Create user
      const user = new User({
        id: USER_ID,
        name: 'test user'
      })
      await store.upsert(user)

      // Create two transactions
      const transaction1 = new Transaction({
        id: TX_IDS.first,
        senderID: USER_ID,
        gas: 100n,
        gasPrice: new BigDecimal('1.5'),
        arrayValue: [],
        arrayOfArrayValue: []
      })

      const transaction2 = new Transaction({
        id: TX_IDS.second,
        senderID: USER_ID,
        gas: 200n,
        gasPrice: new BigDecimal('2.5'),
        arrayValue: [],
        arrayOfArrayValue: []
      })

      // Create receipts linking to transactions
      const receipt1 = new TransactionReceipt({
        id: RECEIPT_IDS.first,
        status: TransactionStatus.SUCCESS,
        transactionID: TX_IDS.first
      })

      const receipt2 = new TransactionReceipt({
        id: RECEIPT_IDS.second,
        status: TransactionStatus.SUCCESS,
        transactionID: TX_IDS.second
      })

      // Save everything to database
      await store.upsert([transaction1, transaction2])
      await store.upsert([receipt1, receipt2])

      // Start traversing relationships
      const startingTx = await store.get(Transaction, TX_IDS.first)
      assert.ok(startingTx, 'Should retrieve starting transaction')

      // Transaction -> Receipt
      const receipts = await startingTx.receipts()
      assert.equal(receipts.length, 1, 'Should have one receipt')
      const firstReceipt = receipts[0]
      assert.equal(firstReceipt.id, RECEIPT_IDS.first, 'Should be first receipt')

      // Receipt -> Transaction
      const linkedTx = await firstReceipt.transaction()
      assert.ok(linkedTx, 'Should retrieve linked transaction')
      assert.equal(linkedTx.id, TX_IDS.first, 'Should link back to first transaction')

      // Transaction -> Receipt (second transaction)
      const secondTx = await store.get(Transaction, TX_IDS.second)
      assert.ok(secondTx, 'Should retrieve second transaction')
      const secondReceipts = await secondTx.receipts()
      assert.equal(secondReceipts.length, 1, 'Should have one receipt')
      assert.equal(secondReceipts[0].id, RECEIPT_IDS.second, 'Should be second receipt')

      // Verify both transactions belong to same user
      const firstTxSender = await startingTx.sender()
      const secondTxSender = await secondTx.sender()
      assert.equal(firstTxSender.id, USER_ID, 'First transaction should belong to user')
      assert.equal(secondTxSender.id, USER_ID, 'Second transaction should belong to user')
    })
  )

  it(
    'should filter transactions with eq, gt, lt, in, hasAny, and like operators',
    withStoreContext(storeContext, async () => {
      const store = new Store(storeContext)

      const Transaction1 = new Transaction({
        id: 'transaction-1',
        gas: 100n,
        count: 0,
        gasPrice: new BigDecimal('100.0'),
        raw: new Uint8Array([1, 2, 3]),
        arrayValue: ['1', '2', '3'],
        arrayOfArrayValue: []
      })
      const Transaction2 = new Transaction({
        id: 'transaction-2',
        gas: 200n,
        count: 0,
        gasPrice: new BigDecimal('200.0'),
        raw: new Uint8Array([1, 2, 3]),
        arrayValue: ['4', '5', '6'],
        arrayOfArrayValue: []
      })
      const Transaction3 = new Transaction({
        id: 'transaction-3',
        gas: 300n,
        count: 0,
        gasPrice: new BigDecimal('300.0'),
        raw: new Uint8Array([1, 2, 3]),
        arrayValue: ['7', '8', '9'],
        arrayOfArrayValue: []
      })
      await store.upsert([Transaction1, Transaction2, Transaction3])

      const transactionsAll = await store.list(Transaction, [])
      assert.equal(transactionsAll.length, 3)

      const transactionsEq = await store.list(Transaction, [{ field: 'gas', op: '=', value: 100n }])
      assert.equal(transactionsEq.length, 1)
      assert.equal(transactionsEq[0].id, 'transaction-1')

      const transactionsGt = await store.list(Transaction, [{ field: 'gas', op: '>', value: 100n }])
      assert.equal(transactionsGt.length, 2)
      assert.ok(transactionsGt.some((tx) => tx.id === 'transaction-2'))
      assert.ok(transactionsGt.some((tx) => tx.id === 'transaction-3'))

      const transactionsLt = await store.list(Transaction, [{ field: 'gas', op: '<', value: 300n }])
      assert.equal(transactionsLt.length, 2)
      assert.ok(transactionsLt.some((tx) => tx.id === 'transaction-1'))
      assert.ok(transactionsLt.some((tx) => tx.id === 'transaction-2'))

      const transactionsIn = await store.list(Transaction, [{ field: 'gas', op: 'in', value: [100n, 300n] }])
      assert.equal(transactionsIn.length, 2)
      assert.ok(transactionsIn.some((tx) => tx.id === 'transaction-1'))
      assert.ok(transactionsIn.some((tx) => tx.id === 'transaction-3'))

      const transactionsHasAny = await store.list(Transaction, [
        {
          field: 'arrayValue',
          op: 'has any',
          value: ['1', '4']
        }
      ])
      assert.equal(transactionsHasAny.length, 2)

      const transactionsLike = await store.list(Transaction, [{ field: 'id', op: 'like', value: 'transaction-%' }])
      assert.equal(transactionsLike.length, 3)
    })
  )

  it('should allow filter with multiple filters', async () => {
    const store = new Store(storeContext)

    const Transaction1 = new Transaction({
      id: 'transaction-1',
      gas: 100n,
      count: 0,
      gasPrice: new BigDecimal('100.0'),
      raw: new Uint8Array([1, 2, 3]),
      arrayValue: ['1', '2', '3'],
      arrayOfArrayValue: []
    })
    const Transaction2 = new Transaction({
      id: 'transaction-2',
      gas: 200n,
      count: 0,
      gasPrice: new BigDecimal('200.0'),
      raw: new Uint8Array([1, 2, 3]),
      arrayValue: ['4', '5', '6'],
      arrayOfArrayValue: []
    })
    await store.upsert([Transaction1, Transaction2])

    const filtered = await store.list(Transaction, [
      { field: 'id', op: '=', value: 'transaction-1' },
      { field: 'gas', op: '>=', value: 100n }
    ])

    assert.equal(filtered.length, 1)
    assert.equal(filtered[0].id, Transaction1.id)
  })

  it(
    'should allow filter with relation id field',
    withStoreContext(storeContext, async () => {
      const store = new Store(storeContext)

      const user1 = new User({
        id: 'user-1',
        name: 'test user'
      })

      const transaction1 = new Transaction({
        id: 'transaction-1',
        gas: 100n,
        count: 0,
        gasPrice: new BigDecimal('100.0'),
        raw: new Uint8Array([1, 2, 3]),
        arrayValue: ['1', '2', '3'],
        arrayOfArrayValue: [],
        senderID: user1.id
      })

      await store.upsert([user1, transaction1])

      const filtered = await store.list(Transaction, [{ field: 'senderID', op: '=', value: user1.id }])

      assert.equal(filtered.length, 1)
    })
  )

  it(
    'should return array when derived field is defined',
    withStoreContext(storeContext, async () => {
      const store = new Store(storeContext)

      const user = new User({
        id: 'user-1',
        name: 'test user'
      })

      await store.upsert(user)
      const transactions = await user.transactions()
      assert.deepStrictEqual(transactions, [])

      const userAfterGet = await store.get(User, 'user-1')
      assert.deepStrictEqual(await userAfterGet?.transactions(), [])

      const tx = new Transaction({
        id: 'tx-1',
        senderID: user.id,
        gas: 100n,
        gasPrice: new BigDecimal('100.0'),
        raw: new Uint8Array([1, 2, 3]),
        arrayValue: ['1', '2', '3'],
        arrayOfArrayValue: []
      })

      await store.upsert(tx)
      const transactions2 = await user.transactions()
      assert.deepStrictEqual(transactions2, [tx])
    })
  )

  afterEach(() => {
    db.reset()
  })

  after(() => {
    // db.stop()
    storeContext.close()
  })
})
