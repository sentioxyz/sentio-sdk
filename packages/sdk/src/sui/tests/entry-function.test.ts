import { before, describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { expect } from 'chai'
import { TestProcessorServer, countersOf } from '../../testing/index.js'
import { router } from './types/testnet/wisp.js'
import { SuiChainId } from '@sentio/chain'

describe('Test entry call decoding', () => {
  const service = new TestProcessorServer(async () => {
    router.bind().onEntrySwapExactInput_(async (call, ctx) => {
      ctx.meter.Counter('c').add(1)
    })
  })

  before(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)
  })

  test('Check call dispatch', async () => {
    const res = await service.sui.testEntryFunctionCall(testData as any, SuiChainId.SUI_TESTNET)
    expect(countersOf(res.result)).length(1)
  })
})

// gRPC ExecutedTransaction fixture (converted offline from the original on-chain tx;
// the source tx is pruned from public fullnodes so it cannot be refetched live).
const testData = JSON.parse(readFileSync(new URL('./data/entry-function.json', import.meta.url), 'utf8'))
