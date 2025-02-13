import { AsyncLocalStorage } from 'node:async_hooks'
import { metricsStorage } from '@sentio/runtime'

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

export function proxyHandlers(arr: any[]) {
  return new Proxy(arr, {
    set: (target, prop, value, receiver) => {
      const handlerName = metricsStorage.getStore()
      if (value.handler && typeof value.handler == 'function' && handlerName) {
        const fn = value.handler
        value.handler = (...args: any) => metricsStorage.run(handlerName, () => fn.apply(receiver, args))
      }
      return Reflect.set(target, prop, value, receiver)
    }
  })
}
