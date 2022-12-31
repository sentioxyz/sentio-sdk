import { WETH9Processor, WETH9Context } from '@sentio/sdk/lib/builtin/weth9'
import { SPLTokenProcessor } from '@sentio/sdk-solana/lib/builtin'

const TOKEN_BRIDGE_ADDRESS = '0x3ee18B2214AFF97000D974cf647E7C347E8fa585'

const depositFilter = WETH9Processor.filters.Deposit(TOKEN_BRIDGE_ADDRESS, null)
const withdrawalFilter = WETH9Processor.filters.Withdrawal(TOKEN_BRIDGE_ADDRESS, null)
const transferFilters = [
  WETH9Processor.filters.Transfer(TOKEN_BRIDGE_ADDRESS, null),
  WETH9Processor.filters.Transfer(null, TOKEN_BRIDGE_ADDRESS),
]

WETH9Processor.bind({ address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', startBlock: 13217349 })
  .onEventDeposit(async function (event, ctx) {
    const amount = Number(event.args.wad.toBigInt()) / Math.pow(10, 18)
    ctx.meter.Counter('token_bridge_weth').add(amount)
  }, depositFilter)
  .onEventWithdrawal(async function (event, ctx) {
    const amount = Number(event.args.wad.toBigInt()) / Math.pow(10, 18)
    ctx.meter.Counter('token_bridge_weth').sub(amount)
  }, withdrawalFilter)
  .onEventTransfer(async function (event, ctx) {
    const amount = Number(event.args.wad.toBigInt()) / Math.pow(10, 18)

    if (event.args.src == TOKEN_BRIDGE_ADDRESS) {
      ctx.meter.Counter('token_bridge_weth').sub(amount)
    }
    if (event.args.dst == TOKEN_BRIDGE_ADDRESS) {
      ctx.meter.Counter('token_bridge_weth').add(amount)
    }
  }, transferFilters)

WETH9Processor.bind({ address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', startBlock: 13217349 }).onBlock(
  async function (_, ctx: WETH9Context) {
    const balance = (await ctx.contract.balanceOf(TOKEN_BRIDGE_ADDRESS)).toBigInt()
    ctx.meter.Gauge('balance').record(balance)
  }
)

WETH9Processor.bind({
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  startBlock: 13217349,
  endBlock: 14500000,
}).onBlock(async function (_, ctx: WETH9Context) {
  const balance = (await ctx.contract.balanceOf(TOKEN_BRIDGE_ADDRESS)).toBigInt()
  ctx.meter.Gauge('balance_end').record(balance)
})

SPLTokenProcessor.bind({
  address: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
})
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
