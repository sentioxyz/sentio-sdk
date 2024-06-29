import { describe, test } from 'node:test'
import assert from 'assert'
import { BasicFieldType, Fields, fieldsToProtos } from './event-logger.js'

describe('event logger tests', () => {
  test('basic type', async () => {
    const fields = {
      phase: BasicFieldType.STRING,
      reward: BasicFieldType.DOUBLE,
      isX2: BasicFieldType.BOOL
    }

    const fieldsProto = fieldsToProtos(fields)
    assert.deepEqual(fieldsProto, [
      {
        name: 'phase',
        basicType: BasicFieldType.STRING,
        coinType: undefined,
        structType: undefined
      },
      {
        name: 'reward',
        basicType: BasicFieldType.DOUBLE,
        coinType: undefined,
        structType: undefined
      },
      {
        name: 'isX2',
        basicType: BasicFieldType.BOOL,
        coinType: undefined,
        structType: undefined
      }
    ])
  })

  test('complex type', async () => {
    const fields = {
      phase: BasicFieldType.STRING,
      xx: {
        aaa: BasicFieldType.BOOL
      }
    }

    const fieldsProto = fieldsToProtos(fields)
    assert.deepEqual(fieldsProto, [
      {
        name: 'phase',
        basicType: BasicFieldType.STRING,
        coinType: undefined,
        structType: undefined
      },
      {
        name: 'xx',
        basicType: undefined,
        coinType: undefined,
        structType: {
          fields: [
            {
              name: 'aaa',
              basicType: BasicFieldType.BOOL,
              coinType: undefined,
              structType: undefined
            }
          ]
        }
      }
    ])
  })

  test('coin type', async () => {
    const fields: Fields = {
      coin: {
        symbol: 'WETH'
      }
    }
    const fieldsProto = fieldsToProtos(fields)
    assert.deepEqual(fieldsProto, [
      {
        name: 'coin',
        coinType: {
          symbol: 'WETH'
        },
        basicType: undefined,
        structType: undefined
      }
    ])
  })
})
