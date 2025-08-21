import { describe, it } from 'node:test'
import assert from 'assert'
import { mergeSchemas } from './database-schema.js'
import { EntityClass } from '../store/index.js'

// Mock EntityClass implementations for testing
class MockUser {
  constructor(data: Partial<MockUser>) {
    Object.assign(this, data)
  }
  id!: string
  name!: string
}

class MockProduct {
  constructor(data: Partial<MockProduct>) {
    Object.assign(this, data)
  }
  id!: string
  title!: string
  price!: number
}

class MockOrder {
  constructor(data: Partial<MockOrder>) {
    Object.assign(this, data)
  }
  id!: string
  userId!: string
  total!: number
}

describe('mergeSchemas', () => {
  it('should merge single schema correctly', () => {
    const schema = {
      source: 'type User { id: String! name: String! }',
      entities: {
        User: MockUser as EntityClass<MockUser>
      }
    }

    const result = mergeSchemas([schema])

    assert.strictEqual(result, 'type User {\n  id: String!\n  name: String!\n}\n')
  })

  it('should merge multiple schemas with different entities', () => {
    const schema1 = {
      source: 'type User { id: String! name: String! }',
      entities: {
        User: MockUser as EntityClass<MockUser>
      }
    }

    const schema2 = {
      source: 'type Product { id: String! title: String! price: Float! }',
      entities: {
        Product: MockProduct as EntityClass<MockProduct>
      }
    }

    const result = mergeSchemas([schema1, schema2])

    const expected =
      'type User {\n  id: String!\n  name: String!\n}\ntype Product {\n  id: String!\n  title: String!\n  price: Float!\n}\n'
    assert.strictEqual(result, expected)
  })

  it('should handle duplicate entity names by keeping first one', () => {
    const schema1 = {
      source: 'type User { id: String! name: String! }',
      entities: {
        User: MockUser as EntityClass<MockUser>
      }
    }

    const schema2 = {
      source: 'type User { id: String! email: String! } type Product { id: String! title: String! }',
      entities: {
        User: MockUser as EntityClass<MockUser>, // Duplicate - should be ignored
        Product: MockProduct as EntityClass<MockProduct>
      }
    }

    const result = mergeSchemas([schema1, schema2])

    // Should keep first User definition and remove duplicate from source
    const expected =
      'type User {\n  id: String!\n  name: String!\n}\ntype Product {\n  id: String!\n  title: String!\n}\n'
    assert.strictEqual(result, expected)
  })
})
