import { describe, it } from 'node:test'
import assert from 'assert'
import {
  Entity,
  BigDecimalColumn,
  BigIntColumn,
  BooleanColumn,
  BytesColumn,
  FloatColumn,
  IDColumn,
  IntColumn,
  Many,
  One,
  Required,
  StringColumn,
  TimestampColumn,
  ListColumn,
  Int8Column
} from '../decorators.js'
import type { Boolean, Bytes, Float, ID, Int, String, Int8 } from '../types.js'
import { AbstractEntity } from '../types.js'

import { BigDecimal } from '@sentio/bigdecimal'

/* eslint-disable */

enum EnumA {
  V1,
  V2
}

@Entity('Person')
class Person extends AbstractEntity {
  @Required
  @IDColumn
  id: ID

  @IntColumn
  intValue?: Int

  @Int8Column
  int8Value?: Int8

  @BytesColumn
  bytesValue?: Bytes

  @BigDecimalColumn
  bigDecimalValue?: BigDecimal

  @StringColumn
  stringValue?: String

  @BigIntColumn
  bigIntValue?: bigint

  @TimestampColumn
  dateValue?: Date

  @FloatColumn
  floatValue?: Float

  @Required
  @BooleanColumn
  booleanValue: Boolean

  @ListColumn('Int')
  arrayInt?: Array<Int | undefined>

  @ListColumn('[Int!]')
  twoDArrayInt?: Array<Array<Int>>

  @ListColumn('EnumA')
  enumArray?: Array<EnumA>

  @Many('Pet')
  pets: Promise<Array<Pet | undefined>>
  petsIDs: Array<ID | undefined>

  constructor(data?: Partial<Person>) {
    super()
  }
}

@Entity('Pet')
class Pet extends AbstractEntity {
  @IDColumn
  id: ID

  @Required
  @One('Person')
  owner: Promise<Person>
  ownerID: ID

  @Required
  @BooleanColumn
  isCat: Boolean

  constructor(data?: Partial<Pet>) {
    super()
  }
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

describe('entity tests', () => {
  it('define entity name', () => {
    const t = new Person({ id: 'test' })
    const entityName = (t.constructor as any).entityName
    assert.equal(entityName, 'Person')
  })

  it('define proto ', () => {
    const t = new Person()
    const meta = (t.constructor as any).meta
    assert.ok(meta['id'])
  })

  it('define constructor ', async () => {
    const now = new Date()
    const p = new Pet({ id: 'pet' })
    const t = new Person({
      id: 'test',
      intValue: 100,
      int8Value: 9223372036854775807n,
      bytesValue: new Uint8Array([1, 2, 3]),
      bigDecimalValue: new BigDecimal('123.456'),
      stringValue: 'test',
      bigIntValue: 1000n,
      dateValue: now,
      floatValue: 0.1,
      booleanValue: true,
      arrayInt: [1, 2, 3],
      pets: Promise.resolve([p]),
      twoDArrayInt: [
        [1, 2],
        [3, 4]
      ],
      enumArray: [EnumA.V1, EnumA.V2]
    })

    console.log(t.id)
    assert.equal(t.id, 'test')
    assert.equal(t.intValue, 100)
    assert.equal(t.int8Value, 9223372036854775807n)
    assert.deepEqual(t.bytesValue, new Uint8Array([1, 2, 3]))
    assert.deepEqual(t.bigDecimalValue, new BigDecimal('123.456'))
    assert.equal(t.stringValue, 'test')
    assert.equal(t.bigIntValue, 1000n)
    assert.equal(t.dateValue, now)
    assert.equal(t.floatValue, 0.1)
    assert.equal(t.booleanValue, true)
    assert.deepEqual(t.arrayInt, [1, 2, 3])
    assert.deepEqual(t.twoDArrayInt, [
      [1, 2],
      [3, 4]
    ])
    assert.deepEqual(t.enumArray, [EnumA.V1, EnumA.V2])
    await sleep(1)
    assert.deepEqual(t.petsIDs, [p.id])
  })

  it('define getter & setter', () => {
    const t = new Person()
    t.intValue = 100
    assert.equal(t.intValue, 100)
    assert.equal(t['intValue'], 100)

    t.arrayInt = [1, 2, 3]
    assert.deepEqual(t.arrayInt, [1, 2, 3])
    t['arrayInt'] = [1, 2, 3, 4]
    assert.deepEqual(t.arrayInt, [1, 2, 3, 4])
    // required value must be set
    assert.throws(() => {
      // @ts-ignore
      t.booleanValue = null
    })

    // required value must be get
    assert.throws(() => {
      // @ts-ignore
      console.log(t.booleanValue)
    })
  })

  it('defines getter & setter for relation', async () => {
    const t = new Pet({ id: 'pet' })
    const p = new Person({
      id: 'person'
    })
    t.owner = Promise.resolve(p)
    await sleep(1)

    assert.equal(t.ownerID, 'person')

    const t2 = new Pet({ id: 'pet2' })

    p.pets = Promise.resolve([t, t2])

    await sleep(1)

    assert.deepEqual(p.petsIDs, [t.id, t2.id])
  })

  it('toJSON', () => {
    const t = new Pet({
      id: 'test',
      ownerID: 'owner',
      isCat: false
    })
    const obj = t.toJSON()
    assert.deepEqual(obj, {
      id: 'test',
      owner: 'owner',
      isCat: false
    })
  })

  it('toString', () => {
    const t = new Pet({
      id: 'test',
      ownerID: 'owner',
      isCat: false
    })
    const obj = t.toString()
    assert.equal(obj, 'Pet {"id":"test","owner":"owner","isCat":false}')
  })
})
