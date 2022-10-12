import { BaseContext } from './context'
import { Labels, GetRecordMetaData } from './metadata'
import { LogLevel } from '../gen'

export type Attributes = Record<string, any>

export class Logger {
  private readonly ctx: BaseContext
  private readonly name: string

  constructor(ctx: BaseContext, name = '') {
    this.ctx = ctx
    this.name = name
  }

  withName(name: string) {
    return new Logger(this.ctx, name)
  }

  log(level: LogLevel, message: any, attributes: Attributes = {}) {
    if (typeof message !== 'string' && !(message instanceof String)) {
      message = message.toString()
    }

    this.ctx.logs.push({
      name: this.name,
      metadata: GetRecordMetaData(this.ctx, undefined, {}),
      level,
      message,
      attributes: JSON.stringify(attributes),
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
