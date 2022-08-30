import { GameWalletProcessor } from './types/game_wallet_processor'

GameWalletProcessor.bind('F78NhTC9XmP1DKsCBRz5LGdQc4n4yFbj2dURiv7T9gGZ', 'https://api.mainnet-beta.solana.com')
  .onDistributeWithoutUser((payload, ctx) => {
    const amount = payload.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('deposit_pool_current_value').add(amount)
    ctx.meter.Counter('distribution_pool_total_value').sub(amount)
  })
  .onDeposit((payload, ctx) => {
    const amount = payload.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('deposit_pool_current_value').add(amount)
  })
  .onWithdraw((payload, ctx) => {
    const amount = payload.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('distribution_pool_total_value').sub(amount)
  })
  .onSpend((payload, ctx) => {
    const amount = payload.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('distribution_pool_total_value').sub(amount)
  })
  .onDistribute((payload, ctx) => {
    const amount = payload.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('deposit_pool_current_value').add(amount)
    ctx.meter.Counter('distribution_pool_total_value').sub(amount)
  })
  .onSpendWithoutUser((payload, ctx) => {
    const amount = payload.amount.toNumber()
    ctx.meter.Counter('deposit_pool_total_value').add(amount)
    ctx.meter.Counter('deposit_pool_current_value').sub(amount)
  })
  .onAddDistributeSupply((payload, ctx) => {
    const amount = payload.amount.toNumber()
    ctx.meter.Counter('distribution_pool_total_value').add(amount)
  })
  .startSlot(142700000)
