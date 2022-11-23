import { AccountEventTracker, Counter, Gauge } from '@sentio/sdk'
import { token } from '@sentio/sdk/lib/utils'
import { ERC20Processor } from '@sentio/sdk/lib/builtin/erc20'
import { X2y2Processor } from './types/x2y2'

import { AggregationType } from '@sentio/sdk/lib/gen/processor/protos/processor'
import { Exporter } from '@sentio/sdk/lib/core/exporter'

const rewardPerBlock = Gauge.register('reward_per_block', {
  description: 'rewards for each block grouped by phase',
  unit: 'x2y2',
})

const tokenCounter = Counter.register('token')

const vol = Gauge.register('x2y2_vol', {
  description: 'transfer activities',
  unit: 'x2y2',
  aggregationConfig: {
    intervalInMinutes: 60,
    types: [AggregationType.COUNT, AggregationType.SUM],
  },
})

const exporter = Exporter.register('x2y2', 'x2y2_mint')

const tracker = AccountEventTracker.register()

X2y2Processor.bind({ address: '0xB329e39Ebefd16f40d38f07643652cE17Ca5Bac1' }).onBlockInterval(async (_, ctx) => {
  const phase = (await ctx.contract.currentPhase()).toString()
  const reward = token.scaleDown(await ctx.contract.rewardPerBlockForStaking(), 18)
  ctx.logger.info(`reward ${reward.toFormat(6)} for block ${ctx.blockNumber}`, { phase })
  rewardPerBlock.record(ctx, reward, { phase })
  // exporter.emit(ctx, { reward, phase })
})

const filter = ERC20Processor.filters.Transfer(
  '0x0000000000000000000000000000000000000000',
  '0xb329e39ebefd16f40d38f07643652ce17ca5bac1'
)

ERC20Processor.bind({ address: '0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9' }).onEventTransfer(
  async (event, ctx) => {
    const val = token.scaleDown(event.args.value, 18)
    tokenCounter.add(ctx, val)
    exporter.emit(ctx, event)
    ctx.logger.info(event)
  },
  filter // filter is an optional parameter
)

ERC20Processor.bind({ address: '0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9' }).onEventTransfer(async (event, ctx) => {
  const val = token.scaleDown(event.args.value, 18)
  vol.record(ctx, val)
  tracker.trackEvent(ctx, { distinctId: event.args.from })
  // tracker.trackEvent(ctx, { distinctId: event.args.to })
})
