import { before, after, describe, test } from 'node:test'
import { TestProcessorServer } from '../../testing/index.js'
import { FuelChainId } from '@sentio/chain'
import { expect } from 'chai'
import testData from './tx-data.json'
import { State } from '@sentio/runtime'
import { FuelGlobalProcessor } from '../global-processor.js'

describe('fuel network tx tests', () => {
  const service = new TestProcessorServer(async () => {
    FuelGlobalProcessor.bind({
      chainId: FuelChainId.FUEL_TESTNET
    }).onTransaction(async (tx, ctx) => {
      ctx.eventLogger.emit('tx', {
        distinctId: `${ctx.transaction?.id}_${ctx.transaction?.blockId}`,
        message: `tx  ${tx.id}`,
        attributes: {}
      })
    })
  })
  before(async () => {
    await service.start()
  })

  test.skip('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
    expect(config.contractConfigs[0].assetConfigs).length(1)
  })

  test.skip('test onTx ', async () => {
    const res = await service.fuel.testOnTransaction(testData, FuelChainId.FUEL_TESTNET)

    const events = res.result?.events
    expect(events).length(1)
    expect(events?.[0]?.message).contains('transfered')
    expect(events?.[0]?.attributes).to.deep.equal({
      attributes: {
        amount: '1000000',
        from: '0xd914531010bb159182a20429f04a438eff268cad1c288df23b92dfb388cb5a24',
        to: '0xd3fe20c8ff68a4054d8587ac170c40db7d1e200208a575780542bd9a7e3eec08'
      }
    })
  })

  after(async () => {
    State.reset()
  })
})
