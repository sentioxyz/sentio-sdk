import { BaseContext } from './base-context'
import { DataDescriptor, ExportResult } from '@sentio/sdk'

export type Export = Record<string, any>

export class Exporter {
  static register(name: string, channel: string) {
    const exporter = new Exporter(name, channel)
    global.PROCESSOR_STATE.exporters.push(exporter)
    return exporter
  }

  name: string
  channel: string
  protected constructor(name: string, channel: string) {
    this.name = name
    this.channel = channel
  }

  emit(ctx: BaseContext, data: Export) {
    const res: ExportResult = {
      metadata: ctx.getMetaData(DataDescriptor.fromPartial({ name: this.name }), {}),
      payload: JSON.stringify(data),
      runtimeInfo: undefined,
    }
    ctx.res.exports.push(res)
  }
}
