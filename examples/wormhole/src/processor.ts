import { Weth9Processor, Weth9Context } from './types/weth9'

const TOKEN_BRIDGE_ADDRESS = '0x3ee18B2214AFF97000D974cf647E7C347E8fa585'

const depositFilter = Weth9Processor.filters.Deposit(TOKEN_BRIDGE_ADDRESS, null)
const withdrawalFilter = Weth9Processor.filters.Withdrawal(TOKEN_BRIDGE_ADDRESS, null)
const transferFilters = [
  Weth9Processor.filters.Transfer(TOKEN_BRIDGE_ADDRESS, null),
  Weth9Processor.filters.Transfer(null, TOKEN_BRIDGE_ADDRESS),
]

Weth9Processor.bind({ address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', startBlock: 13217349 })
  .onDeposit(async function (event, ctx) {
    const amount = Number(event.args.wad.toBigInt()) / Math.pow(10, 18)
    ctx.meter.Counter('token_bridge_weth').add(amount)
  }, depositFilter)
  .onWithdrawal(async function (event, ctx) {
    const amount = Number(event.args.wad.toBigInt()) / Math.pow(10, 18)
    ctx.meter.Counter('token_bridge_weth').sub(amount)
  }, withdrawalFilter)
  .onTransfer(async function (event, ctx) {
    const amount = Number(event.args.wad.toBigInt()) / Math.pow(10, 18)

    if (event.args.src == TOKEN_BRIDGE_ADDRESS) {
      ctx.meter.Counter('token_bridge_weth').sub(amount)
    }
    if (event.args.dst == TOKEN_BRIDGE_ADDRESS) {
      ctx.meter.Counter('token_bridge_weth').add(amount)
    }
  }, transferFilters)

Weth9Processor.bind({ address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', startBlock: 13217349 }).onBlock(
  async function (_, ctx: Weth9Context) {
    const balance = (await ctx.contract.balanceOf(TOKEN_BRIDGE_ADDRESS)).toBigInt()
    ctx.meter.Gauge('balance').record(balance)
  }
)

Weth9Processor.bind({
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  startBlock: 13217349,
  endBlock: 14500000,
}).onBlock(async function (_, ctx: Weth9Context) {
  const balance = (await ctx.contract.balanceOf(TOKEN_BRIDGE_ADDRESS)).toBigInt()
  ctx.meter.Gauge('balance_end').record(balance)
})
