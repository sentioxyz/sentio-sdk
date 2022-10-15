import { TokenBridgeProcessor, SPLTokenProcessor } from '../builtin/solana'

TokenBridgeProcessor.bind({
  address: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
}).onTransferNative((args, accounts, ctx) => {
  ctx.meter.Counter('total_transfer_amount').add(args.amount)
  ctx.meter.Counter(accounts[0]).add(args.amount)
})

SPLTokenProcessor.bind({ address: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb' })
  .onMintTo((data, ctx) => {
    if (data.mint === '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs') {
      ctx.meter.Counter('totalWeth_supply').add(data.amount as number)
    }
  })
  .onBurn((data, ctx) => {
    if (data.mint === '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs') {
      ctx.meter.Counter('totalWeth_supply').sub(data.amount as number)
    }
  })
  .innerInstruction(true)
