import { StepStakingProcessor } from './types/solana/step_staking_processor'

StepStakingProcessor.bind({ address: 'StKLLTf7CQ9n5BgXPSDXENovLTCuNc7N2ehvTb6JZ5x' })
  .onStake((args, ctx) => {
    const amount = args.amount.toNumber()
    ctx.meter.Counter('total_token').add(amount)
  })
  .onUnstake((args, ctx) => {
    const amount = args.amount.toNumber()
    ctx.meter.Counter('total_token').sub(amount)
  })
