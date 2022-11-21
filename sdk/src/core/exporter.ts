import { BaseContext } from './base-context'
import { ExportResult } from '@sentio/sdk'
import { NamedResultDescriptor } from './metadata'

export type Export = Record<string, any>

export class Exporter extends NamedResultDescriptor {
  static register(name: string, channel: string) {
    const exporter = new Exporter(name, channel)
    global.PROCESSOR_STATE.exporters.push(exporter)
    return exporter
  }

  channel: string
  protected constructor(name: string, channel: string) {
    super(name)
    this.channel = channel
  }

  emit(ctx: BaseContext, data: Export) {
    const res: ExportResult = {
      metadata: ctx.getMetaData(this.name, {}),
      payload: JSON.stringify(data),
      runtimeInfo: undefined,
    }
    ctx.res.exports.push(res)
  }
}
