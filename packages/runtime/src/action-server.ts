import { PluginManager } from './plugin.js'
import { ProcessConfigResponse } from '@sentio/protos'

export class ActionServer {
  constructor(readonly loader: () => Promise<void>) {}

  async listen(port: number) {
    const pluginManager = PluginManager.INSTANCE
    await this.loader()
    await pluginManager.configure(ProcessConfigResponse.create())
    console.log('Starting Action Server at:', port)
    await pluginManager.startServer(port)
  }

  forceShutdown() {
    PluginManager.INSTANCE.shutdown()
  }
}
