import { PluginManager } from './plugin.js'
import { ProcessConfigResponseSchema } from '@sentio/protos'
import { create } from '@bufbuild/protobuf'

export class ActionServer {
  constructor(readonly loader: () => Promise<void>) {}

  async listen(port: number) {
    const pluginManager = PluginManager.INSTANCE
    await this.loader()
    await pluginManager.configure(create(ProcessConfigResponseSchema))
    console.log('Starting Action Server at:', port)
    await pluginManager.startServer(port)
  }

  forceShutdown() {
    PluginManager.INSTANCE.shutdown()
  }
}
