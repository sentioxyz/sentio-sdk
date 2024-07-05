import {
  DataBinding,
  HandlerType,
  PreparedData,
  PreprocessResult,
  ProcessConfigResponse,
  ProcessResult,
  StartRequest
} from '@sentio/protos'
import { StoreContext } from './db-context.js'
import { AsyncLocalStorage } from 'node:async_hooks'

export abstract class Plugin {
  name: string
  supportedHandlers: HandlerType[] = []

  async configure(config: ProcessConfigResponse): Promise<void> {}
  async start(start: StartRequest): Promise<void> {}

  /**
   * @deprecated The method should not be used, use ctx.states instead
   */
  stateDiff(config: ProcessConfigResponse): boolean {
    return false
  }

  async processBinding(request: DataBinding, preparedData: PreparedData | undefined): Promise<ProcessResult> {
    return ProcessResult.create()
  }

  async preprocessBinding(request: DataBinding): Promise<PreprocessResult> {
    return PreprocessResult.create()
  }
}

export class PluginManager {
  static INSTANCE = new PluginManager()

  dbContextLocalStorage = new AsyncLocalStorage<StoreContext | undefined>()
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

  configure(config: ProcessConfigResponse) {
    return Promise.all(this.plugins.map((plugin) => plugin.configure(config)))
  }

  start(start: StartRequest) {
    return Promise.all(this.plugins.map((plugin) => plugin.start(start)))
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
    dbContext?: StoreContext
  ): Promise<ProcessResult> {
    const plugin = this.typesToPlugin.get(request.handlerType)
    if (!plugin) {
      throw new Error(`No plugin for ${request.handlerType}`)
    }
    return this.dbContextLocalStorage.run(dbContext, () => {
      return plugin.processBinding(request, preparedData)
    })
  }

  preprocessBinding(request: DataBinding, dbContext?: StoreContext): Promise<PreprocessResult> {
    const plugin = this.typesToPlugin.get(request.handlerType)
    if (!plugin) {
      throw new Error(`No plugin for ${request.handlerType}`)
    }
    return this.dbContextLocalStorage.run(dbContext, () => {
      return plugin.preprocessBinding(request)
    })
  }
}
