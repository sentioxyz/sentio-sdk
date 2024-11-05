import fastify from 'fastify'

import { Plugin, PluginManager } from '@sentio/runtime'
import { ProcessConfigResponse } from '@sentio/protos'
import { ActionProcessorState } from './action-processor.js'

export class ActionPlugin extends Plugin {
  server = fastify()

  constructor() {
    super()
  }

  async configure(config: ProcessConfigResponse): Promise<void> {
    for (const processor of ActionProcessorState.INSTANCE.getValues()) {
      for (const route of processor.route) {
        this.server.route({
          method: route.method,
          url: route.url,
          handler: async (request, reply) => {
            const context = {}
            return route.handler(request, context)
          }
        })
      }
    }
  }

  async startServer(port: number): Promise<void> {
    this.server.get('/healthz', async (request, reply) => {
      return 'OK'
    })

    this.server.listen({ port }, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening at ${address}`)
    })
  }
}

PluginManager.INSTANCE.register(new ActionPlugin())
