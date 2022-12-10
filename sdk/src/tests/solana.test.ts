// TODO move out of this package

import { expect } from 'chai'

import { HandlerType, ProcessInstructionsRequest } from '..'

import Long from 'long'
import { TextEncoder } from 'util'
import { TestProcessorServer, firstCounterValue } from '../testing'

describe('Test Solana Example', () => {
  const service = new TestProcessorServer(() => {
    require('./wormhole-token-bridge')
  })

  beforeAll(async () => {
    await service.start({ templateInstances: [] })
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
  })

  test('Check wormhole token bridge instruction dispatch', async () => {
    const request: ProcessInstructionsRequest = {
      instructions: [
        {
          instructionData: '33G5T8yXAQWdH8FX7fTy1mBJ6e4dUKfQWbViSrT7qJjpS8UAA3ftEQx9sNzrkaJm56xtENhDsWf',
          slot: Long.fromNumber(12345),
          programAccountId: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
          accounts: ['worm'],
        },
        {
          instructionData: '33G5T8yXAQWdH8FX7fTy1mBJ6e4dUKfQWbViSrT7qJjpS8UAA3ftEQx9sNzrkaJm56xtENhDsWf',
          slot: Long.fromNumber(1),
          programAccountId: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
          accounts: ['worm'],
        },
      ],
    }
    const res = await service.processInstructions(request)
    expect(res.result?.counters).length(4)
    expect(res.result?.gauges).length(0)
    expect(res.result?.counters[0].metadata?.blockNumber.toInt()).equal(12345)
    expect(firstCounterValue(res.result, 'total_transfer_amount')).equal(1000000n)
    expect(firstCounterValue(res.result, 'worm')).equal(1000000n)
    expect(res.result?.counters[0].runtimeInfo?.from).equals(HandlerType.SOL_INSTRUCTIONS)
  })

  test('Check SPLToken parsed instruction dispatch', async () => {
    const parsedIns = {
      info: {
        account: '2SDN4vEJdCdW3pGyhx2km9gB3LeHzMGLrG2j4uVNZfrx',
        amount: '12000000000000',
        mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
        mintAuthority: 'BCD75RNBHrJJpW4dXVagL5mPjzRLnVZq4YirJdjEYMV7',
      },
      type: 'mintTo',
    }
    const request: ProcessInstructionsRequest = {
      instructions: [
        {
          instructionData: '',
          slot: Long.fromNumber(0),
          programAccountId: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
          parsed: new TextEncoder().encode(JSON.stringify(parsedIns)),
          accounts: [],
        },
      ],
    }
    const res = await service.processInstructions(request)
    expect(res.result?.counters).length(1)
    expect(res.result?.gauges).length(0)
    expect(res.result?.counters[0].metadata?.blockNumber.toInt()).equal(0)
    expect(firstCounterValue(res.result, 'totalWeth_supply')).equal(12000000000000)
    expect(res.result?.counters[0].runtimeInfo?.from).equals(HandlerType.SOL_INSTRUCTIONS)
  })
})
