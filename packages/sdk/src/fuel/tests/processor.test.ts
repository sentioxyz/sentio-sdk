import { TestProcessorServer } from '../../testing/index.js'
import { expect } from 'chai'
import { FuelProcessor } from '../fuel-processor.js'
import { FuelChainId } from '@sentio/chain'
import abi from './abis/counter-contract-abi.json'
import testData from './test-data.json'
import { afterAll } from '@jest/globals'
import { State } from '@sentio/runtime'

describe('fuel network tests', () => {
  const ADDRESS = '0xdb0d550935d601c45791ba18664f0a821c11745b1f938e87f10a79e21988e850'

  const service = new TestProcessorServer(async () => {
    FuelProcessor.bind({
      address: ADDRESS,
      chainId: FuelChainId.FUEL_TESTNET,
      //@ts-ignore fuel abi changed
      abi
    }).onTransaction(async (tx, ctx) => {
      ctx.eventLogger.emit('tx', {
        distinctId: tx.id,
        message: 'status is ' + tx.status
      })
    })
    /*  .onCall('complex', async (call, ctx) => {
        ctx.eventLogger.emit('call', {
          distinctId: `${ctx.transaction?.id}_${ctx.transaction?.blockId}`,
          message: `complex call: (${call.functionScopes[0].getCallConfig().args}) -> (${call.value})`
        })
      })*/
  })
  beforeAll(async () => {
    await service.start()
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs.length).gte(1)
    expect(config.contractConfigs[0].fuelCallConfigs.length).gte(1)
  })

  // skip for now until onCall is fixed
  test.skip('test onTransaction ', async () => {
    const res = await service.fuel.testOnTransaction(testData, FuelChainId.FUEL_TESTNET)

    const events = res.result?.events
    expect(events).length(2)
    expect(events?.[0]?.message).to.equal('status is success')
  })

  // skip for now until onCall is fixed
  test.skip('test onCall ', async () => {
    const res = await service.fuel.testOnTransaction(testData, FuelChainId.FUEL_TESTNET)

    const events = res.result?.events
    expect(events).length(2)
    expect(events?.[1]?.message).contains('complex call')
  })

  afterAll(async () => {
    State.reset()
  })
})
