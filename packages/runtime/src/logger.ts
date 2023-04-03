import util from 'util'
import { createLogger, format, transports } from 'winston'

export function setupJsonLogger() {
  const utilFormatter = {
    transform: (info: any) => {
      const args = info[Symbol.for('splat')]
      if (args) {
        info.message = util.format(info.message, ...args)
      } else {
        info.message = util.format(info.message)
      }
      return info
    },
  }
  const logger = createLogger({
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
      utilFormatter,
      format.errors({ stack: true }),
      format.json()
    ),
    transports: [new transports.Console()],
  })

  console.log = (...args) => logger.info.call(logger, ...args)
  console.info = (...args) => logger.info.call(logger, ...args)
  console.warn = (...args) => logger.warn.call(logger, ...args)
  console.error = (...args) => logger.error.call(logger, ...args)
  console.debug = (...args) => logger.debug.call(logger, ...args)
}
