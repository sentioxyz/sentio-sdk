import { describe, it } from 'node:test'
import { hash, events, CallData } from 'starknet'
import assert from 'assert'

import sierra from './testsierra.json' with { type: 'json' }

import test_events_data from './events-data.json' with { type: 'json' }

describe('Test Starknet event decode', () => {
  it('event name to keys', () => {
    const abiEvents = events.getAbiEvents(sierra.abi)
    const abiStructs = CallData.getAbiStruct(sierra.abi)
    const abiEnums = CallData.getAbiEnum(sierra.abi)

    const parsedEvent = events.parseEvents(test_events_data.result.events, abiEvents, abiStructs, abiEnums)[0]

    assert.ok(parsedEvent['contracts::VotingContract::VoteEvent'])
    assert.equal(parsedEvent['contracts::VotingContract::VoteEvent'].vote, 1n)

    assert.equal(
      hash.getSelectorFromName('VoteEvent'),
      '0x28d90b3294abf675757c5f5bbcdb07c80d54c4493bf7780c894065cd7ffd2ad'
    )

    assert.equal(
      hash.getSelectorFromName('VoteEvent2'),
      '0x287049ef9132747da4b46b0611d0e98f9e41853662bb58086713cd1125c66b1'
    )
  })
})
