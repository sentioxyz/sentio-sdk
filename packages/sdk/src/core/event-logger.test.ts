import { BasicFieldType, Fields, fieldsToProtos } from './event-logger.js'

describe('event logger tests', () => {
  test('basic type', async () => {
    const fields = {
      phase: BasicFieldType.STRING,
      reward: BasicFieldType.DOUBLE,
      isX2: BasicFieldType.BOOL
    }

    const fieldsProto = fieldsToProtos(fields)
    expect(fieldsProto).toEqual([
      {
        name: 'phase',
        basicType: BasicFieldType.STRING
      },
      {
        name: 'reward',
        basicType: BasicFieldType.DOUBLE
      },
      {
        name: 'isX2',
        basicType: BasicFieldType.BOOL
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
    expect(fieldsProto).toEqual([
      {
        name: 'phase',
        basicType: BasicFieldType.STRING
      },
      {
        name: 'xx',
        structType: {
          fields: [
            {
              name: 'aaa',
              basicType: BasicFieldType.BOOL
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
    expect(fieldsProto).toEqual([
      {
        name: 'coin',
        coinType: {
          symbol: 'WETH'
        }
      }
    ])
  })
})
