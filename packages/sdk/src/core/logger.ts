import { BaseContext } from './base-context.js'
import { LogLevel } from '@sentio/protos'
import { NamedResultDescriptor } from './metadata.js'
import { normalizeAttribute } from './normalization.js'

export type Attributes = Record<string, any>

export class Logger extends NamedResultDescriptor {
  private readonly ctx: BaseContext

  constructor(ctx: BaseContext, name = '') {
    super(name)
    this.ctx = ctx
  }

  withName(name: string) {
    return new Logger(this.ctx, name)
  }

  protected log(level: LogLevel, message: any, attributes: Attributes = {}) {
    if (typeof message !== 'string' && !(message instanceof String)) {
      message = JSON.stringify(message)
    }

    const norm = normalizeAttribute(attributes)

    this.ctx._res.logs.push({
      // name: this.name,
      metadata: this.ctx.getMetaData(this.name, {}), // GetRecordMetaData(this.ctx, this, {}),
      level,
      message,
      attributes2: norm,
      runtimeInfo: undefined,
    })
  }

  info(msg: any, attributes: Attributes = {}) {
    this.log(LogLevel.INFO, msg, attributes)
  }

  warn(msg: any, attributes: Attributes = {}) {
    this.log(LogLevel.WARNING, msg, attributes)
  }

  error(msg: any, attributes: Attributes = {}) {
    this.log(LogLevel.ERROR, msg, attributes)
  }

  critical(msg: any, attributes: Attributes = {}) {
    this.log(LogLevel.CRITICAL, msg, attributes)
  }
}
