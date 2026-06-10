import { before, describe, test } from 'node:test'
import { ProcessorServiceImpl } from './service.js'
import { FullProcessorServiceImpl } from './full-service.js'
import { type HandlerContext } from '@connectrpc/connect'
import {
  type DataBinding,
  DataBindingSchema,
  HandlerType,
  type ProcessResult,
  ProcessResultSchema,
  ProcessBindingsRequestSchema,
  StartRequestSchema
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { Plugin, PluginManager } from './plugin.js'
import { assert } from 'chai'
import { GLOBAL_CONFIG } from './global-config.js'
import { getTestConfig } from './processor-runner-program.js'

export const TEST_CONTEXT = {} as HandlerContext

let testRequest: DataBinding

class TestPlugin extends Plugin {
  async processBinding(request: DataBinding): Promise<ProcessResult> {
    testRequest = request
    return create(ProcessResultSchema, {})
  }
  supportedHandlers = [HandlerType.ETH_BLOCK]
}

describe('Test seq mode', () => {
  const baseService = new ProcessorServiceImpl(async () => {
    PluginManager.INSTANCE.plugins = []
    PluginManager.INSTANCE.register(new TestPlugin())
  }, getTestConfig())
  const service = new FullProcessorServiceImpl(baseService)

  before(async () => {
    GLOBAL_CONFIG.execution.sequential = true

    await service.start(create(StartRequestSchema, { templateInstances: [] }), TEST_CONTEXT)
  })

  test('Check block dispatch in seq', async () => {
    const binding1 = create(DataBindingSchema, {
      data: {
        value: {
          case: 'ethBlock',
          value: { rawBlock: JSON.stringify({ number: '0x1', timestamp: '0x65ed3a46' }) }
        }
      },
      handlerType: HandlerType.ETH_BLOCK,
      handlerIds: [0],
      chainId: '1'
    })

    const binding2 = create(DataBindingSchema, {
      data: {
        value: {
          case: 'ethBlock',
          value: { rawBlock: JSON.stringify({ number: '0x2', timestamp: '0x65ed3b46' }) }
        }
      },
      handlerType: HandlerType.ETH_BLOCK,
      handlerIds: [0],
      chainId: '1'
    })

    const binding3 = create(DataBindingSchema, {
      data: {
        value: {
          case: 'ethBlock',
          value: { rawBlock: JSON.stringify({ number: '0x1', timestamp: '0x65ed3c46' }) }
        }
      },
      handlerType: HandlerType.ETH_BLOCK,
      handlerIds: [0],
      chainId: '1'
    })

    await service.processBindings(
      create(ProcessBindingsRequestSchema, { bindings: [binding2, binding1, binding3] }),
      TEST_CONTEXT
    )
    assert(testRequest.handlerType === HandlerType.ETH_BLOCK)
  })
})
