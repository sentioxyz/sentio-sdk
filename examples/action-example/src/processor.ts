import { ActionProcessor, ActionRequest } from '@sentio/action'

ActionProcessor.bind()
  .onGet<string>('/hello/:name', async (request, context: any) => {
    const { name } = request.params
    return `Hello, ${name}!`
  })
  .onAction(async (request: ActionRequest, context) => {
    return {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      query: request.query
    }
  })
