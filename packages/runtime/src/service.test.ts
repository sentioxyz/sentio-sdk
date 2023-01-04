import { ProcessorServiceImpl } from './service'
import { FullProcessorServiceImpl } from './full-service'
import { CallContext } from 'nice-grpc-common'
import { DataBinding, HandlerType, ProcessResult } from './gen/processor/protos/processor'
import { Plugin, PluginManager } from './plugin'
import { assert } from 'chai'

export const TEST_CONTEXT: CallContext = <CallContext>{}

// TODO use mock
class TestPlugin extends Plugin {
  async processBinding(request: DataBinding): Promise<ProcessResult> {
    if (request.handlerType === HandlerType.UNKNOWN) {
      assert((request.data?.raw.length || 0) > 0)
    }
    return ProcessResult.fromPartial({})
  }
  supportedHandlers = [HandlerType.UNKNOWN]
}

describe('Test Service Compatibility', () => {
  const baseService = new ProcessorServiceImpl(() => {
    PluginManager.INSTANCE.plugins = []
    PluginManager.INSTANCE.register(new TestPlugin())
  })
  const service = new FullProcessorServiceImpl(baseService)

  beforeAll(async () => {
    await service.start({ templateInstances: [] }, TEST_CONTEXT)
  })

  test('Check tictactoe transaction dispatch', async () => {
    const binding1: DataBinding = {
      data: {
        raw: new Uint8Array(),
        ethBlock: {
          block: {
            number: '0x1',
          },
        },
      },
      handlerType: HandlerType.UNKNOWN,
      handlerIds: [0],
    }

    await service.processBindings({ bindings: [binding1] }, TEST_CONTEXT)
  })
})
