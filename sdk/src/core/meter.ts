import { BaseContext } from './base-context'
import { Numberish, toMetricValue } from './numberish'
import { Labels, NamedResultDescriptor } from './metadata'
import { AggregationConfig, AggregationType, MetricConfig } from '../gen'
import { MapStateStorage } from '../state/state-storage'

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

export class MetricOptions {
  unit?: string
  description?: string
  sparse?: boolean
  aggregationConfig?: Partial<AggregationConfig>
}

export class CounterOptions {
  unit?: string
  description?: string
  sparse?: boolean
}

enum MetricType {
  Counter = 0,
  Gauge = 1,
}

export class Metric extends NamedResultDescriptor {
  type: MetricType
  descriptor: MetricConfig
  constructor(type: MetricType, name: string, option?: MetricOptions) {
    super(name)
    this.type = type
    this.descriptor = MetricConfig.fromPartial({ name: this.name, ...option })
    const aggregationConfig = this.descriptor.aggregationConfig
    if (aggregationConfig) {
      if (aggregationConfig.intervalInMinutes > 0 && !aggregationConfig.types) {
        aggregationConfig.types = [AggregationType.SUM, AggregationType.COUNT]
      }
    }
  }
}

export class MetricState extends MapStateStorage<Metric> {
  static INSTANCE = new MetricState()

  getOrRegisterMetric(type: MetricType, name: string, option?: CounterOptions | MetricOptions): Metric {
    const metricMap = this.getOrRegister()
    let metric = metricMap.get(name)
    if (metric && metric.type !== type) {
      throw Error(`redefine ${name} of metric type ${type} that is previously ${metric.type}`)
    }

    if (!metric) {
      if (type === MetricType.Counter) {
        metric = new Counter(name, option)
      } else {
        metric = new Gauge(name, option)
      }
    }
    metricMap.set(name, metric)
    return metric
  }
}

export class Counter extends Metric {
  static register(name: string, option?: CounterOptions): Counter {
    return MetricState.INSTANCE.getOrRegisterMetric(MetricType.Counter, name, option) as Counter
  }

  constructor(name: string, option?: MetricOptions) {
    super(MetricType.Counter, name, option)
  }

  add(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    this.record(ctx, value, labels, true)
  }

  sub(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    this.record(ctx, value, labels, false)
  }

  private record(ctx: BaseContext, value: Numberish, labels: Labels, add: boolean) {
    ctx.res.counters.push({
      metadata: ctx.getMetaData(this.name, labels),
      metricValue: toMetricValue(value),
      add: add,
      runtimeInfo: undefined,
    })
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
  static register(name: string, option?: MetricOptions): Gauge {
    return MetricState.INSTANCE.getOrRegisterMetric(MetricType.Gauge, name, option) as Gauge
  }

  constructor(name: string, option?: MetricOptions) {
    super(MetricType.Counter, name, option)
  }

  record(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    ctx.res.gauges.push({
      metadata: ctx.getMetaData(this.descriptor.name, labels),
      metricValue: toMetricValue(value),
      runtimeInfo: undefined,
    })
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
