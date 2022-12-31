import { TokenBridgeProcessor, SPLTokenProcessor } from '../builtin'

TokenBridgeProcessor.bind({
  address: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
}).onTransferNative((args, accounts, ctx) => {
  ctx.meter.Counter('total_transfer_amount').add(args.amount)
  ctx.meter.Counter(accounts[0]).add(args.amount)
})

SPLTokenProcessor.bind({ address: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb', processInnerInstruction: true })
  .onMintTo((data, ctx) => {
    if (data.mint === '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs') {
      ctx.meter.Counter('totalWeth_supply').add(BigInt(data.amount))
    }
  })
  .onBurn((data, ctx) => {
    if (data.mint === '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs') {
      ctx.meter.Counter('totalWeth_supply').sub(BigInt(data.amount))
    }
  })
