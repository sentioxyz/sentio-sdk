import { before, describe, test } from 'node:test'
import { ProcessorServiceImpl } from './service.js'
import { FullProcessorServiceImpl } from './full-service.js'
import { type HandlerContext } from '@connectrpc/connect'
import {
  type DataBinding,
  HandlerType,
  type ProcessResult,
  ProcessResultSchema,
  StartRequestSchema
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { Plugin, PluginManager } from './plugin.js'
import { getTestConfig } from './processor-runner-program.js'

export const TEST_CONTEXT = {} as HandlerContext

// TODO use mock
let testRequest: DataBinding

class TestPlugin extends Plugin {
  async processBinding(request: DataBinding): Promise<ProcessResult> {
    testRequest = request
    return create(ProcessResultSchema, {})
  }
  supportedHandlers = [HandlerType.UNKNOWN, HandlerType.APT_EVENT]
}

describe('Test Service Compatibility', () => {
  const baseService = new ProcessorServiceImpl(async () => {
    PluginManager.INSTANCE.plugins = []
    PluginManager.INSTANCE.register(new TestPlugin())
  }, getTestConfig())
  const service = new FullProcessorServiceImpl(baseService)

  before(async () => {
    await service.start(create(StartRequestSchema, { templateInstances: [] }), TEST_CONTEXT)
  })

  test('Check transaction dispatch', async () => {
    // const binding1 = create(DataBindingSchema, {
    //   data: { value: { case: 'ethBlock', value: { rawBlock: JSON.stringify({ number: '0x1' }) } } },
    //   handlerType: HandlerType.UNKNOWN,
    //   handlerIds: [0]
    // })
    //
    // await service.processBindings(create(ProcessBindingsRequestSchema, { bindings: [binding1] }), TEST_CONTEXT)
    // assert(testRequest.handlerType === HandlerType.UNKNOWN)
  })
})
