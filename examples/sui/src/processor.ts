import { pool } from './types/sui/swap.js'

pool.bind().onEventLiquidityEvent((evt, ctx) => {
  const amount = evt.fields_decoded.x_amount
  ctx.meter.Counter('amount').add(amount)
})
