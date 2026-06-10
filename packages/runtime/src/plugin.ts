import {
  type DataBinding,
  HandlerType,
  type PreparedData,
  type PreprocessResult,
  PreprocessResultSchema,
  type ProcessConfigResponse,
  type ProcessResult,
  ProcessResultSchema,
  type StartRequest,
  StartRequestSchema,
  type ProcessStreamResponse_Partitions,
  ProcessStreamResponse_PartitionsSchema,
  ProcessStreamResponse_Partitions_Partition_SysValue,
  type UpdateTemplatesRequest
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { IDataBindingContext, IStoreContext } from './db-context.js'
import { AsyncLocalStorage } from 'node:async_hooks'

export abstract class Plugin {
  name: string
  supportedHandlers: HandlerType[] = []

  async configure(config: ProcessConfigResponse, forChainId?: string): Promise<void> {}

  async start(start: StartRequest): Promise<void> {}

  /**
   * @deprecated The method should not be used, use ctx.states instead
   */
  stateDiff(config: ProcessConfigResponse): boolean {
    return false
  }

  async processBinding(request: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    return create(ProcessResultSchema)
  }

  async preprocessBinding(request: DataBinding, preprocessStore: { [k: string]: any }): Promise<PreprocessResult> {
    return create(PreprocessResultSchema)
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    return create(ProcessStreamResponse_PartitionsSchema, {
      partitions: request.handlerIds.reduce(
        (acc, id) => ({
          ...acc,
          [id]: {
            value: {
              case: 'sysValue',
              value: ProcessStreamResponse_Partitions_Partition_SysValue.BLOCK_NUMBER
            }
          }
        }),
        {}
      )
    })
  }

  /**
   * method used by action server only
   * @param port
   */
  async startServer(port?: number): Promise<void> {}

  /**
   * method used by action server only
   */
  shutdownServer() {}
}

export class PluginManager {
  static INSTANCE = new PluginManager()

  dbContextLocalStorage = new AsyncLocalStorage<IDataBindingContext | IStoreContext | undefined>()
  plugins: Plugin[] = []
  typesToPlugin = new Map<HandlerType, Plugin>()

  register(plugin: Plugin) {
    if (this.plugins.find((p) => p.name === plugin.name)) {
      return
    }
    this.plugins.push(plugin)

    for (const handlerType of plugin.supportedHandlers) {
      const exsited = this.typesToPlugin.get(handlerType)
      if (exsited) {
        throw new Error(`Duplicate plugin for ${handlerType}: ${exsited.name} and ${plugin.name}`)
      }
      this.typesToPlugin.set(handlerType, plugin)
    }
  }

  async configure(config: ProcessConfigResponse): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin.configure(config)
    }
  }

  start(start: StartRequest, actionServerPort?: number) {
    return Promise.all(this.plugins.map((plugin) => plugin.start(start)))
  }

  startServer(port?: number) {
    return Promise.all(this.plugins.map((plugin) => plugin.startServer(port)))
  }

  shutdown() {
    this.plugins.forEach((plugin) => plugin.shutdownServer())
  }

  /**
   * @deprecated The method should not be used, use ctx.states instead
   */
  stateDiff(config: ProcessConfigResponse): boolean {
    return this.plugins.some((plugin) => plugin.stateDiff(config))
  }

  processBinding(
    request: DataBinding,
    preparedData: PreparedData | undefined,
    dbContext?: IDataBindingContext | IStoreContext
  ): Promise<ProcessResult> {
    const plugin = this.typesToPlugin.get(request.handlerType)
    if (!plugin) {
      throw new Error(`No plugin for ${request.handlerType}`)
    }
    return this.dbContextLocalStorage.run(dbContext, () => {
      return plugin.processBinding(request, preparedData)
    })
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    const plugin = this.typesToPlugin.get(request.handlerType)
    if (!plugin) {
      throw new Error(`No plugin for ${request.handlerType}`)
    }
    return plugin.partition(request)
  }

  preprocessBinding(
    request: DataBinding,
    preprocessStore: { [k: string]: any },
    dbContext?: IDataBindingContext | IStoreContext
  ): Promise<PreprocessResult> {
    const plugin = this.typesToPlugin.get(request.handlerType)
    if (!plugin) {
      throw new Error(`No plugin for ${request.handlerType}`)
    }
    return this.dbContextLocalStorage.run(dbContext, () => {
      return plugin.preprocessBinding(request, preprocessStore)
    })
  }

  async updateTemplates(request: UpdateTemplatesRequest) {
    for (const plugin of this.plugins) {
      await plugin.start(
        create(StartRequestSchema, {
          templateInstances: request.templateInstances
        })
      )
    }
  }
}
