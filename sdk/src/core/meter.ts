import { BaseContext } from './context'
import { toMetricValue, Numberish } from './numberish'
import { DescriptorWithUsage, Labels } from './metadata'
import { DataDescriptor } from '../gen'

export function normalizeName(name: string): string {
  const regex = new RegExp('![_.a-zA-Z0-9]')
  return name.slice(0, 100).replace(regex, '_')
}

export function normalizeKey(name: string): string {
  if (name === 'labels') {
    return 'labels_'
  }
  return normalizeName(name)
}

export function normalizeValue(name: string): string {
  return name.slice(0, 100)
}

export function normalizeLabels(labels: Labels): Labels {
  const normLabels: Labels = {}
  for (const key in labels) {
    normLabels[normalizeKey(key)] = normalizeValue(labels[key])
  }
  return normLabels
}

export class MetricDescriptorOptions {
  unit?: string
  description?: string
  sparse?: boolean
  resolutionInSeconds?: number
}

export class Metric extends DescriptorWithUsage {
  constructor(name: string, option?: MetricDescriptorOptions) {
    const descriptor = DataDescriptor.fromPartial({ name })
    if (option) {
      if (option.unit) {
        descriptor.unit = option.unit
      }
      if (option.description) {
        descriptor.description = option.description
      }
      if (option.sparse) {
        descriptor.sparse = option.sparse
      }
      if (option.resolutionInSeconds) {
        descriptor.resolutionInSeconds = option.resolutionInSeconds
      }
    }
    super(descriptor)
  }
}

export class Counter extends Metric {
  add(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    this.record(ctx, value, labels, true)
  }

  sub(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    this.record(ctx, value, labels, false)
  }

  private record(ctx: BaseContext, value: Numberish, labels: Labels, add: boolean) {
    ctx.counters.push({
      metadata: ctx.getMetaData(this.getShortDescriptor(), labels),
      metricValue: toMetricValue(value),
      add: add,
      runtimeInfo: undefined,
    })
    this.usage++
  }
}

export class CounterBinding {
  private readonly ctx: BaseContext
  private readonly counter: Counter

  constructor(name: string, ctx: BaseContext) {
    this.counter = new Counter(name)
    this.ctx = ctx
  }

  add(value: Numberish, labels: Labels = {}) {
    this.counter.add(this.ctx, value, labels)
  }

  sub(value: Numberish, labels: Labels = {}) {
    this.counter.sub(this.ctx, value, labels)
  }
}

export class Gauge extends Metric {
  record(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    ctx.gauges.push({
      metadata: ctx.getMetaData(this.getShortDescriptor(), labels),
      metricValue: toMetricValue(value),
      runtimeInfo: undefined,
    })
    this.usage++
  }
}

export class GaugeBinding {
  private readonly gauge: Gauge
  private readonly ctx: BaseContext

  constructor(name: string, ctx: BaseContext) {
    this.gauge = new Gauge(name)
    this.ctx = ctx
  }

  record(value: Numberish, labels: Labels = {}) {
    this.gauge.record(this.ctx, value, labels)
  }
}

export class Meter {
  private readonly ctx: BaseContext

  constructor(ctx: BaseContext) {
    this.ctx = ctx
  }

  Counter(name: string): CounterBinding {
    return new CounterBinding(name, this.ctx)
  }

  Gauge(name: string): GaugeBinding {
    return new GaugeBinding(name, this.ctx)
  }
}
