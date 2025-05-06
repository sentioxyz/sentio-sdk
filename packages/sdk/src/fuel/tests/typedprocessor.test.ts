import { before, after, describe, test } from 'node:test'
import { TestProcessorServer } from '../../testing/index.js'
import { FuelChainId } from '@sentio/chain'
import { expect } from 'chai'
import testData from './test-data.json' with { type: 'json' }
import { State } from '@sentio/runtime'
import { CounterContractProcessor } from './types/CounterContractProcessor.js'

describe('typed fuel processor tests', () => {
  const ADDRESS = '0xdB0d550935d601c45791bA18664f0A821C11745B1f938E87f10a79e21988e850'

  const service = new TestProcessorServer(async () => {
    CounterContractProcessor.bind({
      address: '*',
      chainId: FuelChainId.FUEL_TESTNET
    })
      /*.onCallComplex(async (call, ctx) => {
        ctx.eventLogger.emit('call complex', {
          distinctId: `${ctx.transaction?.id}_${ctx.transaction?.blockId}`,
          message: `complex call: (${call.args}) -> (${call.returnValue})`
        })
        const foo = call.getLogsOfTypeFoo()[0]
        if (foo) {
          ctx.eventLogger.emit('foo', {
            distinctId: `${ctx.transaction?.id}_${ctx.transaction?.blockNumber}`,
            message: `foo: ${foo}`
          })
        }
      })*/
      .onLogFoo(async (log, ctx) => {
        ctx.eventLogger.emit('log foo', {
          distinctId: `${ctx.transaction?.id}_${ctx.transaction?.blockNumber}_${log.receiptIndex}`,
          message: `log foo: ${log.data.bar.asBigDecimal()}`
        })
      })
  })
  before(async () => {
    await service.start()
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs.length).gte(1)
    expect(config.contractConfigs[0].fuelReceiptConfigs.length).gte(1)
    // expect(config.contractConfigs[0].fuelCallConfigs.length).gte(1)
  })

  // skip for now until onCall is fixed
  test.skip('test onCall ', async () => {
    const res = await service.fuel.testOnTransaction(testData, FuelChainId.FUEL_TESTNET)

    const events = res.result?.events
    expect(events).length(3)
    expect(events?.[0]?.message).contains('complex call')

    expect(events?.[1]?.message).contains('foo')
  })

  test('test onLog ', async () => {
    const res = await service.fuel.testOnTransaction(testData, FuelChainId.FUEL_TESTNET)
    // const res = await service.fuel.testOnTransactionByID(FuelChainId.FUEL_TESTNET, "0xc6c75b1bd6896a596123ad3447725b5e84861bf5568852c4426a24f176121755")

    const events = res.result?.events
    expect(events).length(2)
    expect(events?.[0]?.message).contains('log foo')
    expect(events?.[0]?.metadata?.address).eq(ADDRESS)
  })

  after(async () => {
    State.reset()
  })
})
