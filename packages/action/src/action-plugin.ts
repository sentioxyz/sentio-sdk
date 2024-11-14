import fastify from 'fastify'

import { Plugin, PluginManager } from '@sentio/runtime'
import { ProcessConfigResponse } from '@sentio/protos'
import { ActionProcessorState } from './action-processor.js'
import { TypedActionProcessorState } from './typed-action-processor.js'
import { toJsonSchema } from './schema.js'

interface RouteDoc {
  method: string | string[]
  url: string
  schema?: any
}

export class ActionPlugin extends Plugin {
  server = fastify()
  name = 'action-plugin'

  constructor() {
    super()
  }

  async configure(config: ProcessConfigResponse): Promise<void> {
    const docs: RouteDoc[] = []

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
        docs.push({
          method: route.method,
          url: route.url
        })
      }
    }

    for (const processor of TypedActionProcessorState.INSTANCE.getValues()) {
      for (const route of processor.route) {
        const schema = toJsonSchema(route.schema)
        this.server.route({
          method: route.method,
          url: route.url,
          schema,
          handler: async (request, reply) => {
            const context = {}
            return route.handler(request, context)
          }
        })
        docs.push({
          method: route.method,
          url: route.url,
          schema
        })
      }
    }

    this.server.get('/_docs', async (request, reply) => {
      return docs
    })
  }

  async startServer(port: number): Promise<void> {
    this.server.get('/healthz', async (request, reply) => {
      return 'OK'
    })

    this.server.listen({ host: '0.0.0.0', port }, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Action server listening at ${address}`)
    })
  }

  async shutdownServer() {
    await this.server.close()
  }
}

PluginManager.INSTANCE.register(new ActionPlugin())
