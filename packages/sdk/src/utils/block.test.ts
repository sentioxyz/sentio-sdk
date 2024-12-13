import { describe, test } from 'node:test'
import { estimateBlockNumberAtDate } from './block.js'
import { getProvider, State } from '@sentio/runtime'
import { loadTestProvidersFromEnv } from '@sentio/sdk/testing'

import { expect } from 'chai'

describe('block estimate', () => {
  State.reset()

  const haveProviders = loadTestProvidersFromEnv(['1'])

  const testIf = haveProviders ? test : test.skip

  testIf('get block number at mainnet', async () => {
    const targetDate = new Date('2023-05-02T00:00:00Z')
    const estimatedBlockNumber = await estimateBlockNumberAtDate(getProvider(), targetDate, 0)
    expect(estimatedBlockNumber).to.equal(17169395)
  })
})
