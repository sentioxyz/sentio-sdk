// TODO move out of this package

import { expect } from 'chai'

import { ProcessorServiceImpl, setProvider, StartRequest } from '..'

import { CallContext } from 'nice-grpc-common/src/server/CallContext'
import * as path from 'path'
import * as fs from 'fs-extra'
import Long from 'long'
import { cleanTest } from './clean-test'

describe('Test Template', () => {
  const service = new ProcessorServiceImpl(undefined)
  const testContext: CallContext = <CallContext>{}

  before(async () => {
    cleanTest()

    const fullPath = path.resolve('chains-config.json')
    const chainsConfig = fs.readJsonSync(fullPath)
    setProvider(chainsConfig)

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
    await service.start(request, testContext)
  })

  it('Check template instantiate', async () => {
    const config = await service.getConfig({}, testContext)
    expect(config.contractConfigs).length(2)
    expect(config.contractConfigs?.[1].contract?.name).equals('dynamic2')
    expect(config.templateInstances).length(1)
  })
})
