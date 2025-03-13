import { after, before, describe, test } from 'node:test'
import { TestProcessorServer } from '../../testing/index.js'
import { StarknetChainId } from '@sentio/chain'
import { expect } from 'chai'
import eventsData from './events-data.json' with { type: 'json' }
import { State } from '@sentio/runtime'
import { VotingContractProcessor } from './types/VotingContract-processor.js'

const testData = eventsData.result.events

describe('typed starknet processor tests', () => {
  const service = new TestProcessorServer(async () => {
    VotingContractProcessor.bind({})
      .onVoteEvent(async (event, ctx) => {
        ctx.eventLogger.emit('VoteEvent', {
          distinctId: `${event.transactionHash}`,
          message: `vote event from: ${event.data.voter} ,vote: ${event.data.vote}`
        })
      })
      .onVoteEvent2(async (event, ctx) => {
        const contract = ctx.getContract()
        const result = await contract.get_votes()
        ctx.eventLogger.emit('VoteEvent2', {
          distinctId: `${event.transactionHash}`,
          message: `votes: ${result[0]} ${result[1]}`
        })
      })
  })
  before(async () => {
    await service.start()
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs.length).gte(1)
    // expect(config.contractConfigs[0].fuelCallConfigs.length).gte(1)
  })

  // skip for now until onCall is fixed

  test('test onEvent ', async () => {
    const res = await service.starknet.testOnEvents(testData, StarknetChainId.STARKNET_SEPOLIA)

    const events = res.result?.events
    expect(events).length(1)
    expect(events?.[0]?.message).contains(
      'vote event from: 727007954703743980176330901219137431679725380584151936802286768559938968729 ,vote: 1'
    )
    // expect(events?.[1]?.message).contains('votes: 1')
  })

  test('test contract call ', async () => {
    const res = await service.starknet.testOnEvents(testData, StarknetChainId.STARKNET_SEPOLIA)

    const events = res.result?.events
    expect(events).length(1)
    expect(events?.[0]?.message).contains('votes: 0 1')
    // expect(events?.[1]?.message).contains('votes: 1')
  })

  after(async () => {
    State.reset()
  })
})
