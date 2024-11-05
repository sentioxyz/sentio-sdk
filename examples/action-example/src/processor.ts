import { ActionProcessor } from '@sentio/action'

ActionProcessor.bind()
  .onGet('/', async (request: any, context: any) => {
    return 'Hello, World!'
  })
  .onAction(async (request: any, context: any) => {
    return {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body
    }
  })
