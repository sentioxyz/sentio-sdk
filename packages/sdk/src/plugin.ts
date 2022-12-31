import { DataBinding, HandlerType, ProcessConfigResponse, ProcessResult } from './gen'

export interface Plugin {
  name: string
  supportedHandlers: HandlerType[]

  configure(config: ProcessConfigResponse): void
  processBinding(request: DataBinding): Promise<ProcessResult>
}

export class PluginManager {
  static INSTANCE = new PluginManager()

  plugins: Plugin[] = []
  typesToPlugin = new Map<HandlerType, Plugin>()

  register(plugin: Plugin) {
    this.plugins.push(plugin)
    // for (const plugin of this.plugins) {
    for (const handlerType of plugin.supportedHandlers) {
      const exsited = this.typesToPlugin.get(handlerType)
      if (exsited) {
        throw new Error(`Duplicate plugin for ${handlerType}: ${exsited.name} and ${plugin.name}`)
      }
      this.typesToPlugin.set(handlerType, plugin)
    }
    // }
  }

  configure(config: ProcessConfigResponse) {
    this.plugins.forEach((plugin) => plugin.configure(config))
  }

  processBinding(request: DataBinding): Promise<ProcessResult> {
    const plugin = this.typesToPlugin.get(request.handlerType)
    if (!plugin) {
      throw new Error(`No plugin for ${request.handlerType}`)
    }
    return plugin.processBinding(request)
  }
}
