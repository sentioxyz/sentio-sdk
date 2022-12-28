import { TestProcessorServer } from '@sentio/sdk/lib/testing'

describe('Test Processor', () => {
  const service = new TestProcessorServer(() => require('./processor'))

  beforeAll(async () => {
    await service.start()
  })

  test('has config', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs.length > 0)
  })
})
