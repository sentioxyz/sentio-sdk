import { before, describe, test } from 'node:test'
import { ProcessorServiceImpl } from './service.js'
import { FullProcessorServiceImpl } from './full-service.js'
import { CallContext } from 'nice-grpc-common'
import { DataBinding, HandlerType, ProcessResult } from './gen/processor/protos/processor.js'
import { Plugin, PluginManager } from './plugin.js'
import { assert } from 'chai'
import { GLOBAL_CONFIG } from './global-config.js'
export const TEST_CONTEXT: CallContext = <CallContext>{}

let testRequest: DataBinding

class TestPlugin extends Plugin {
  async processBinding(request: DataBinding): Promise<ProcessResult> {
    testRequest = request
    return ProcessResult.fromPartial({})
  }
  supportedHandlers = [HandlerType.ETH_BLOCK]
}

describe('Test seq mode', () => {
  const baseService = new ProcessorServiceImpl(async () => {
    PluginManager.INSTANCE.plugins = []
    PluginManager.INSTANCE.register(new TestPlugin())
  }, {})
  const service = new FullProcessorServiceImpl(baseService)

  before(async () => {
    GLOBAL_CONFIG.execution.sequential = true

    await service.start({ templateInstances: [] }, TEST_CONTEXT)
  })

  test('Check block dispatch in seq', async () => {
    const binding1: DataBinding = {
      data: {
        ethBlock: {
          block: {
            number: '0x1',
            timestamp: '0x65ed3a46'
          }
        }
      },
      handlerType: HandlerType.ETH_BLOCK,
      handlerIds: [0],
      chainId: '1'
    }

    const binding2 = {
      data: {
        ethBlock: {
          block: {
            number: '0x2',
            timestamp: '0x65ed3b46'
          }
        }
      },
      handlerType: HandlerType.ETH_BLOCK,
      handlerIds: [0],
      chainId: '1'
    }

    const binding3 = {
      data: {
        raw: new Uint8Array(),
        ethBlock: {
          block: {
            number: '0x1',
            timestamp: '0x65ed3c46'
          }
        },
        chainId: '1'
      },
      handlerType: HandlerType.ETH_BLOCK,
      handlerIds: [0],
      chainId: '1'
    }

    await service.processBindings({ bindings: [binding2, binding1, binding3] }, TEST_CONTEXT)
    assert(testRequest.handlerType === HandlerType.ETH_BLOCK)
  })
})
