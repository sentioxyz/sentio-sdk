import fastify, { FastifyRequest } from 'fastify'
import { ListStateStorage } from '@sentio/runtime'

type ActionHandler<RESP> = (request: FastifyRequest, context: any) => Promise<RESP>

type HTTPMethod = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS'

const HTTPMethods: HTTPMethod[] = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS']

type ActionProcessorOption = {
  name?: string
}

type Route = {
  method: HTTPMethod | HTTPMethod[]
  url: string
  handler: ActionHandler<unknown>
}

interface IActionsProcessor<T> {
  onAction<RESP>(handler: ActionHandler<RESP>): T

  onAction<RESP>(method: HTTPMethod | HTTPMethod[], handler: ActionHandler<RESP>): T

  onAction<RESP>(method: HTTPMethod | HTTPMethod[], url: string, handler: ActionHandler<RESP>): T
}

export class ActionProcessorState extends ListStateStorage<ActionProcessor> {
  static INSTANCE = new ActionProcessorState()
}

const server = fastify()

export class ActionProcessor implements IActionsProcessor<ActionProcessor> {
  route: Route[] = []
  constructor(readonly option?: ActionProcessorOption) {
    ActionProcessorState.INSTANCE.addValue(this)
  }

  onGet<RESP>(path: string, handler: ActionHandler<RESP>): ActionProcessor {
    return this.onAction('GET', path, handler)
  }
  onPost<RESP>(path: string, handler: ActionHandler<RESP>): ActionProcessor {
    return this.onAction('POST', path, handler)
  }
  onPut<RESP>(path: string, handler: ActionHandler<RESP>): ActionProcessor {
    return this.onAction('PUT', path, handler)
  }
  onDelete<RESP>(path: string, handler: ActionHandler<RESP>): ActionProcessor {
    return this.onAction('DELETE', path, handler)
  }
  onAll<RESP>(path: string, handler: ActionHandler<RESP>): ActionProcessor {
    return this.onAction(HTTPMethods, path, handler)
  }

  onAction<RESP>(handler: ActionHandler<RESP>): ActionProcessor
  onAction<RESP>(method: HTTPMethod | HTTPMethod[], handler: ActionHandler<RESP>): ActionProcessor
  onAction<RESP>(method: HTTPMethod | HTTPMethod[], url: string, handler: ActionHandler<RESP>): ActionProcessor
  onAction(method: unknown, url?: unknown, handler?: unknown): ActionProcessor {
    if (typeof method === 'function') {
      const handler = method as ActionHandler<unknown>
      this.route.push({ handler, url: "*", method: HTTPMethods })
    } else if (typeof url === 'function') {
      const handler = url as ActionHandler<unknown>
      this.route.push({ method: method as HTTPMethod, handler, url: "*" })
    } else {
      const h = handler as ActionHandler<unknown>
      this.route.push({ method: method as HTTPMethod, url: url as string, handler: h })
    }

    return this
  }

  static bind(options?: ActionProcessorOption) {
    return new ActionProcessor(options)
  }
}



