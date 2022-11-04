import { BaseContext } from './context'
import { DataDescriptor, ExportResult, ExportConfig_ExportType } from '@sentio/sdk'

export type Export = Record<string, any>

export interface ExporterOptions {
  exportType: ExportConfig_ExportType
  exportUrl: string
}

export class Exporter {
  static register(exporterName: string, options: ExporterOptions) {
    const exporter = new Exporter(exporterName, options)
    global.PROCESSOR_STATE.exporters.push(exporter)
    return exporter
  }

  exportName: string
  options: ExporterOptions
  protected constructor(eventName: string, options: ExporterOptions) {
    this.exportName = eventName
    this.options = options
  }

  emit(ctx: BaseContext, data: Export) {
    const res: ExportResult = {
      metadata: ctx.getMetaData(DataDescriptor.fromPartial({ name: this.exportName }), {}),
      payload: JSON.stringify(data),
      runtimeInfo: undefined,
    }
    ctx.res.exports.push(res)
  }
}
