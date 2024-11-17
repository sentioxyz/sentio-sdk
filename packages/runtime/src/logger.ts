import { createLogger, format, transports } from 'winston'

function stringify(obj: any) {
  let cache: any[] = []
  const str = JSON.stringify(obj, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return
      }
      // Store value in our collection
      cache.push(value)
    }
    return value
  })
  cache = []
  return str
}

export function setupLogger(json: boolean, enableDebug: boolean) {
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
      json ? format.json() : format.simple()
    ),
    level: enableDebug ? 'debug' : 'info',
    transports: [new transports.Console()]
  })

  console.log = (...args) => logger.info.call(logger, ...args)
  console.info = (...args) => logger.info.call(logger, ...args)
  console.warn = (...args) => logger.warn.call(logger, ...args)
  console.error = (...args) => logger.error.call(logger, ...args)
  console.debug = (...args) => logger.debug.call(logger, ...args)
}
