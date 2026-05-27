import { before, describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { expect } from 'chai'
import { TestProcessorServer } from '../../testing/index.js'
import { SuiNetwork } from '../network.js'
import { sui_system, validator } from '../builtin/0x3.js'
import { SuiObjectProcessorTemplate } from '../sui-object-processor-template.js'

describe('Test Sui Template Example', () => {
  let round = 0
  const service = new TestProcessorServer(async () => {
    const template = new SuiObjectProcessorTemplate().onTimeInterval(() => {})

    validator.bind({ network: SuiNetwork.TEST_NET }).onEventStakingRequestEvent((evt, ctx) => {
      template.bind({ objectId: '0x56a' + round }, ctx)
    })

    sui_system.bind({ network: SuiNetwork.TEST_NET }).onEntryRequestAddStake((call, ctx) => {
      template.unbind({ objectId: '0x56a' + round }, ctx)
    })
  })

  before(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(0)
    expect(config.templateInstances).length(0)
  })

  test('Check template changes', async () => {
    // single round test
    let res = await service.sui.testEvent(testData as any, SuiNetwork.TEST_NET)
    let config = await service.getConfig({})
    expect(res.result?.states?.configUpdated).equals(true)
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(1)
    expect(config.templateInstances).length(1)

    res = await service.sui.testEntryFunctionCall(testData as any, SuiNetwork.TEST_NET)
    config = await service.getConfig({})
    expect(res.result?.states?.configUpdated).equals(true)
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(0)
    expect(config.templateInstances).length(0)

    // multi round test
    await service.sui.testEvent(testData as any, SuiNetwork.TEST_NET)

    round = 1
    await service.sui.testEvent(testData as any, SuiNetwork.TEST_NET)
    config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(2)
    expect(config.templateInstances).length(2)
    expect(config.accountConfigs[0].moveIntervalConfigs[0].intervalConfig?.handlerId).equals(2)
    expect(config.accountConfigs[1].moveIntervalConfigs[0].intervalConfig?.handlerId).equals(3)

    round = 0
    res = await service.sui.testEntryFunctionCall(testData as any, SuiNetwork.TEST_NET)
    config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(1)
    expect(config.templateInstances).length(1)
    expect(config.accountConfigs[0].moveIntervalConfigs[0].intervalConfig?.handlerId).equals(2)

    round = 1
    res = await service.sui.testEntryFunctionCall(testData as any, SuiNetwork.TEST_NET)
    config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.accountConfigs).length(0)
    expect(config.templateInstances).length(0)

    // make sure extra unbind won't crash server
    round = 1
    await service.sui.testEntryFunctionCall(testData as any, SuiNetwork.TEST_NET)
    round = 0
    await service.sui.testEntryFunctionCall(testData as any, SuiNetwork.TEST_NET)
  })
})

// gRPC ExecutedTransaction fixture (converted offline from the original on-chain tx;
// the source tx is pruned from public fullnodes so it cannot be refetched live).
const testData = JSON.parse(readFileSync(new URL('./data/sui-template.json', import.meta.url), 'utf8'))
