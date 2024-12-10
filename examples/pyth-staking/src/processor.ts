import { StakingProcessor } from './types/solana/staking_processor.js'

StakingProcessor.bind({ address: 'pytS9TjG1qyAZypk7n8rw8gfW9sUaqqYyMhJQ4E7JCQ' })
  .onCreate_position((args, _, ctx) => {
    const amount = BigInt(args.amount.toString())
    ctx.meter.Counter('total_token').add(amount)
  })
  .onWithdraw_stake((args, _, ctx) => {
    const amount = BigInt(args.amount.toString())
    ctx.meter.Counter('total_token').sub(amount)
  })
