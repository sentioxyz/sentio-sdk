import { SouffleChefCampaign, CandyMachine } from './types/aptos/souffle.js'

SouffleChefCampaign.bind()
  .onEntryPullTokenV2((call, ctx) => {
    ctx.meter.Counter('pulled').add(call.arguments_decoded[3])
  })
  .onEventBurnEnjoyEvent((evt, ctx) => {
    ctx.meter.Counter('burned').add(1)
  })

CandyMachine.bind().onEntryPullToken((call, ctx) => {
  ctx.meter.Counter('pulled').add(call.arguments_decoded[2], { coin: call.type_arguments[0] })
})
