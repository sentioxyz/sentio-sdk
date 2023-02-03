import { StepStakingProcessor } from './types/solana/step_staking_processor.js'

StepStakingProcessor.bind({ address: 'StKLLTf7CQ9n5BgXPSDXENovLTCuNc7N2ehvTb6JZ5x' })
  .onStake((args, _, ctx) => {
    const amount = BigInt(args.amount.toString())
    ctx.meter.Counter('total_token').add(amount)
  })
  .onUnstake((args, _, ctx) => {
    const amount = BigInt(args.amount.toString())
    ctx.meter.Counter('total_token').sub(amount)
  })
