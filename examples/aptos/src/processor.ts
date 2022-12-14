import { SouffleChefCampaign, CandyMachine } from './types/aptos/souffle'
import { token } from '@sentio/sdk-aptos/lib/builtin/0x3'
import { coin } from '@sentio/sdk-aptos/lib/builtin/0x1'
import { AccountEventTracker } from '@sentio/sdk'
import { AptosNetwork, TYPE_REGISTRY } from '@sentio/sdk-aptos'

const accountTracker = AccountEventTracker.register('pull')

coin.bind({ network: AptosNetwork.MAIN_NET }).onEventWithdrawEvent((evt, ctx) => {
  if (evt.guid.account_address === '0x9c5382a5aa6cd92f38ffa50bd8ec2879833997116499cc5bcd6d4688a962e330') {
    ctx.meter.Counter('air_dropped').add(evt.data_typed.amount)
  }
  ctx.meter.Counter('evt_cnt').add(1)
})

SouffleChefCampaign.bind({ network: AptosNetwork.TEST_NET, startVersion: 6604913 })
  .onEntryPullTokenV2((call, ctx) => {
    ctx.meter.Counter('call_num').add(1)
    ctx.meter.Counter('pulled').add(call.arguments_typed[3])

    accountTracker.trackEvent(ctx, { distinctId: ctx.transaction.sender })
  })
  .onEventBurnEnjoyEvent((evt, ctx) => {
    ctx.meter.Counter('burned').add(1)
  })
  .onTransaction((txn, ctx) => {
    const events = TYPE_REGISTRY.filterAndDecodeEvents<token.DepositEvent>('0x3::token::DepositEvent', txn.events)
    for (const event of events) {
      // const depositEventInstance = DEFAULT_TYPE_REGISTRY.decodeEvent(event) as DepositEventInstance
      ctx.meter.Counter('deposit_token_count').add(event.data_typed.amount)
    }
  })

CandyMachine.bind({ network: AptosNetwork.TEST_NET, startVersion: 6604913 }).onEntryPullToken((call, ctx) => {
  ctx.meter.Counter('pulled').add(call.arguments_typed[2], { coin: call.type_arguments[0] })
})

token
  .bind({ network: AptosNetwork.TEST_NET, startVersion: 282159141 })
  .onEventWithdrawEvent((evt: token.WithdrawEventInstance, ctx) => {
    ctx.meter.Counter('with_draw').add(evt.data_typed.amount, { token: evt.data_typed.id.token_data_id.name })
  })
