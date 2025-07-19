import { iota_system, validator } from '@sentio/sdk/iota/builtin/0x3'

import { IotaNetwork } from '@sentio/sdk/iota'
import RequestAddStakePayload = iota_system.RequestAddStakePayload
import { request } from './types/iota/0x1b33a3cf7eb5dde04ed7ae571db1763006811ff6b7bb35b3d1c780de153af9dd.js'

validator.bind({ network: IotaNetwork.MAIN_NET }).onEventStakingRequestEvent(
  (evt, ctx) => {
    const amount_original = BigInt((evt.parsedJson as any).amount)
    const amount = evt.data_decoded.amount
    ctx.meter.Counter('amount').add(amount, { pool: evt.data_decoded.pool_id })
  },
  { allEvents: true }
)

iota_system.bind({ network: IotaNetwork.MAIN_NET }).onEntryRequestAddStake((call: RequestAddStakePayload, ctx) => {
  ctx.meter.Gauge('tmp').record(1, { coin: call.arguments_decoded[2] || '' })
})

request.bind({ network: IotaNetwork.MAIN_NET }).onEventRequestEvent((evt, ctx) => {
  ctx.meter.Counter('requests').add(1)
})

// IotaObjectProcessor.bind({
//   objectId: '0xa14f85860d6ce99154ecbb13570ba5fba1d8dc16b290de13f036b016fd19a29c'
// }).onTimeInterval(async (self, objects, ctx) => {
//   const fields = await ctx.coder.getDynamicFields(
//     objects,
//     BUILTIN_TYPES.U64_TYPE,
//     single_collateral.PortfolioVault.type()
//   )
//
//   ctx.meter.Gauge('fields_count').record(fields.length)
// })
