// TODO move out of this package

import { expect } from 'chai'

import { ProcessInstructionRequest, ProcessorServiceImpl } from '..'

import { CallContext } from 'nice-grpc-common/src/server/CallContext'
import Long from 'long'
import { cleanTest } from './clean-test'

describe('Test Server with Solana Example', () => {
  const service = new ProcessorServiceImpl(undefined)
  const testContext: CallContext = <CallContext>{}

  before(async () => {
    cleanTest()

    require('./mirrorworld')
    require('./wormhole-token-bridge')
    await service.start({ templateInstances: [] }, testContext)
  })

  it('check configuration ', async () => {
    const config = await service.getConfig({}, testContext)
    expect(config.contractConfigs).length(2)
  })

  it('Check mirrorworld instruction dispatch', async () => {
    const request: ProcessInstructionRequest = {
      instructions: [
        {
          instructionData: 'CACadoFwjNvan4GP8gh3Jtm1qdeoKX5j2SbSNEiB',
          slot: Long.fromNumber(0),
          programAccountId: 'F78NhTC9XmP1DKsCBRz5LGdQc4n4yFbj2dURiv7T9gGZ',
        },
      ],
    }
    const res = await service.processInstruction(request, testContext)
    expect(res.result?.counters).length(3)
    expect(res.result?.histograms).length(0)
    expect(res.result?.counters[0].metricValue?.bigInt).equal('5000000000')
  })

  it('Check wormhole token bridge instruction dispatch', async () => {
    const request: ProcessInstructionRequest = {
      instructions: [
        {
          instructionData: '33G5T8yXAQWdH8FX7fTy1mBJ6e4dUKfQWbViSrT7qJjpS8UAA3ftEQx9sNzrkaJm56xtENhDsWf',
          slot: Long.fromNumber(0),
          programAccountId: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
        },
      ],
    }
    const res = await service.processInstruction(request, testContext)
    expect(res.result?.counters).length(1)
    expect(res.result?.histograms).length(0)
    expect(res.result?.counters[0].metadata?.blockNumber.toInt()).equal(0)
    expect(res.result?.counters[0].metricValue?.doubleValue).equal(1000000)
  })
})
