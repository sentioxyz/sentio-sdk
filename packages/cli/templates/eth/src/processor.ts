import { Counter } from '@sentio/sdk'
import { EthChainId } from '@sentio/chain'
import { ERC20Processor } from '@sentio/sdk/eth/builtin'

const tokenCounter = Counter.register('token')

const address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

ERC20Processor.bind({ address, network: EthChainId.ETHEREUM }).onEventTransfer(async (event, ctx) => {
  const val = event.args.value.scaleDown(18)
  tokenCounter.add(ctx, val)
})
