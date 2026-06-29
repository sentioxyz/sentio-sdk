import { before, describe, test } from 'node:test'
import { expect } from 'chai'
import { TestProcessorServer, countersOf, gaugesOf } from '../../testing/index.js'
import { SuiNetwork } from '../network.js'
import { dynamic_field } from '../builtin/0x2.js'
import { sui_system, validator } from '../builtin/0x3.js'
import { SuiObjectProcessor, SuiObjectTypeProcessor } from '../sui-object-processor.js'
import { MoveOwnerType } from '@sentio/protos'
import { BUILTIN_TYPES } from '@typemove/move'

describe('Test Sui Example', () => {
  const service = new TestProcessorServer(async () => {
    validator.bind({ network: SuiNetwork.TEST_NET }).onEventStakingRequestEvent((evt, ctx) => {
      const amount_original = BigInt((evt.json as any).amount)
      const amount = evt.data_decoded.amount
      expect(amount_original).eq(amount)
      ctx.meter.Counter('amount').add(amount, { pool: evt.data_decoded.pool_id })
    })

    sui_system.bind({ network: SuiNetwork.TEST_NET }).onEntryRequestAddStake((call, ctx) => {
      ctx.meter.Gauge('tmp').record(1, { coin: call.arguments_decoded[2] || '' })
    })

    SuiObjectProcessor.bind({ objectId: '0x56a' }).onTimeInterval((self, objects, ctx) => {
      ctx.meter.Gauge('size').record(objects.length)
    })

    SuiObjectTypeProcessor.bind({
      objectType: dynamic_field.Field.type(BUILTIN_TYPES.U64_TYPE, validator.Validator.type())
    })
      .onTimeInterval(
        (self, objects, ctx) => {
          ctx.meter
            .Gauge('validator')
            .record(self.data_decoded.value.voting_power, { address: self.data_decoded.value.metadata.primary_address })
        },
        60,
        60,
        { owned: false }
      )
      .onObjectChange((self, ctx) => {})
  })

  before(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(2)
    expect(config.accountConfigs[0].moveIntervalConfigs[0].ownerType).eq(MoveOwnerType.OBJECT)
    expect(config.accountConfigs[1].moveIntervalConfigs[0].ownerType).eq(MoveOwnerType.TYPE)
    expect(config.accountConfigs[1].moveResourceChangeConfigs[0].types[0]).eq(
      dynamic_field.Field.type(BUILTIN_TYPES.U64_TYPE, validator.Validator.type()).getSignature()
    )
  })

  test('Check event dispatch', async () => {
    const res = await service.sui.testEvent(testData as any, SuiNetwork.TEST_NET)
    expect(countersOf(res.result)).length(1)
    expect(gaugesOf(res.result)).length(0)
  })

  test('Check call dispatch', async () => {
    const res = await service.sui.testEntryFunctionCall(testData as any, SuiNetwork.TEST_NET)
    expect(countersOf(res.result)).length(0)
    expect(gaugesOf(res.result)).length(1)
  })
})

// gRPC ExecutedTransaction shape (as delivered by the gRPC-backed driver).
// Events decode from `events.events[].json`; function args decode from
// `programmableTransaction.inputs[].pure` (BCS bytes) via Argument.input index.
const hexToBytes = (hex: string): number[] => {
  const h = hex.replace(/^0x/, '')
  const out: number[] = []
  for (let i = 0; i < h.length; i += 2) out.push(parseInt(h.slice(i, i + 2), 16))
  return out
}

const VALIDATOR_ADDRESS = '0x6daaa84982e84af05db193f48afd979990af2d2a7aa65b398c398db9a79b603f'

const testData = {
  digest: '1Jo5RUSfLknKiGkZUxVxkWhTbX7CD3Jm3fQzaCEV3JM',
  transaction: {
    digest: '1Jo5RUSfLknKiGkZUxVxkWhTbX7CD3Jm3fQzaCEV3JM',
    sender: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8',
    kind: {
      data: {
        oneofKind: 'programmableTransaction',
        programmableTransaction: {
          inputs: [
            // input 0: pure u64 1013400000 (LE bytes) — referenced by SplitCoins
            { kind: 1 /* PURE */, pure: [64, 65, 103, 60, 0, 0, 0, 0] },
            // input 1: shared SuiSystemState object 0x5
            {
              kind: 3 /* SHARED */,
              objectId: '0x0000000000000000000000000000000000000000000000000000000000000005',
              version: 1n,
              mutable: true
            },
            // input 2: pure address (validator) — decoded into arguments_decoded[2]
            { kind: 1 /* PURE */, pure: hexToBytes(VALIDATOR_ADDRESS) }
          ],
          commands: [
            {
              command: {
                oneofKind: 'splitCoins',
                splitCoins: {
                  coin: { kind: 1 /* GAS */ },
                  amounts: [{ kind: 2 /* INPUT */, input: 0 }]
                }
              }
            },
            {
              command: {
                oneofKind: 'moveCall',
                moveCall: {
                  package: '0x0000000000000000000000000000000000000000000000000000000000000003',
                  module: 'sui_system',
                  function: 'request_add_stake',
                  typeArguments: [],
                  arguments: [
                    { kind: 2 /* INPUT */, input: 1 },
                    { kind: 3 /* RESULT */, result: 0 },
                    { kind: 2 /* INPUT */, input: 2 }
                  ]
                }
              }
            }
          ]
        }
      }
    }
  },
  events: {
    events: [
      {
        packageId: '0x0000000000000000000000000000000000000000000000000000000000000003',
        module: 'sui_system',
        sender: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8',
        eventType: '0x3::validator::StakingRequestEvent',
        json: {
          amount: '1013400000',
          epoch: '744',
          pool_id: '0x8f3c1872502008904d027ca7d2935434ad1c030174a77eabd8d4e0b6a1b38d77',
          staker_address: '0x4928b3478f47a5f845096fbe08cbaaa1e9122f8a3a3634c8454e2bafc46b7ad8',
          validator_address: VALIDATOR_ADDRESS
        }
      }
    ]
  },
  checkpoint: 233041n,
  timestamp: { seconds: 1680304142n, nanos: 717000000 }
}
