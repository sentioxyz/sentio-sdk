import { SuiBaseProcessor, SuiBindOptions, SuiNetwork } from '@sentio/sdk/sui'

class SwapProcessor extends SuiBaseProcessor {
  static bind(options: SuiBindOptions): SwapProcessor {
    return new SwapProcessor('Swap', options)
  }
}

SwapProcessor.bind({
  address: '0x8235459df815e77668b4a49bb36e229f3321f432',
  network: SuiNetwork.TEST_NET,
}).onMoveEvent(
  (evt, ctx) => {
    const amount = parseInt(evt.fields?.x_amount)
    ctx.meter.Counter('amount').add(amount)
  },
  {
    type: 'pool::LiquidityEvent',
  }
)
