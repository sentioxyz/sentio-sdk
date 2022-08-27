import { Erc20Context, Erc20Processor, TransferEvent } from '@sentio/sdk/dist/builtin/erc20'
import { X2y2Context, X2y2Processor } from './types/x2y2'

X2y2Processor.bind({ address: '0xB329e39Ebefd16f40d38f07643652cE17Ca5Bac1', startBlock: 14211735 }).onBlock(
  async function (_, ctx: X2y2Context) {
    const phase = (await ctx.contract.currentPhase()).toString()
    const reward = Number((await ctx.contract.rewardPerBlockForStaking()).toBigInt() / 10n ** 18n)
    ctx.meter.Gauge('reward_per_block').record(reward, { phase })
  }
)

export const filter = Erc20Processor.filters.Transfer(
  '0x0000000000000000000000000000000000000000',
  '0xb329e39ebefd16f40d38f07643652ce17ca5bac1'
)

Erc20Processor.bind({ address: '0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9', startBlock: 14201940 }).onTransfer(
  handleTransfer,
  filter // filter is an optional parameter
)

async function handleTransfer(event: TransferEvent, ctx: Erc20Context) {
  const val = Number(event.args.value.toBigInt() / 10n ** 18n)
  ctx.meter.Counter('token').add(val)
}
