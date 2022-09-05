import { GameWalletProcessor } from './types/game_wallet_processor'

GameWalletProcessor.bind({ address: 'F78NhTC9XmP1DKsCBRz5LGdQc4n4yFbj2dURiv7T9gGZ' })
  .onDistributeWithoutUser((args, ctx) => {
    const amount = args.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('deposit_pool_current_value').add(amount)
    ctx.meter.Counter('distribution_pool_total_value').sub(amount)
  })
  .onDeposit((args, ctx) => {
    const amount = args.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('deposit_pool_current_value').add(amount)
  })
  .onWithdraw((args, ctx) => {
    const amount = args.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('distribution_pool_total_value').sub(amount)
  })
  .onSpend((args, ctx) => {
    const amount = args.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('distribution_pool_total_value').sub(amount)
  })
  .onDistribute((args, ctx) => {
    const amount = args.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('deposit_pool_current_value').add(amount)
    ctx.meter.Counter('distribution_pool_total_value').sub(amount)
  })
  .onSpendWithoutUser((args, ctx) => {
    const amount = args.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('deposit_pool_current_value').sub(amount)
  })
  .onAddDistributeSupply((args, ctx) => {
    const amount = args.amount.toNumber()
    ctx.meter.Counter('distribution_pool_total_value').add(amount)
  })
  .startSlot(139308640)
