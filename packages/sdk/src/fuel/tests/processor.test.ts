import { TestProcessorServer } from '../../testing/index.js'
import { expect } from 'chai'
import { FuelProcessor } from '../fuel-processor.js'
import { FuelChainId } from '@sentio/chain'
import abi from './abis/counter-contract-abi.json'
import testData from './test-data.json'

describe('fuel network tests', () => {
  const ADDRESS = '0x730adcb9974977e0f4fd46488b6aac04dade7d846d15ca026bff61279e265813'

  const service = new TestProcessorServer(async () => {
    FuelProcessor.bind({
      address: ADDRESS,
      chainId: FuelChainId.FUEL_TESTNET_BETA_V5,
      abi
    })
      .onTransaction(async (tx, ctx) => {
        ctx.eventLogger.emit('tx', {
          distinctId: tx.id,
          message: 'status is ' + tx.status
        })
      })
      .onCall('increment', async (call, ctx) => {
        ctx.eventLogger.emit('call', {
          distinctId: `${ctx.transaction?.id}_${ctx.transaction?.blockId}`,
          message: `increment call: (${call.functionScopes[0].getCallConfig().args}) -> (${call.value})`
        })
      })
  })
  beforeAll(async () => {
    await service.start()
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
    expect(config.contractConfigs[0].fuelCallConfigs).length(2)
  })

  test('test onTransaction ', async () => {
    const res = await service.fuel.testOnTransaction(testData, FuelChainId.FUEL_TESTNET_BETA_V5)

    const events = res.result?.events
    expect(events).length(2)
    expect(events?.[0]?.message).to.equal('status is success')
  })

  test('test onCall ', async () => {
    const res = await service.fuel.testOnTransaction(testData, FuelChainId.FUEL_TESTNET_BETA_V5)

    const events = res.result?.events
    expect(events).length(2)
    expect(events?.[1]?.message).contains('increment call')
  })
})
