import { after, before, describe, test } from 'node:test'
import { TestProcessorServer } from '../../testing/index.js'
import { expect } from 'chai'
import { BTCChainId } from '@sentio/chain'
import { State } from '@sentio/runtime'
import { BTCProcessor } from '../btc-processor.js'
import { BTCContext, Transaction } from '../types.js'
import testData from './test-data.json'
import { RichValue } from '@sentio/protos'

describe('btc processor tests', () => {
  const service = new TestProcessorServer(async () => {
    BTCProcessor.bind({
      chainId: BTCChainId.BTC_MAINNET
    }).onTransaction(
      async (tx: Transaction, ctx: BTCContext) => {
        const from = tx.vin[0].prevout.scriptpubkey_address
        const to = tx.vout[0].scriptpubkey_address
        const amount = tx.vout[0].value
        ctx.eventLogger.emit('Transaction', {
          distinctId: `${tx.txid}`,
          fee: tx.fee,
          message: `transaction from: ${from} to: ${to} amount: ${amount}`
        })
      },
      {
        field: 'vout.scriptpubkey_asm',
        prefix: 'OP_RETURN 62626e31'
      }
    )
  })
  before(async () => {
    await service.start()
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs.length).gte(1)
    expect(config.contractConfigs[0].btcTransactionConfigs.length).gte(1)
    const filter = config.contractConfigs[0].btcTransactionConfigs[0].filters[0]
    expect(filter.fieldFilters?.filters[0]).deep.equal({
      field: 'vout.scriptpubkey_asm',
      prefix: {
        stringValue: 'OP_RETURN 62626e31'
      }
    })
  })

  test('test on transaction ', async () => {
    const res = await service.btc.testOnTransactions(testData, BTCChainId.BTC_MAINNET)

    const events = res.result?.events
    expect(events).length(1)
    expect(events?.[0]?.message).contains('transaction from: ')
    // expect(events?.[1]?.message).contains('votes: 1')
  })

  after(async () => {
    State.reset()
  })
})
