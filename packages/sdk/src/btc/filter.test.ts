import { filters2Proto, TransactionFilter } from './filter.js'
import { describe, test } from 'node:test'
import { expect } from 'chai'
import { BTCTransactionFilter } from '@sentio/protos'

const stakingFilter: TransactionFilter = {
  filter: [{ blockheight: { gte: 850000 } }],
  outputFilter: {
    n: 1,
    script_asm: { prefix: 'OP_RETURN 62626e31' }
  }
}

const outboundFilter: TransactionFilter = {
  filter: [{ blockheight: { gte: 850000 } }],
  inputFilter: {
    preTransaction: {
      outputFilter: {
        n: { eq: 1 },
        script_asm: { prefix: 'OP_RETURN 62626e31' }
      }
    }
  }
}

describe('Convert filter to proto', () => {
  test('staking filter', async () => {
    const proto = filters2Proto(stakingFilter)
    expect(proto).length(1)

    const writer = BTCTransactionFilter.encode(proto[0])
    const bytes = writer.finish()
    const hex = Buffer.from(bytes).toString('hex')
    console.log(hex)
  })

  test('outbound filter', async () => {
    const proto = filters2Proto(outboundFilter)
    expect(proto).length(1)
    const writer = BTCTransactionFilter.encode(proto[0])
    const bytes = writer.finish()
    const hex = Buffer.from(bytes).toString('hex')
    console.log(hex)
  })
})
