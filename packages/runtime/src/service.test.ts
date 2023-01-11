import { ProcessorServiceImpl } from './service'
import { FullProcessorServiceImpl } from './full-service'
import { CallContext } from 'nice-grpc-common'
import { DataBinding, HandlerType, ProcessResult } from './gen/processor/protos/processor'
import { Plugin, PluginManager } from './plugin'
import { assert } from 'chai'

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
  const baseService = new ProcessorServiceImpl(() => {
    PluginManager.INSTANCE.plugins = []
    PluginManager.INSTANCE.register(new TestPlugin())
  })
  const service = new FullProcessorServiceImpl(baseService)

  beforeAll(async () => {
    await service.start({ templateInstances: [] }, TEST_CONTEXT)
  })

  test('Check transaction dispatch', async () => {
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
    assert(testRequest.handlerType === HandlerType.UNKNOWN)
    assert((testRequest.data?.raw.length || 0) > 0)
  })

  test('Check < 1.40 aptos event dispatch', async () => {
    const binding1: DataBinding = {
      data: {
        raw: new Uint8Array(),
        aptEvent: {
          event: { key: 'value' },
          transaction: {
            events: [{ a: 'b' }, { c: 'd' }, { key: 'value' }],
          },
        },
      },
      handlerType: HandlerType.APT_EVENT,
      handlerIds: [0],
    }

    await service.processBindings({ bindings: [binding1] }, TEST_CONTEXT)
    assert((testRequest.data?.aptEvent?.transaction?.events.length || 0) === 1)
  })

  test('Check >= 1.40 aptos event dispatch', async () => {
    const binding1: DataBinding = {
      data: {
        raw: new Uint8Array(),
        aptEvent: {
          event: { key: 'value' },
          transaction: {
            events: [{ a: 'b' }, { c: 'd' }, { key: 'value' }],
          },
        },
      },
      handlerType: HandlerType.APT_EVENT,
      handlerIds: [0],
    }

    service.sdkMinorVersion = 40
    await service.processBindings({ bindings: [binding1] }, TEST_CONTEXT)
    assert((testRequest.data?.aptEvent?.transaction?.events.length || 0) === 3)
  })
})
