import { SouffleChefCampaign, CandyMachine } from './types/aptos/souffle'

// import { token } from '@sentio/sdk/lib/builtin/aptos/0x3'

SouffleChefCampaign.bind({ startVersion: 6604913 })
  .onEntryPullTokenV2((call, ctx) => {
    if (!call.arguments_typed) {
      console.log(JSON.stringify(ctx.transaction))
      throw Error('processor decode error')
    }
    ctx.meter.Counter('call_num').add(1)
    ctx.meter.Counter('pulled').add(call.arguments_typed[3])
  })
  .onEventBurnEnjoyEvent((evt, ctx) => {
    if (!evt.data_typed) {
      console.log(JSON.stringify(evt))
      throw Error('processor decode error')
    }
    ctx.meter.Counter('burned').add(1)
  })
  .onTransaction((txn, ctx) => {
    if (txn.events) {
      for (const event of txn.events) {
        if (event && event.type === '0x3::token::DepositEvent') {
          ctx.meter.Counter('deposit_token_count').add(Number(event.data.amount))
        }
      }
    }
  })

CandyMachine.bind({ startVersion: 6604913 }).onEntryPullToken((call, ctx) => {
  if (!call.arguments_typed) {
    console.log(JSON.stringify(ctx.transaction))
    throw Error('processor decode error')
  }
  ctx.meter.Counter('pulled').add(call.arguments_typed[2])
})

// token.bind({ startVersion: 182159141 }).onEventWithdrawEvent((evt: token.WithdrawEventInstance, ctx) => {
//   if (!evt.data_typed) {
//     console.log(JSON.stringify(evt))
//     throw Error("adsfadf")
//   }
//   ctx.meter.Counter('with_draw').add(evt.data_typed.amount, { token: evt.data_typed.id.token_data_id.name })
// })
