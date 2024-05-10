import { TestProcessorServer } from '../../testing/index.js'
import { FuelChainId } from '@sentio/chain'
import abi from './abis/counter-contract-abi.json'
import { expect } from 'chai'
import testData from './test-data.json'
import { afterAll } from '@jest/globals'
import { State } from '@sentio/runtime'
import { CounterContractProcessor } from './types/CounterContractProcessor.js'

describe('typed fuel processor tests', () => {
  const ADDRESS = '0xa50da2237febdd382512180b4a0dc6d4e358a8d13ad6e95c350f367a1ba68129'

  const service = new TestProcessorServer(async () => {
    CounterContractProcessor.bind({
      address: ADDRESS,
      chainId: FuelChainId.FUEL_TESTNET_BETA_V5,
      abi
    }).onCallComplex(async (call, ctx) => {
      ctx.eventLogger.emit('call complex', {
        distinctId: `${ctx.transaction?.id}_${ctx.transaction?.blockId}`,
        message: `complex call: (${call.args}) -> (${call.returnValue})`
      })
      const foo = call.getLog1()[0]
      if (foo) {
        ctx.eventLogger.emit('foo', {
          distinctId: `${ctx.transaction?.id}_${ctx.transaction?.blockId}`,
          message: `foo: ${foo}`
        })
      }
    })
  })
  beforeAll(async () => {
    await service.start()
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
    expect(config.contractConfigs[0].fuelCallConfigs).length(1)
  })

  test('test onCall ', async () => {
    const res = await service.fuel.testOnTransaction(testData, FuelChainId.FUEL_TESTNET_BETA_V5)

    const events = res.result?.events
    expect(events).length(2)
    expect(events?.[0]?.message).contains('complex call')

    expect(events?.[1]?.message).contains('foo')
  })

  afterAll(async () => {
    State.reset()
  })
})
