import { describe, test } from 'node:test'
import assert from 'assert'
import { BasicFieldType, Fields, fieldsToProtos } from './event-logger.js'
import { CoinIDSchema, EventLogConfig_FieldSchema, EventLogConfig_StructFieldTypeSchema } from '@sentio/protos'
import { create } from '@bufbuild/protobuf'

describe('event logger tests', () => {
  test('basic type', async () => {
    const fields = {
      phase: BasicFieldType.STRING,
      reward: BasicFieldType.DOUBLE,
      isX2: BasicFieldType.BOOL
    }

    const fieldsProto = fieldsToProtos(fields)
    assert.deepEqual(fieldsProto, [
      create(EventLogConfig_FieldSchema, {
        name: 'phase',
        type: { case: 'basicType', value: BasicFieldType.STRING }
      }),
      create(EventLogConfig_FieldSchema, {
        name: 'reward',
        type: { case: 'basicType', value: BasicFieldType.DOUBLE }
      }),
      create(EventLogConfig_FieldSchema, {
        name: 'isX2',
        type: { case: 'basicType', value: BasicFieldType.BOOL }
      })
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
      create(EventLogConfig_FieldSchema, {
        name: 'phase',
        type: { case: 'basicType', value: BasicFieldType.STRING }
      }),
      create(EventLogConfig_FieldSchema, {
        name: 'xx',
        type: {
          case: 'structType',
          value: create(EventLogConfig_StructFieldTypeSchema, {
            fields: [
              create(EventLogConfig_FieldSchema, {
                name: 'aaa',
                type: { case: 'basicType', value: BasicFieldType.BOOL }
              })
            ]
          })
        }
      })
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
      create(EventLogConfig_FieldSchema, {
        name: 'coin',
        type: {
          case: 'coinType',
          value: create(CoinIDSchema, { id: { case: 'symbol', value: 'WETH' } })
        }
      })
    ])
  })
})
