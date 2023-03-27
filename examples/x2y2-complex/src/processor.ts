import { Counter, Gauge, Exporter } from '@sentio/sdk'
import { ERC20Processor } from '@sentio/sdk/eth/builtin'
import { X2y2Processor } from './types/eth/x2y2.js'

// import { AggregationType } from '@sentio/sdk/lib/gen/processor/protos/processor'

const rewardPerBlock = Gauge.register('reward_per_block', {
  description: 'rewards for each block grouped by phase',
  unit: 'x2y2',
})

const tokenCounter = Counter.register('token')

const vol = Gauge.register('x2y2_vol', {
  description: 'transfer activities',
  unit: 'x2y2',
  // aggregationConfig: {
  //   intervalInMinutes: 60,
  //   types: [AggregationType.COUNT, AggregationType.SUM],
  // },
})

const exporter = Exporter.register('x2y2', 'x2y2_mint')

X2y2Processor.bind({ address: '0xB329e39Ebefd16f40d38f07643652cE17Ca5Bac1' }).onTimeInterval(
  async (_, ctx) => {
    const phase = (await ctx.contract.currentPhase()).toString()
    const reward = (await ctx.contract.rewardPerBlockForStaking()).scaleDown(18)
    ctx.eventLogger.emit('reward', { message: `reward ${reward.toFormat(6)} for block ${ctx.blockNumber}`, phase })
    rewardPerBlock.record(ctx, reward, {
      phase,
    })
    // exporter.emit(ctx, { reward, phase })
  },
  30,
  240
)

const filter = ERC20Processor.filters.Transfer(
  '0x0000000000000000000000000000000000000000',
  '0xb329e39ebefd16f40d38f07643652ce17ca5bac1'
)

ERC20Processor.bind({ address: '0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9' }).onEventTransfer(
  async (event, ctx) => {
    const val = event.args.value.scaleDown(18)
    tokenCounter.add(ctx, val, { coin_symbol: 'X2Y2' })
    // tokenCounter.add(ctx, val.dividedBy(2), { coin_symbol: "WETH" })

    ctx.eventLogger.emit('Mint', {
      amount: val,
      coin_symbol: 'X2Y2',
    })
  },
  filter // filter is an optional parameter
)
//
// ERC20Processor.bind({ address: '0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9' }).onEventTransfer(async (event, ctx) => {
//   const val = event.args.value.scaleDown(18)
//   vol.record(ctx, val)
//   ctx.eventLogger.emit('Transfer', {
//     distinctId: event.args.from,
//     amount: val,
//     coin_symbol: 'X2Y2',
//   })
// })

ERC20Processor.bind({ address: '0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9' }).onAllEvents((evt, ctx) => {
  ctx.meter.Counter('event_count').add(1, { name: evt.name })
  ctx.eventLogger.emit(evt.name, {
    ...evt.args,
  })
})
