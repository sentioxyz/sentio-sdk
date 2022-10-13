import { BaseContext } from './context'
import { DataDescriptor, LogLevel } from '../gen'
import { DescriptorWithUsage, Labels } from './metadata'

export type Attributes = Record<string, any>

export class Logger extends DescriptorWithUsage {
  private readonly ctx: BaseContext

  constructor(ctx: BaseContext, name = '') {
    super(DataDescriptor.fromPartial({ name }))
    this.ctx = ctx
  }

  withName(name: string) {
    return new Logger(this.ctx, name)
  }

  log(level: LogLevel, message: any, attributes: Attributes = {}) {
    if (typeof message !== 'string' && !(message instanceof String)) {
      message = message.toString()
    }

    this.usage++
    this.ctx.logs.push({
      // name: this.name,
      metadata: this.ctx.getMetaData(this.getShortDescriptor(), {}), // GetRecordMetaData(this.ctx, this, {}),
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
