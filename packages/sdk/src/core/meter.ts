import { BaseContext } from './base-context.js'
import { Numberish, toMetricValue, toTimeSeriesData } from './numberish.js'
import { NamedResultDescriptor } from './metadata.js'
import {
  AggregationConfig,
  AggregationType,
  MetricConfig,
  MetricType,
  TimeseriesResult_TimeseriesType
} from '@sentio/protos'
import { MapStateStorage, processMetrics } from '@sentio/runtime'

export type Labels = { [key: string]: string }

export class MetricOptions {
  unit?: string
  description?: string
  sparse?: boolean
  // persistentBetweenVersion?: boolean
  aggregationConfig?: Partial<AggregationConfig>
}

export class CounterOptions {
  unit?: string
  description?: string
  sparse?: boolean
  resolutionConfig?: {
    intervalInMinutes: number
  }
}

// enum MetricType {
//   Counter = 0,
//   Gauge = 1,
// }

export class Metric extends NamedResultDescriptor {
  config: MetricConfig

  constructor(type: MetricType, name: string, option?: MetricConfig) {
    super(name)
    this.config = MetricConfig.fromPartial({ ...option, name: this.name, type })
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

export class MetricStateNew extends MapStateStorage<Metric> {
  static INSTANCE = new MetricStateNew()

  getOrRegisterMetric(type: MetricType, name: string, option?: CounterOptions | MetricOptions): Metric {
    const metricMap = this.getOrRegister()
    let metric = metricMap.get(name)
    if (metric && metric.config.type !== type) {
      throw Error(`redefine ${name} of metric type ${type} that is previously ${metric.config.type}`)
    }

    if (!metric) {
      if (type === MetricType.COUNTER) {
        metric = CounterNew._create(name, option)
      } else {
        metric = GaugeNew._create(name, option)
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
  static _create(name: string, option?: CounterOptions): Counter {
    return new Counter(name, option)
  }

  protected constructor(name: string, option?: CounterOptions) {
    super(
      MetricType.COUNTER,
      name,
      MetricConfig.fromPartial({
        ...option,
        aggregationConfig: {
          intervalInMinutes: option?.resolutionConfig ? [option?.resolutionConfig?.intervalInMinutes] : []
        }
      })
    )
  }

  add(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    this.record(ctx, value, labels, true)
  }

  sub(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    this.record(ctx, value, labels, false)
  }

  private record(ctx: BaseContext, value: Numberish, labels: Labels, add: boolean) {
    processMetrics.process_metricrecord_count.add(1)
    ctx.update({
      counters: [
        {
          metadata: ctx.getMetaData(this.name, labels),
          metricValue: toMetricValue(value),
          add: add,
          runtimeInfo: undefined
        }
      ]
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

  protected constructor(name: string, option?: MetricOptions) {
    super(MetricType.GAUGE, name, MetricConfig.fromPartial({ ...option }))
  }

  record(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    processMetrics.process_metricrecord_count.add(1)
    ctx.update({
      gauges: [
        {
          metadata: ctx.getMetaData(this.config.name, labels),
          metricValue: toMetricValue(value),
          runtimeInfo: undefined
        }
      ]
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

export class MeterNew {
  private readonly ctx: BaseContext

  constructor(ctx: BaseContext) {
    this.ctx = ctx
  }

  Counter(name: string) {
    return new CounterNewBinding(name, this.ctx)
  }

  Gauge(name: string) {
    return new GaugeNewBinding(name, this.ctx)
  }
}

export class CounterNew extends Counter {
  static register(name: string, option?: CounterOptions): CounterNew {
    return MetricStateNew.INSTANCE.getOrRegisterMetric(MetricType.COUNTER, name, option) as CounterNew
  }

  /**
   * internal use only, to create a metric use {@link register} instead
   */
  static _create(name: string, option?: CounterOptions): CounterNew {
    return new CounterNew(name, option)
  }

  private constructor(name: string, option?: CounterOptions) {
    super(
      name,
      MetricConfig.fromPartial({
        ...option,
        aggregationConfig: {
          intervalInMinutes: option?.resolutionConfig ? [option?.resolutionConfig?.intervalInMinutes] : []
        }
      })
    )
  }

  add(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    this.recordNew(ctx, value, labels, true)
  }

  sub(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    this.recordNew(ctx, value, labels, false)
  }

  private recordNew(ctx: BaseContext, value: Numberish, labels: Labels, add: boolean) {
    processMetrics.process_metricrecord_count.add(1)
    ctx.update({
      timeseriesResult: [
        {
          metadata: ctx.getMetaData(this.name, labels),
          type: TimeseriesResult_TimeseriesType.COUNTER,
          data: toTimeSeriesData(value, labels, !add),
          runtimeInfo: undefined
        }
      ]
    })
  }
}

export class GaugeNewBinding {
  private readonly gauge: GaugeNew
  private readonly ctx: BaseContext

  constructor(name: string, ctx: BaseContext) {
    this.gauge = GaugeNew._create(name)
    this.ctx = ctx
  }

  record(value: Numberish, labels: Labels = {}) {
    this.gauge.record(this.ctx, value, labels)
  }
}

export class CounterNewBinding {
  private readonly counter: CounterNew
  private readonly ctx: BaseContext

  constructor(name: string, ctx: BaseContext) {
    this.counter = CounterNew._create(name)
    this.ctx = ctx
  }

  add(value: Numberish, labels: Labels = {}) {
    this.counter.add(this.ctx, value, labels)
  }

  sub(value: Numberish, labels: Labels = {}) {
    this.counter.sub(this.ctx, value, labels)
  }
}

export class GaugeNew extends Gauge {
  static register(name: string, option?: MetricOptions): Gauge {
    return MetricStateNew.INSTANCE.getOrRegisterMetric(MetricType.GAUGE, name, option) as Gauge
  }

  /**
   * internal use only, to create a metric use {@link register} instead
   */
  static _create(name: string, option?: MetricOptions): GaugeNew {
    return new GaugeNew(name, option)
  }

  private constructor(name: string, option?: MetricOptions) {
    super(name, MetricConfig.fromPartial({ ...option }))
  }

  record(ctx: BaseContext, value: Numberish, labels: Labels = {}) {
    processMetrics.process_metricrecord_count.add(1)
    ctx.update({
      timeseriesResult: [
        {
          metadata: ctx.getMetaData(this.name, labels),
          type: TimeseriesResult_TimeseriesType.GAUGE,
          data: toTimeSeriesData(value, labels, false),
          runtimeInfo: undefined
        }
      ]
    })
  }
}
