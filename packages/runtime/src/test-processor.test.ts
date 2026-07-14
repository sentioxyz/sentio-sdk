import { Plugin, PluginManager } from './plugin.js'
import {
  AccountConfigSchema,
  type DataBinding,
  HandlerType,
  type InitResponse,
  type ProcessConfigResponse,
  type ProcessResult,
  ProcessResultSchema,
  type ProcessStreamResponse_Partitions,
  ProcessStreamResponse_PartitionsSchema
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'

export class TestPlugin extends Plugin {
  async processBinding(request: DataBinding): Promise<ProcessResult> {
    const dbContext = PluginManager.INSTANCE.dbContextLocalStorage.getStore()
    if (dbContext) {
      await dbContext.sendRequest({
        case: 'get',
        value: {
          entity: 'Test',
          id: '1'
        }
      })
    }

    return create(ProcessResultSchema, {
      states: {},
      exports: [{ payload: '{"test":1}' }]
    })
  }
  supportedHandlers = [HandlerType.UNKNOWN, HandlerType.ETH_LOG]

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    return create(ProcessStreamResponse_PartitionsSchema, {
      partitions: request.handlerIds.reduce<Record<number, { value: { case: 'userValue'; value: string } }>>(
        (acc, id) => ({
          ...acc,
          [id]: {
            value: { case: 'userValue', value: 'test' }
          }
        }),
        {}
      )
    })
  }

  async init(config: InitResponse): Promise<void> {
    config.chainIds = ['1']
  }

  async configure(config: ProcessConfigResponse, forChainId?: string): Promise<void> {
    config.accountConfigs = [
      create(AccountConfigSchema, {
        address: '0x',
        chainId: '1'
      })
    ]
  }
}

PluginManager.INSTANCE.plugins = []
PluginManager.INSTANCE.register(new TestPlugin())
