import type { FastifyRequest } from 'fastify'

export type ActionRequest = FastifyRequest

export type ActionHandler<RESP> = (request: ActionRequest, context: any) => Promise<RESP>

export type HTTPMethod = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS'

export const HTTPMethods: HTTPMethod[] = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS']

export type ActionProcessorOption = {
  name?: string
}

export type Route = {
  method: HTTPMethod | HTTPMethod[]
  url: string
  handler: ActionHandler<unknown>
}

export class InvalidTypeError extends Error {
  readonly valueType: string
  constructor(
    readonly value: any,
    readonly expected: string
  ) {
    super(`Invalid type ${typeof value}, expected ${expected}`)
    this.valueType = typeof value
  }
}
