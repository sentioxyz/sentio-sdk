import { SouffleChefCampaign, CandyMachine } from './types/aptos/souffle'
import { token } from '../builtin/aptos/0x3'
import { aptos_account, voting } from '../builtin/aptos/0x1'
import { TYPE_REGISTRY } from '../aptos/types'
import { AccountEventTracker } from '@sentio/sdk'
import { AptosAccountProcessor } from '../aptos/aptos-processor'

const accountTracker = AccountEventTracker.register('pull')

SouffleChefCampaign.bind({ startVersion: 3212312n })
  .onEntryPullTokenV2((call: SouffleChefCampaign.PullTokenV2Payload, ctx) => {
    ctx.meter.Counter('call_num').add(1)
    ctx.meter.Counter('pulled').add(call.arguments_typed[3])
  })
  .onEventPullTokenEvent((evt, ctx) => {
    ctx.meter.Counter('burned').add(1)
    accountTracker.trackEvent(ctx, { distinctId: ctx.transaction.sender })
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
    const events = TYPE_REGISTRY.filterAndDecodeEvents<token.DepositEvent>('0x3::token::DepositEvent', txn.events)
    for (const event of events) {
      // const depositEventInstance = DEFAULT_TYPE_REGISTRY.decodeEvent(event) as DepositEventInstance
      ctx.meter.Counter('deposit_token_count').add(event.data_typed.amount)
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

AptosAccountProcessor.bind({ address: '0x1' }).onTimeInterval((resources, ctx) => {
  ctx.meter.Counter('onTimer').add(1)
}, 10000)

aptos_account.bind().onEntryCreateAccount((call, ctx) => {
  ctx.meter.Counter('xx').add(1)
})
