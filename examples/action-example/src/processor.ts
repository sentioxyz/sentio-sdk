import { ActionProcessor } from '@sentio/action'

ActionProcessor.bind()
  .onGet('/', async (request, context) => {
    return 'Hello, World!'
  })
  .onAction(async (request, context) => {
    return {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body
    }
  })
