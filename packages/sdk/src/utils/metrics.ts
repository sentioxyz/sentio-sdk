import { AsyncLocalStorage } from 'node:async_hooks'
import { processMetrics } from '@sentio/runtime'

export const metricsStorage = new AsyncLocalStorage<string>()

export function handlersProxy<T extends object>(): ProxyHandler<T> {
  return {
    set: (target, prop, value, receiver) => {
      if (value.handler) {
        const handlerName = metricsStorage.getStore()
        const handler = value.handler
        value.handler = async (...args: any) => {
          const startTs = Date.now()
          const res = await handler(...args)
          processMetrics.process_handler_duration.record(Date.now() - startTs, { handler: handlerName })
          return res
        }
      }
      return Reflect.set(target, prop, value, receiver)
    }
  }
}
