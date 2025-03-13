import { after, before, describe, test } from 'node:test'
import { TestProcessorServer } from '../../testing/index.js'
import { expect } from 'chai'
import { BTCChainId } from '@sentio/chain'
import { State } from '@sentio/runtime'
import { BTCProcessor } from '../btc-processor.js'
import { BTCContext, Transaction } from '../types.js'
import testData from './test-data.json' with { type: 'json' }

describe('btc processor tests', () => {
  const service = new TestProcessorServer(async () => {
    BTCProcessor.bind({
      chainId: BTCChainId.BTC_MAINNET
    }).onTransaction(
      async (tx: Transaction, ctx: BTCContext) => {
        const from = tx.vin[0].pre_vout?.scriptPubKey?.address
        const to = tx.vout[0].scriptPubKey?.address
        const amount = tx.vout[0].value
        ctx.eventLogger.emit('Transaction', {
          distinctId: `${tx.txid}`,
          message: `transaction from: ${from} to: ${to} amount: ${amount}`
        })
      },
      {
        filter: [{ blockheight: { gte: 857589 } }],
        inputFilter: {
          preTransaction: {
            // the outbonding transaction's input should be the staking transaction
            outputFilter: {
              script_asm: {
                prefix: 'OP_RETURN 62626e31',
                length: 152
              }
            }
          }
        }
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
    // const filter = config.contractConfigs[0].btcTransactionConfigs[0].filters[0]
    // const cond = filter.outputFilter?.conditions
    // expect(cond).equals({ vout_index: { eq: 1 }, script_asm: {prefix: "OP_RETURN 62626e31"} })
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
