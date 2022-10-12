import { BaseContext } from './context'
import { MetricDescriptor, RecordMetaData } from '../gen'
import { Metric, normalizeName } from './meter'

export type Labels = { [key: string]: string }

export function GetRecordMetaData(ctx: BaseContext, metric: Metric | undefined, labels: Labels): RecordMetaData {
  let descriptor = undefined
  if (metric) {
    descriptor = metric.descriptor
    if (metric.usage > 0) {
      // Other setting don't need to be write multiple times
      descriptor = MetricDescriptor.fromPartial({ name: descriptor.name })
    }

    descriptor.name = normalizeName(descriptor.name)
  }

  return ctx.getMetaData(descriptor, labels)
}
