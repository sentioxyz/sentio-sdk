import { Plugin, PluginManager } from './plugin.js'
import { DataBinding, HandlerType, ProcessResult } from './gen/processor/protos/processor.js'
import { AccountConfig, InitResponse, ProcessConfigResponse, ProcessStreamResponse_Partitions } from '@sentio/protos'

export class TestPlugin extends Plugin {
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

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    return {
      partitions: request.handlerIds.reduce(
        (acc, id) => ({
          ...acc,
          [id]: {
            userValue: 'test'
          }
        }),
        {}
      )
    }
  }

  async init(config: InitResponse): Promise<void> {
    config.chainIds = ['1']
  }

  async configure(config: ProcessConfigResponse, forChainId?: string): Promise<void> {
    config.accountConfigs = [
      AccountConfig.fromPartial({
        address: '0x',
        chainId: '1'
      })
    ]
  }
}

PluginManager.INSTANCE.plugins = []
PluginManager.INSTANCE.register(new TestPlugin())
