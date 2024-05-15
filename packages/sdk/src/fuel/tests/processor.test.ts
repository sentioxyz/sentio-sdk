import { TestProcessorServer } from '../../testing/index.js'
import { expect } from 'chai'
import { FuelProcessor } from '../fuel-processor.js'
import { FuelChainId } from '@sentio/chain'
import abi from './abis/counter-contract-abi.json'
import testData from './test-data.json'
import testTransferData from './transfer-data.json'
import { FuelAssetProcessor } from '../asset-processor.js'
import { afterAll } from '@jest/globals'
import { State } from '@sentio/runtime'
import { BaseAssetId } from 'fuels'

describe('fuel network tests', () => {
  const ADDRESS = '0xa50da2237febdd382512180b4a0dc6d4e358a8d13ad6e95c350f367a1ba68129'

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
      .onCall('complex', async (call, ctx) => {
        ctx.eventLogger.emit('call', {
          distinctId: `${ctx.transaction?.id}_${ctx.transaction?.blockId}`,
          message: `complex call: (${call.functionScopes[0].getCallConfig().args}) -> (${call.value})`
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
    expect(events?.[1]?.message).contains('complex call')
  })

  afterAll(async () => {
    State.reset()
  })
})

describe('fuel network transfer tests', () => {
  const service = new TestProcessorServer(async () => {
    FuelAssetProcessor.bind({
      chainId: FuelChainId.FUEL_TESTNET_BETA_V5
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
  beforeAll(async () => {
    await service.start()
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
    expect(config.contractConfigs[0].assetConfigs).length(1)
  })

  test('test onTransfer ', async () => {
    const res = await service.fuel.testOnTransaction(testTransferData, FuelChainId.FUEL_TESTNET_BETA_V5)

    const events = res.result?.events
    expect(events).length(1)
    expect(events?.[0]?.message).contains('transfered')
    expect(events?.[0]?.attributes).to.deep.equal({
      attributes: {
        amount: '100000',
        from: '0xd3fe20c8ff68a4054d8587ac170c40db7d1e200208a575780542bd9a7e3eec08',
        to: '0xd914531010bb159182a20429f04a438eff268cad1c288df23b92dfb388cb5a24'
      }
    })
  })

  afterAll(async () => {
    State.reset()
  })
})
