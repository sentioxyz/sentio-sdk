import { ERC20Processor, ERC20ProcessorTemplate } from '../builtin/erc20.js'
import { Exporter } from '../../core/exporter.js'
import { EthChainId } from '../../core/chain.js'

export const filter = ERC20Processor.filters.Transfer(
  '0x0000000000000000000000000000000000000000',
  '0xb329e39ebefd16f40d38f07643652ce17ca5bac1'
)

const exporter = Exporter.register('transfer', 'xxx')

const processorTemplate = new ERC20ProcessorTemplate().onEventTransfer(async function (event, ctx) {
  console.log('')
})

ERC20Processor.bind({
  address: '0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9',
  // network: 1,
  name: 'x2y2',
  startBlock: 14201940,
})
  .onEventTransfer(async function (event, ctx) {
    processorTemplate.bind({ address: '0x1E4EDE388cbc9F4b5c79681B7f94d36a11ABEBC9', name: 'dynamic' }, ctx)
    // template.bind('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 3, 'dynamic')
    ctx.meter.Counter('c1').add(1)
    ctx.eventLogger.emit(event.name, {
      ...event.args.toObject(),
    })
  }, filter)
  .onBlockInterval(async function (block, ctx) {
    ctx.meter.Gauge('g1').record(10, { k: 'v' })
  })
  .onCallApprove(function (call, ctx) {
    ctx.meter.Counter('added').add(call.args.amount, { spender: call.args.spender })
  })

ERC20Processor.bind({
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  network: EthChainId.BINANCE,
  name: 'usdc',
})
  .onEventTransfer(
    async function (event, ctx) {
      ctx.meter.Counter('c2').add(2)
      // const t: Promise<string> =
      // ctx.eventLogger.emit('transfer', { distinctId: event.args.from, xx: 33,  y: Promise.resolve("s")})
      // ctx.eventLogger.emit('transfer', { distinctId: event.args.from, x: { y: Promise.resolve("s")} })
      ctx.eventLogger.emit('transfer', { distinctId: event.args.from })
      exporter.emit(ctx, { ...event, x: 100n })
    } /*filter*/
  )
  // .onEvent((evt, ctx) => {
  //   ctx.meter.Counter("event_count").add(1, { name: evt.name })
  //   ctx.eventLogger.emit(evt.name, {
  //     ...evt.args.toObject()
  //   })
  // })
  .onBlockInterval(async function (block, ctx) {
    ctx.meter.Gauge('g2').record(20, { k: 'v' })
  })
// .onEventApproval(async function (event, ctx) {
//   BigNumber.from(10 ** 18)
//   // console.log(n)
// })
ERC20Processor.bind({ address: '0x2e4ede388cbc9f4b5c79681b7f94d36a11abebc9', network: EthChainId.BINANCE })

ERC20Processor.bind({ address: '0x3e4ede388cbc9f4b5c79681b7f94d36a11abebc9', network: EthChainId.ETHEREUM })
ERC20Processor.bind({ address: '0x3e4ede388cbc9f4b5c79681b7f94d36a11abebc9', network: EthChainId.ETHEREUM })
ERC20Processor.bind({
  address: '0x3e4ede388cbc9f4b5c79681b7f94d36a11abebc9',
  network: EthChainId.ETHEREUM,
  startBlock: 21,
  name: 'ytoken',
})

// const template = Erc20Processor.template
//   .onTransfer(async function (event, ctx) {
//     ctx.meter.Counter('c2').add(2)
//   }, filter)
//   .onBlock(async function (block, ctx) {
//     ctx.meter.Gauge('h1').record(20, { k: 'v' })
//   })
