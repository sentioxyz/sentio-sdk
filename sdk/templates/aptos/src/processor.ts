import { SouffleChefCampaign, CandyMachine } from './types/aptos/souffle'

SouffleChefCampaign.bind()
  .onEntryPullTokenV2((call, ctx) => {
    ctx.meter.Counter('pulled').add(call.arguments_typed[3])
  })
  .onEventBurnEnjoyEvent((evt, ctx) => {
    ctx.meter.Counter('burned').add(1)
  })

CandyMachine.bind().onEntryPullToken((call, ctx) => {
  ctx.meter.Counter('pulled').add(call.arguments_typed[2], { coin: call.type_arguments[0] })
})
