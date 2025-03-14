import { Plugin, PluginManager } from './plugin.js'
import { DataBinding, HandlerType, ProcessResult } from './gen/processor/protos/processor.js'

class TestPlugin extends Plugin {
  async processBinding(request: DataBinding): Promise<ProcessResult> {
    const dbContext = PluginManager.INSTANCE.dbContextLocalStorage.getStore()
    if (dbContext) {
      await dbContext.sendRequest({
        get: {
          entity: 'Test',
          id: '1'
        }
      })
    }

    return ProcessResult.fromPartial({
      states: {
        configUpdated: true
      }
    })
  }
  supportedHandlers = [HandlerType.UNKNOWN, HandlerType.ETH_LOG]
}

PluginManager.INSTANCE.plugins = []
PluginManager.INSTANCE.register(new TestPlugin())
