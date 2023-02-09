import { TestProcessorServer } from '@sentio/sdk/testing'

describe('Test Processor', () => {
  const service = new TestProcessorServer(() => import('./processor.js'))

  beforeAll(async () => {
    await service.start()
  })

  test('has valid config', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs.length > 0).toBeTruthy()
  })
})
