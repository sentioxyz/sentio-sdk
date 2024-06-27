import { describe } from '@jest/globals'
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
  ListColumn
} from '../decorators.js'
import type { Boolean, Bytes, Float, ID, Int, String } from '../types.js'
import { BigDecimal } from '@sentio/bigdecimal'

/* eslint-disable */

@Entity('Person')
class Person {
  @Required
  @IDColumn
  id: ID

  @IntColumn
  intValue?: Int

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

  @Many('Pet')
  pets: Promise<Array<Pet | undefined>>
  petsIDs: Array<ID | undefined>

  constructor(data?: Partial<Person>) {}
}

@Entity('Pet')
class Pet {
  @IDColumn
  id: ID

  @Required
  @One('Person')
  owner: Promise<Person>
  ownerID: ID

  constructor(data?: Partial<Pet>) {}
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

describe('entity tests', () => {
  it('define entity name', () => {
    const t = new Person({ id: 'test' })
    const entityName = (t.constructor as any).entityName
    expect(entityName).toBe('Person')
  })

  it('define proto ', () => {
    const t = new Person()
    const meta = (t.constructor as any).meta
    expect(meta['id']).toBeDefined()
  })

  it('define constructor ', async () => {
    const now = new Date()
    const p = new Pet({ id: 'pet' })
    const t = new Person({
      id: 'test',
      intValue: 100,
      bytesValue: new Uint8Array([1, 2, 3]),
      bigDecimalValue: new BigDecimal('123.456'),
      stringValue: 'test',
      bigIntValue: 1000n,
      dateValue: now,
      floatValue: 0.1,
      booleanValue: true,
      arrayInt: [1, 2, 3],
      pets: Promise.resolve([p])
    })

    expect(t.id).toBe('test')
    expect(t.intValue).toBe(100)
    expect(t.bytesValue).toEqual(new Uint8Array([1, 2, 3]))
    expect(t.bigDecimalValue).toEqual(new BigDecimal('123.456'))
    expect(t.stringValue).toBe('test')
    expect(t.bigIntValue).toBe(1000n)
    expect(t.dateValue).toBe(now)
    expect(t.floatValue).toBe(0.1)
    expect(t.booleanValue).toBe(true)
    expect(t.arrayInt).toEqual([1, 2, 3])
    await sleep(1)
    expect(t.pets).toBeDefined()
    expect(t.petsIDs).toStrictEqual([p.id])
  })

  it('define getter & setter', () => {
    const t = new Person()
    t.intValue = 100
    expect(t.intValue).toBe(100)

    // required value must be set
    expect(() => {
      // @ts-ignore
      t.booleanValue = null
    }).toThrowError()

    // required value must be get
    expect(() => {
      // @ts-ignore
      console.log(t.booleanValue)
    }).toThrowError()
  })

  it('defines getter & setter for relation', async () => {
    const t = new Pet({ id: 'pet' })
    const p = new Person({
      id: 'person'
    })
    t.owner = Promise.resolve(p)
    await sleep(1)

    expect(t.ownerID).toBe('person')

    const t2 = new Pet({ id: 'pet2' })

    p.pets = Promise.resolve([t, t2])

    await sleep(1)

    expect(p.petsIDs).toStrictEqual([t.id, t2.id])
  })
})
