import { AsyncLocalStorage } from 'node:async_hooks'
import { processMetrics, metricsStorage } from '@sentio/runtime'
import { Attributes } from '@opentelemetry/api'

export function getHandlerName() {
  return metricsStorage.getStore() || 'unknown'
}

export function proxyProcessor(cls: any) {
  return new Proxy(cls, {
    get: (target, prop, receiver) => {
      return metricsStorage.run(metricsStorage.getStore() || `${cls.constructor.name}.${prop.toString()}`, () => {
        const fn = (target as any)[prop]
        if (typeof fn == 'function') {
          return AsyncLocalStorage.bind((...args: any) => fn.apply(receiver, args))
        }
        return Reflect.get(target, prop, receiver)
      })
    }
  })
}
