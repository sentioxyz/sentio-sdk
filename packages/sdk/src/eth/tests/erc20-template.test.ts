import { before, describe, test } from 'node:test'
import { expect } from 'chai'

import { StartRequest } from '@sentio/protos'
import { TestProcessorServer } from '../../testing/index.js'
import { cleanTest } from '../../testing/test-processor-server.js'
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

describe('Test Template handlerFactory', () => {
  // Address used as the `from` filter — represents a token holder whose
  // transfers this template instance should track.
  const FROM_ADDRESS = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'

  let factoryCallCount = 0
  let factoryReceivedLabels: { [key: string]: string } | undefined

  const templateInstances: StartRequest['templateInstances'] = []

  const service = new TestProcessorServer(async () => {
    const template = new ERC20ProcessorTemplate()

    template.configureHandlerFactory((processor, baseLabels) => {
      factoryCallCount++
      factoryReceivedLabels = baseLabels
      // Use baseLabels.token as the `from` address filter so each template
      // instance only processes transfers originating from a specific address.
      processor.onEventTransfer(async (_event, _ctx) => {}, ERC20Processor.filters.Transfer(baseLabels?.address))
    })

    template.onEventApproval(async (_event, _ctx) => {})

    templateInstances.push({
      contract: {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        name: 'usdc',
        chainId: '1',
        abi: ''
      },
      startBlock: 0n,
      endBlock: 0n,
      templateId: template.id,
      baseLabels: { address: FROM_ADDRESS }
    })
  })

  before(async () => {
    factoryCallCount = 0
    factoryReceivedLabels = undefined
    cleanTest()
    await service.start({ templateInstances })
  })

  test('handlerFactory is called on template instantiation', () => {
    expect(factoryCallCount).equals(1)
  })

  test('handlerFactory receives correct baseLabels', () => {
    expect(factoryReceivedLabels).deep.equals({ address: FROM_ADDRESS })
  })

  test('Transfer filter is scoped to baseLabels.token as from-address', async () => {
    const config = await service.getConfig({})
    const contractConfig = config.contractConfigs[0]
    // Transfer (factory) + Approval (template)
    expect(contractConfig.logConfigs.length).equals(2)

    // The Transfer logConfig has two topics: event signature + indexed from address
    const transferConfig = contractConfig.logConfigs.find((lc) =>
      lc.filters.some((f) => f.topics.length === 2 && f.topics[1].hashes.length > 0)
    )
    expect(transferConfig).not.equals(undefined)

    // ethers encodes an indexed address as a 32-byte zero-padded hex value
    const fromTopic = transferConfig!.filters[0].topics[1].hashes[0]
    expect(fromTopic.toLowerCase()).equals('0x000000000000000000000000' + FROM_ADDRESS.slice(2))
  })

  test('handlerFactory is not called again for duplicate address', async () => {
    await service.start({ templateInstances })
    expect(factoryCallCount).equals(1)
  })
})
