import { before, describe, test } from 'node:test'
import { expect } from 'chai'

import { StartRequest } from '@sentio/protos'
import { TestProcessorServer } from '../../testing/index.js'
import { ERC20Processor, ERC20ProcessorTemplate } from '../builtin/erc20.js'
import { EthChainId } from '@sentio/chain'
// import { TestProcessorServer } from '../testing/index.js'

describe('Test Template', () => {
  const service = new TestProcessorServer(async () => {
    const filter = ERC20Processor.filters.Transfer(
      '0x0000000000000000000000000000000000000000',
      '0xb329e39ebefd16f40d38f07643652ce17ca5bac1'
    )

    const processorTemplate = new ERC20ProcessorTemplate().onEventTransfer(async function (event, ctx) {
      console.log('')
    })

    ERC20Processor.bind({
      address: '0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9',
      network: EthChainId.ARBITRUM,
      name: 'x2y2',
      startBlock: 14201940
    }).onEventTransfer(async function (event, ctx) {
      processorTemplate.bind(
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          name: 'dynamic'
        },
        ctx
      )
      // template.bind('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 3, 'dynamic')
      ctx.meter.Counter('c1').add(1)
    }, filter)
  })

  before(async () => {
    const request: StartRequest = {
      templateInstances: [
        {
          contract: {
            address: '0xb329e39ebefd16f40d38f07643652ce17ca5bac1',
            name: 'dynamic2',
            chainId: '42161',
            abi: ''
          },
          startBlock: 0n,
          endBlock: 0n,
          templateId: 0,
          baseLabels: {}
        }
      ]
    }
    await service.start(request)
  })

  test('Check template instantiate', async () => {
    const config = await service.getConfig({})
    expect(config.contractConfigs).length(2)
    expect(config.contractConfigs[1].contract?.chainId).equals(EthChainId.ARBITRUM)
    expect(config.contractConfigs?.[1].contract?.name).equals('dynamic2')
    expect(config.templateInstances).length(1)
    expect(config.templateInstances[0].contract?.chainId).equals(EthChainId.ARBITRUM)
  })
})
