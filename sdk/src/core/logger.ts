import { BaseContext } from './context'
import { Labels, GetRecordMetaData } from './metadata'
import { LogLevel } from '@sentio/sdk'

export class Logger {
  private readonly ctx: BaseContext

  constructor(ctx: BaseContext) {
    this.ctx = ctx
  }

  log(level: LogLevel, message: any, labels: Labels = {}) {
    // TODO

    if (typeof message !== 'string' && !(message instanceof String)) {
      message = message.toString()
    }

    this.ctx.logs.push({
      metadata: GetRecordMetaData(this.ctx, undefined, labels),
      level,
      message,
      runtimeInfo: undefined,
    })
  }

  info(msg: any, labels: Labels = {}) {
    this.log(LogLevel.INFO, msg, labels)
  }

  warn(msg: any, labels: Labels = {}) {
    this.log(LogLevel.WARNING, msg, labels)
  }

  error(msg: any, labels: Labels = {}) {
    this.log(LogLevel.ERROR, msg, labels)
  }

  critical(msg: any, labels: Labels = {}) {
    this.log(LogLevel.CRITICAL, msg, labels)
  }
}
