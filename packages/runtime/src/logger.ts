import { createLogger, format, transports } from 'winston'

function stringify(obj: any): string {
  const cache = new WeakSet()
  return JSON.stringify(obj, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]'
      }
      cache.add(value)
    }
    return value
  })
}

export function setupLogger(json: boolean, enableDebug: boolean, workerId?: number) {
  const utilFormatter = {
    transform: (info: any) => {
      const stringRes = []

      if (typeof info.message === 'object') {
        stringRes.push(stringify(info.message))
      } else {
        stringRes.push(info.message)
      }

      const args = info[Symbol.for('splat')]
      if (args) {
        for (const idx in args) {
          const arg = args[idx]
          if (typeof arg === 'object') {
            stringRes.push(stringify(arg))
          } else {
            stringRes.push(arg)
          }
        }
      }

      info.message = stringRes.join(' ')
      return info
    }
  }
  const logger = createLogger({
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
      utilFormatter,
      format.errors({ stack: true }),
      json ? format.json() : format.simple(),
      format.label({ label: workerId ? `worker #{workerId}` : '' })
    ),
    level: enableDebug ? 'debug' : 'info',
    transports: [new transports.Console()]
  })

  // Forward console output to winston, preserving `this` binding to the logger. The methods are
  // typed through `(...args: any[]) => unknown` so the variadic args can be applied without tripping
  // strict overload resolution on `Function.prototype.call`.
  const forward =
    (method: (...args: any[]) => unknown) =>
    (...args: any[]) => {
      method.apply(logger, args)
    }
  console.log = forward(logger.info)
  console.info = forward(logger.info)
  console.warn = forward(logger.warn)
  console.error = forward(logger.error)
  console.debug = forward(logger.debug)
}
