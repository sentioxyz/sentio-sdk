import { TokenBridgeProcessor } from './types/wormhole_processor'

TokenBridgeProcessor.bind(
  'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
  'https://api.mainnet-beta.solana.com'
).onTransferNative((args, ctx) => {
  ctx.meter.Counter('total_transfer_amount').add(args.amount)
})
