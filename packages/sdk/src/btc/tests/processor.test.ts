import { after, before, describe, test } from 'node:test'
import { TestProcessorServer } from '../../testing/index.js'
import { expect } from 'chai'
import { BTCChainId } from '@sentio/chain'
import { State } from '@sentio/runtime'
import { BTCProcessor } from '../btc-processor.js'
import { BTCContext, Transaction } from '../types.js'
import testData from './test-data.json'

describe('btc processor tests', () => {
  const service = new TestProcessorServer(async () => {
    BTCProcessor.bind({
      chainId: BTCChainId.BTC_MAINNET,
      address: 'bc1pjy5mq7vlqkq6nldxghauq0sqgh3hjdrp2adl7tcalkavt9ly5g8q3zkymk'
    }).onTransaction(async (tx: Transaction, ctx: BTCContext) => {
      const from = tx.vin[0].prevout.scriptpubkey_address
      const to = tx.vout[0].scriptpubkey_address
      const amount = tx.vout[0].value
      ctx.eventLogger.emit('Transaction', {
        distinctId: `${tx.txid}`,
        fee: tx.fee,
        message: `transaction from: ${from} to: ${to} amount: ${amount}`
      })
    })
  })
  before(async () => {
    await service.start()
  })

  test('check configuration ', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs.length).gte(1)
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
