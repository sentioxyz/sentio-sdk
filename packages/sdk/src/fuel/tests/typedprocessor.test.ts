import { before, after, describe, test } from 'node:test'
import { TestProcessorServer } from '../../testing/index.js'
import { FuelChainId } from '@sentio/chain'
import { expect } from 'chai'
import testData from './test-data.json'
import { State } from '@sentio/runtime'
import { CounterContractProcessor } from './types/CounterContractProcessor.js'

describe('typed fuel processor tests', () => {
  const ADDRESS = '0xa50da2237febdd382512180b4a0dc6d4e358a8d13ad6e95c350f367a1ba68129'

  const service = new TestProcessorServer(async () => {
    CounterContractProcessor.bind({
      address: ADDRESS,
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

    const events = res.result?.events
    expect(events).length(2)
    expect(events?.[0]?.message).contains('log foo')
  })

  after(async () => {
    State.reset()
  })
})
