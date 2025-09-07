import { before, describe, test } from 'node:test'
import { ProcessorServiceImpl } from './service.js'
import { FullProcessorServiceImpl } from './full-service.js'
import { CallContext } from 'nice-grpc-common'
import { DataBinding, HandlerType, ProcessResult } from './gen/processor/protos/processor.js'
import { Plugin, PluginManager } from './plugin.js'
import { getTestConfig } from './processor-runner-program.js'

export const TEST_CONTEXT: CallContext = <CallContext>{}

// TODO use mock
let testRequest: DataBinding

class TestPlugin extends Plugin {
  async processBinding(request: DataBinding): Promise<ProcessResult> {
    testRequest = request
    return ProcessResult.fromPartial({})
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
    await service.start({ templateInstances: [] }, TEST_CONTEXT)
  })

  test('Check transaction dispatch', async () => {
    // const binding1: DataBinding = {
    //   data: {
    //     ethBlock: {
    //       block: {
    //         number: '0x1'
    //       }
    //     }
    //   },
    //   handlerType: HandlerType.UNKNOWN,
    //   handlerIds: [0]
    // }
    //
    // await service.processBindings({ bindings: [binding1] }, TEST_CONTEXT)
    // assert(testRequest.handlerType === HandlerType.UNKNOWN)
    // assert((testRequest.data?.raw.length || 0) > 0)
  })
})
