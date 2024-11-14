import { ActionProcessorOption, HTTPMethod, Route } from './types.js'
import { ListStateStorage } from '@sentio/runtime'
import { Type, TSchema, TypedActionHandler, TypedActionRequest, T, TSchemNoBody } from './schema.js'

export class TypedActionProcessorState extends ListStateStorage<TypedActionProcessor> {
  static INSTANCE = new TypedActionProcessorState()
}

export interface TypedRoute extends Route {
  schema: TSchema<any, any, any>
}

export class TypedActionProcessor {
  route: TypedRoute[] = []

  constructor(readonly option?: ActionProcessorOption) {
    TypedActionProcessorState.INSTANCE.addValue(this)
  }

  static bind(options?: ActionProcessorOption) {
    return new TypedActionProcessor(options)
  }

  onGet<TQuery extends Type<any>, TPath extends Type<any>>(
    path: string,
    schema: TSchemNoBody<TQuery, TPath>,
    handler: TypedActionHandler<never, TQuery, TPath>
  ): TypedActionProcessor {
    return this.onAction('GET', path, schema, handler)
  }

  onPost<TBody extends Type<any>, TQuery extends Type<any>, TPath extends Type<any>>(
    path: string,
    schema: TSchema<TBody, TQuery, TPath>,
    handler: TypedActionHandler<TBody, TQuery, TPath>
  ): TypedActionProcessor {
    return this.onAction('POST', path, schema, handler)
  }

  onPut<TBody extends Type<any>, TQuery extends Type<any>, TPath extends Type<any>>(
    path: string,
    schema: TSchema<TBody, TQuery, TPath>,
    handler: TypedActionHandler<TBody, TQuery, TPath>
  ): TypedActionProcessor {
    return this.onAction('PUT', path, schema, handler)
  }

  onDelete<TQuery extends Type<any>, TPath extends Type<any>>(
    path: string,
    schema: TSchemNoBody<TQuery, TPath>,
    handler: TypedActionHandler<never, TQuery, TPath>
  ): TypedActionProcessor {
    return this.onAction('PUT', path, schema, handler)
  }

  onAction<TBody extends Type<any>, TQuery extends Type<any>, TPath extends Type<any>>(
    method: unknown,
    path: string,
    schema: TSchema<TBody, TQuery, TPath>,
    handler: TypedActionHandler<TBody, TQuery, TPath>
  ): TypedActionProcessor {
    this.route.push({
      method: method as HTTPMethod,
      schema,
      url: path,
      handler: async (request, context) => {
        // no need, fastify should do validate
        // schema.body?.validate?.(request.body)
        // schema.query?.validate?.(request.query)
        // schema.params?.validate?.(request.params)

        const req = {
          body: request.body,
          query: request.query,
          params: request.params,
          headers: request.headers
        } as TypedActionRequest<TBody, TQuery, TPath>

        return handler(req, context)
      }
    })
    return this
  }
}
