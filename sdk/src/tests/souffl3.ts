import { SouffleChefCampaign, CandyMachine } from './types/aptos/souffle'
import { token } from '../builtin/aptos/0x3'
import { coin, voting } from '../builtin/aptos/0x1'
import { DEFAULT_TYPE_REGISTRY } from '../aptos/types'
import DepositEventInstance = coin.DepositEventInstance

SouffleChefCampaign.bind({ startVersion: 3212312 })
  .onEntryPullTokenV2((call: SouffleChefCampaign.PullTokenV2Payload, ctx) => {
    ctx.meter.Counter('call_num').add(1)
    ctx.meter.Counter('pulled').add(call.arguments_typed[3])
  })
  .onEventPullTokenEvent((evt, ctx) => {
    console.log(evt.data_typed.receiver)
    ctx.meter.Counter('burned').add(1)
  })
  .onEvent(
    (event, ctx) => {
      ctx.meter.Counter('evt_num').add(1)
    },
    {
      type: '0x1::coin::DepositEvent',
    }
  )
  .onTransaction((txn, ctx) => {
    if (txn.events) {
      for (const event of txn.events) {
        if (event && event.type === '0x3::token::DepositEvent') {
          // const typedEvent = this.dec
          const depositEventInstance = DEFAULT_TYPE_REGISTRY.decodeEvent(event) as DepositEventInstance
          ctx.meter.Counter('deposit_token_count').add(depositEventInstance.data_typed.amount)
        }
      }
    }
  })

CandyMachine.bind().onEntryPullToken((call: CandyMachine.PullTokenPayload, ctx) => {
  ctx.meter.Counter('pulled').add(call.arguments[2])
})

token.bind().onEventDepositEvent((evt: token.DepositEventInstance, ctx) => {
  ctx.meter.Gauge('version').record(evt.data_typed.id.property_version)
  ctx.meter.Counter('deposit').add(evt.data_typed.amount, { token: evt.data_typed.id.token_data_id.name })
})

voting.bind().onEventCreateProposalEvent((evt, ctx) => {
  // console.log(evt)
  evt.data_typed.expiration_secs + evt.data_typed.expiration_secs
  ctx.meter.Gauge('size').record(evt.data_typed.metadata.data.length)
})
