import { AptosResourcesProcessor, defaultMoveCoder } from '../index.js'
import { SouffleChefCampaign, CandyMachine } from './types/souffle.js'
import { token } from '../builtin/0x3.js'
import { aptos_account, voting } from '../builtin/0x1.js'

SouffleChefCampaign.bind({ startVersion: 3212312n })
  .onEntryPullTokenV2((call: SouffleChefCampaign.PullTokenV2Payload, ctx) => {
    ctx.meter.Counter('call_num').add(1)
    ctx.meter.Counter('pulled').add(call.arguments_decoded[3])
  })
  .onEventPullTokenEvent((evt, ctx) => {
    ctx.meter.Counter('burned').add(1)
    ctx.eventLogger.emit('pull', { distinctId: ctx.transaction.sender })
  })
  .onTransaction(async (txn, ctx) => {
    const events = await defaultMoveCoder().filterAndDecodeEvents(token.DepositEvent.type(), txn.events)
    for (const event of events) {
      // const depositEventInstance = DEFAULT_TYPE_REGISTRY.decodeEvent(event) as DepositEventInstance
      ctx.meter.Counter('deposit_token_count').add(event.data_decoded.amount)
    }
  })

CandyMachine.bind().onEntryPullToken((call: CandyMachine.PullTokenPayload, ctx) => {
  ctx.meter.Counter('pulled').add(call.arguments[2])
})

token.bind().onEventDepositEvent((evt: token.DepositEventInstance, ctx) => {
  ctx.meter.Gauge('version').record(evt.data_decoded.id.property_version)
  ctx.meter.Counter('deposit').add(evt.data_decoded.amount, { token: evt.data_decoded.id.token_data_id.name })
})

voting.bind().onEventCreateProposalEvent((evt, ctx) => {
  ctx.meter.Gauge('size').record(evt.data_decoded.metadata.data.length)
})

AptosResourcesProcessor.bind({ address: '0x1' })
  .onTimeInterval((resources, ctx) => {
    ctx.meter.Counter('onTimer').add(1)
  }, 10000)
  .onResourceChange((resources, ctx) => {
    ctx.meter.Counter('onResourceChange').add(resources.length)
  }, '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>')

aptos_account.bind().onEntryCreateAccount(
  (call, ctx) => {
    ctx.meter.Counter('xx').add(1)
  },
  undefined,
  { resourceChanges: true }
)
