import { before, describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { expect } from 'chai'
import { TestProcessorServer } from '../../testing/index.js'
import { maven } from './types/0xae5e7c832b4a97f2473fcf80fdf2e7ef72bb9d23552bd05d7dd8d428dbb879b9.js'
import { SuiContext } from '../context.js'

describe('Test maven', () => {
  const service = new TestProcessorServer(async () => {
    maven.bind().onEntryExecuteCoinOperation(async (call: maven.ExecuteCoinOperationPayload, ctx: SuiContext) => {
      const sender = ctx.transaction.transaction?.sender
      const mavenId = call.arguments_decoded[1]
      const type = call.typeArguments[0]
      ctx.eventLogger.emit('maven', { sender, mavenId, type })
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
    const res = await service.sui.testEntryFunctionCall(mavenTestData as any)
    expect(res.result?.counters).length(0)
    expect(res.result?.events).length(1)
  })
})

// gRPC ExecutedTransaction fixture (converted offline from the original on-chain tx;
// the source tx is pruned from public fullnodes so it cannot be refetched live).
const mavenTestData = JSON.parse(readFileSync(new URL('./data/maven.json', import.meta.url), 'utf8'))
