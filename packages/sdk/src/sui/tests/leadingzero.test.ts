import { before, describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { expect } from 'chai'
import { TestProcessorServer, countersOf } from '../../testing/index.js'
import { event } from './types/0x00b53b0f4174108627fbee72e2498b58d6a2714cded53fac537034c220d26302.js'

describe('Test leading zero', () => {
  const service = new TestProcessorServer(async () => {
    event
      .bind({
        address: '0x0b53b0f4174108627fbee72e2498b58d6a2714cded53fac537034c220d26302'
      })
      .onEventPriceFeedUpdateEvent((evt, ctx) => {
        ctx.meter.Counter('test').add(1)
      })
  })

  before(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
    expect(config.contractConfigs[0].contract?.address).eq(
      '0x00b53b0f4174108627fbee72e2498b58d6a2714cded53fac537034c220d26302'
    )
  })

  test('Check call dispatch', async () => {
    const res = await service.sui.testEvent(testData as any)
    expect(countersOf(res.result)).length(1)
  })
})

// gRPC ExecutedTransaction fixture (converted offline from the original on-chain tx;
// the source tx is pruned from public fullnodes so it cannot be refetched live).
const testData = JSON.parse(readFileSync(new URL('./data/leadingzero.json', import.meta.url), 'utf8'))
