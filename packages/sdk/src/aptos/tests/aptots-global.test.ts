import { before, describe, test } from 'node:test'
import { expect } from 'chai'

import { TestProcessorServer } from '../../testing/index.js'
import { AptosGlobalProcessor } from '../aptos-processor.js'

describe('Test Global Aptos Prcessor', () => {
  const service = new TestProcessorServer(async () => {
    AptosGlobalProcessor.bind({ address: '*' }).onTimeInterval((resources, ctx) => {})
  })

  before(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(1)

    expect(config.contractConfigs[0].moveIntervalConfigs).length(1)
  })
})
