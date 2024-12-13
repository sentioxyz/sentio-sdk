// import { pool } from './types/sui/swap.js'
//
// pool.bind().onEventLiquidityEvent((evt, ctx) => {
//   const amount = evt.data_decoded.x_amount
//   ctx.meter.Counter('amount').add(amount)
// })

import { sui_system, validator, staking_pool } from '@sentio/sdk/sui/builtin/0x3'

import { SuiNetwork, SuiObjectProcessor, BUILTIN_TYPES, SuiObjectTypeProcessor } from '@sentio/sdk/sui'
import RequestAddStakePayload = sui_system.RequestAddStakePayload
import { single_collateral } from './types/sui/testnet/0xebaa2ad3eacc230f309cd933958cc52684df0a41ae7ac214d186b80f830867d2.js'

validator.bind({ network: SuiNetwork.TEST_NET }).onEventStakingRequestEvent(
  (evt, ctx) => {
    const amount_original = BigInt((evt.parsedJson as any).amount)
    const amount = evt.data_decoded.amount
    // expect(amount_original).eq(amount)
    ctx.meter.Counter('amount').add(amount, { pool: evt.data_decoded.pool_id })
  },
  { allEvents: true }
)

sui_system.bind({ network: SuiNetwork.TEST_NET }).onEntryRequestAddStake((call: RequestAddStakePayload, ctx) => {
  ctx.meter.Gauge('tmp').record(1, { coin: call.arguments_decoded[2] || '' })
})

SuiObjectProcessor.bind({
  objectId: '0xa14f85860d6ce99154ecbb13570ba5fba1d8dc16b290de13f036b016fd19a29c'
}).onTimeInterval(async (self, objects, ctx) => {
  const fields = await ctx.coder.getDynamicFields(
    objects,
    BUILTIN_TYPES.U64_TYPE,
    single_collateral.PortfolioVault.type()
  )

  ctx.meter.Gauge('fields_count').record(fields.length)
})

SuiObjectTypeProcessor.bind({
  objectType: staking_pool.StakedSui.type()
})
  .onTimeInterval(
    (self, objects, ctx) => {
      ctx.meter.Gauge('voting_power').record(self.data_decoded.principal, { pool: self.data_decoded.pool_id })
    },
    60,
    60 * 24 * 30
  )
  .onObjectChange((changes, ctx) => {
    ctx.meter.Counter('updates').add(changes.length)
  })
