import { before, after, describe, test } from 'node:test'
import { TestProcessorServer } from '../../testing/index.js'
import { FuelAssetProcessor } from '../asset-processor.js'
import { FuelChainId } from '@sentio/chain'
import { ZeroBytes32 as BaseAssetId } from '@fuel-ts/address/configs'
import { expect } from 'chai'
import testTransferData from './transfer-data.json'
import { State } from '@sentio/runtime'

describe('fuel network transfer tests', () => {
  const service = new TestProcessorServer(async () => {
    FuelAssetProcessor.bind({
      chainId: FuelChainId.FUEL_TESTNET
    }).onTransfer(
      {
        assetId: BaseAssetId
      },
      async (transfer, ctx) => {
        const from = transfer.from[0].address
        const to = transfer.to[0].address
        const amount = transfer.to[0].amount
        ctx.eventLogger.emit('transfer', {
          distinctId: `${ctx.transaction?.id}_${ctx.transaction?.blockId}`,
          message: `transfered ${amount} from ${from} to ${to}`,
          attributes: {
            amount: amount.toString(),
            from,
            to
          }
        })
      }
    )
  })
  before(async () => {
    await service.start()
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
    expect(config.contractConfigs[0].assetConfigs).length(1)
  })

  test('test onTransfer ', async () => {
    const res = await service.fuel.testOnTransaction(testTransferData, FuelChainId.FUEL_TESTNET)

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
