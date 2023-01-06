import { DataBinding, HandlerType, ProcessConfigResponse, ProcessResult, StartRequest } from '@sentio/protos'

export abstract class Plugin {
  name: string
  supportedHandlers: HandlerType[] = []

  configure(config: ProcessConfigResponse) {}
  start(start: StartRequest) {}
  stateDiff(config: ProcessConfigResponse): boolean {
    return false
  }
  async processBinding(request: DataBinding): Promise<ProcessResult> {
    return ProcessResult.fromPartial({})
  }
}

export class PluginManager {
  static INSTANCE = new PluginManager()

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
    this.plugins.forEach((plugin) => plugin.configure(config))
  }

  start(start: StartRequest) {
    this.plugins.forEach((plugin) => plugin.start(start))
  }

  stateDiff(config: ProcessConfigResponse): boolean {
    return this.plugins.some((plugin) => plugin.stateDiff(config))
  }

  processBinding(request: DataBinding): Promise<ProcessResult> {
    const plugin = this.typesToPlugin.get(request.handlerType)
    if (!plugin) {
      throw new Error(`No plugin for ${request.handlerType}`)
    }
    return plugin.processBinding(request)
  }
}
