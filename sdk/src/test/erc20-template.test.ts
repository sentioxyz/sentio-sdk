// TODO move out of this package

import { expect } from 'chai'

import { StartRequest } from '..'
import Long from 'long'
import { TestProcessorServer } from './test-processor-server'

describe('Test Template', () => {
  const service = new TestProcessorServer()

  beforeAll(async () => {
    service.setup()
    require('./erc20-template')
    const request: StartRequest = {
      templateInstances: [
        {
          contract: {
            address: 'dynamic2',
            name: 'dynamic2',
            chainId: '1',
            abi: '',
          },
          startBlock: Long.ZERO,
          endBlock: Long.ZERO,
          templateId: 0,
        },
      ],
    }
    await service.start(request)
  })

  test('Check template instantiate', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.contractConfigs?.[1].contract?.name).equals('dynamic2')
    expect(config.templateInstances).length(1)
  })
})
