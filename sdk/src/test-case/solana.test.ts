// TODO move out of this package

import { expect } from 'chai'

import { HandlerType, ProcessInstructionRequest, ProcessorServiceImpl } from '..'

import { CallContext } from 'nice-grpc-common/src/server/CallContext'
import Long from 'long'
import { cleanTest } from './clean-test'
import { MetricValueToNumber } from '../numberish'
import { TextEncoder } from 'util'

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
    expect(config.contractConfigs).length(3)
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
    expect(res.result?.gauges).length(0)
    expect(MetricValueToNumber(res.result?.counters[0].metricValue)).equal(5000000000n)
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
    expect(res.result?.gauges).length(0)
    expect(res.result?.counters[0].metadata?.blockNumber.toInt()).equal(0)
    expect(MetricValueToNumber(res.result?.counters[0].metricValue)).equal(1000000)
    expect(res.result?.counters[0].runtimeInfo?.from).equals(HandlerType.INSTRUCTION)
  })

  it('Check SPLToken parsed instruction dispatch', async () => {
    const parsedIns = {
      "info": {
          "account": "2SDN4vEJdCdW3pGyhx2km9gB3LeHzMGLrG2j4uVNZfrx",
          "amount": "12000000000000",
          "mint": "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
          "mintAuthority": "BCD75RNBHrJJpW4dXVagL5mPjzRLnVZq4YirJdjEYMV7"
      },
      "type": "mintTo"
    }
    const request: ProcessInstructionRequest = {
      instructions: [
        {
          instructionData: '',
          slot: Long.fromNumber(0),
          programAccountId: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
          parsed: new TextEncoder().encode(JSON.stringify(parsedIns))
        },
      ],
    }
    const res = await service.processInstruction(request, testContext)
    expect(res.result?.counters).length(1)
    expect(res.result?.gauges).length(0)
    expect(res.result?.counters[0].metadata?.blockNumber.toInt()).equal(0)
    expect(MetricValueToNumber(res.result?.counters[0].metricValue)).equal(12000000000000)
    expect(res.result?.counters[0].runtimeInfo?.from).equals(HandlerType.INSTRUCTION)
  })
})
