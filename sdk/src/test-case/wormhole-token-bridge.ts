import { TokenBridgeProcessor } from './types/wormhole_processor'
import { SPLTokenProcessor } from '../solana/builtin'

TokenBridgeProcessor.bind(
  'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
  'https://api.mainnet-beta.solana.com'
).onTransferNative((args, ctx) => {
  ctx.meter.Counter('total_transfer_amount').add(args.amount)
})

SPLTokenProcessor.bind(
  'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
  'https://api.mainnet-beta.solana.com'
).onMintTo((data, ctx) => {
  if (data.mint === '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs') {
    ctx.meter.Counter('totalWeth_supply').add(data.amount as number)
  }
}).onBurn((data, ctx) => {
  if (data.mint === '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs') {
    ctx.meter.Counter('totalWeth_supply').sub(data.amount as number)
  }
}).innerInstruction(true)
