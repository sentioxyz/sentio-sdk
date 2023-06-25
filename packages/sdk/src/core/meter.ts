import { BaseContext } from './base-context.js'
import { Numberish, toMetricValue } from './numberish.js'
import { NamedResultDescriptor } from './metadata.js'
import { AggregationConfig, AggregationType, MetricConfig, MetricType } from '@sentio/protos'
import { MapStateStorage } from '@sentio/runtime'

export type Labels = { [key: string]: string }

export class MetricOptions {
  unit?: string
  description?: string
  sparse?: boolean
  persistentBetweenVersion?: boolean
  aggregationConfig?: Partial<AggregationConfig>
}

export class CounterOptions {
  unit?: string
  description?: string
  sparse?: boolean
}

// enum MetricType {
//   Counter = 0,
//   Gauge = 1,
// }

export class Metric extends NamedResultDescriptor {
  config: MetricConfig
  constructor(type: MetricType, name: string, option?: MetricOptions) {
    super(name)
    this.config = MetricConfig.fromPartial({ name: this.name, type: type, ...option })
    const aggregationConfig = this.config.aggregationConfig
    if (aggregationConfig && aggregationConfig.intervalInMinutes.length) {
      if (aggregationConfig.intervalInMinutes.length > 1) {
        console.error('current only support one intervalInMinutes, only first interval will be used for', name)
      }
      if (aggregationConfig.intervalInMinutes[0] > 0 && aggregationConfig.types.length === 0) {
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
    if (metric && metric.config.type !== type) {
      throw Error(`redefine ${name} of metric type ${type} that is previously ${metric.config.type}`)
    }

    if (!metric) {
      if (type === MetricType.COUNTER) {
        metric = Counter._create(name, option)
      } else {
        metric = Gauge._create(name, option)
      }
    }
    metricMap.set(name, metric)
    return metric
  }
}

export class Counter extends Metric {
  static register(name: string, option?: CounterOptions): Counter {
    return MetricState.INSTANCE.getOrRegisterMetric(MetricType.COUNTER, name, option) as Counter
  }

  /**
   * internal use only, to create a metric use {@link register} instead
   */
  static _create(name: string, option?: MetricOptions): Counter {
    return new Counter(name, option)
  }

  private constructor(name: string, option?: MetricOptions) {
    super(MetricType.COUNTER, name, option)
  }

  add(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    this.record(ctx, value, labels, true)
  }

  sub(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    this.record(ctx, value, labels, false)
  }

  private record(ctx: BaseContext, value: Numberish, labels: Labels, add: boolean) {
    ctx.update({
      counters: [
        {
          metadata: ctx.getMetaData(this.name, labels),
          metricValue: toMetricValue(value),
          add: add,
          runtimeInfo: undefined,
        },
      ],
    })
  }
}

export class CounterBinding {
  private readonly ctx: BaseContext
  private readonly counter: Counter

  constructor(name: string, ctx: BaseContext) {
    this.counter = Counter._create(name)
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
    return MetricState.INSTANCE.getOrRegisterMetric(MetricType.GAUGE, name, option) as Gauge
  }

  /**
   * internal use only, to create a metric use {@link register} instead
   */
  static _create(name: string, option?: MetricOptions): Gauge {
    return new Gauge(name, option)
  }

  private constructor(name: string, option?: MetricOptions) {
    super(MetricType.GAUGE, name, option)
  }

  record(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    ctx.update({
      gauges: [
        {
          metadata: ctx.getMetaData(this.config.name, labels),
          metricValue: toMetricValue(value),
          runtimeInfo: undefined,
        },
      ],
    })
  }
}

export class GaugeBinding {
  private readonly gauge: Gauge
  private readonly ctx: BaseContext

  constructor(name: string, ctx: BaseContext) {
    this.gauge = Gauge._create(name)
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
