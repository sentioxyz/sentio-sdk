import { TestProcessorServer } from '../../testing/index.js'
import { expect } from 'chai'
import { CosmosChainId } from '@sentio/chain'
import testData from './test-data.json'
import { afterAll } from '@jest/globals'
import { State } from '@sentio/runtime'
import { CosmosProcessor } from '../index.js'

describe('cosmos network tests', () => {
  const ADDRESS = '70E259E1D22AD62FCB871FCFB6A55C95A0C8FFD819D6CD3DB517AE04D7A1E3AD'

  const service = new TestProcessorServer(async () => {
    CosmosProcessor.bind({
      address: ADDRESS,
      chainId: CosmosChainId.INJECTIVE_MAINNET
    }).onLogEvent(['message'], async (log, event, ctx) => {
      let i = 0

      ctx.eventLogger.emit(event.type, {
        distinctId: `${ctx.transaction.txhash}_${log.msg_index}_${i++}`,
        message: log.log + event.type,
        attributes: JSON.stringify(event.attributes)
      })
    })
  })
  beforeAll(async () => {
    await service.start()
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs.length).gte(1)
    expect(config.contractConfigs[0].cosmosLogConfigs.length).gte(1)
  })

  test('test onLog ', async () => {
    const res = await service.cosmos.testOnTransaction(testData, CosmosChainId.INJECTIVE_MAINNET)

    const events = res.result?.events
    expect(events).length(1)
    expect(events?.[0]?.message).contains('message')
  })

  afterAll(async () => {
    State.reset()
  })
})
