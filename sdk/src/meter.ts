import { MetricDescriptor, RecordMetaData } from './gen/processor/protos/processor'
import { BaseContext, Context, SolanaContext, SuiContext } from './context'
import { toMetricValue, Numberish } from './numberish'
import Long from 'long'

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

function GetRecordMetaData(ctx: BaseContext, metric: Metric, labels: Labels): RecordMetaData {
  let descriptor = metric.descriptor
  if (metric.usage > 0) {
    // Other setting don't need to be write multiple times
    descriptor = MetricDescriptor.fromPartial({ name: descriptor.name })
  }

  descriptor.name = normalizeName(descriptor.name)

  if (ctx instanceof Context) {
    if (ctx.log) {
      return {
        contractAddress: ctx.contract.rawContract.address,
        blockNumber: Long.fromNumber(ctx.log.blockNumber, true), // TODO need number type to be long
        transactionIndex: ctx.log.transactionIndex,
        logIndex: ctx.log.logIndex,
        chainId: ctx.chainId.toString(),
        name: descriptor.name,
        descriptor: descriptor,
        labels: normalizeLabels(labels),
      }
    }
    if (ctx.block) {
      return {
        contractAddress: ctx.contract.rawContract.address,
        blockNumber: Long.fromNumber(ctx.block.number, true),
        transactionIndex: -1,
        logIndex: -1,
        chainId: ctx.chainId.toString(),
        name: descriptor.name,
        descriptor: descriptor,
        labels: normalizeLabels(labels),
      }
    }
    if (ctx.trace) {
      return {
        contractAddress: ctx.contract.rawContract.address,
        blockNumber: Long.fromNumber(ctx.trace.blockNumber, true),
        transactionIndex: ctx.trace.transactionPosition, // TODO make sure if this is the right value to set
        logIndex: -1,
        chainId: ctx.chainId.toString(),
        name: descriptor.name,
        descriptor: descriptor,
        labels: normalizeLabels(labels),
      }
    }
  } else if (ctx instanceof SolanaContext) {
    return {
      contractAddress: ctx.address,
      blockNumber: Long.ZERO, // TODO need number type to be long
      transactionIndex: 0,
      logIndex: 0,
      chainId: 'SOL_mainnet', // TODO set in context
      name: descriptor.name,
      descriptor: descriptor,
      labels: normalizeLabels(labels),
    }
  } else if (ctx instanceof SuiContext) {
    return {
      contractAddress: ctx.address,
      blockNumber: Long.ZERO, // TODO need number type to be long
      transactionIndex: 0,
      logIndex: 0,
      chainId: 'SUI_devnet', // TODO set in context
      name: descriptor.name,
      descriptor: descriptor,
      labels: normalizeLabels(labels),
    }
  }
  throw new Error("This can't happen")
}

export type Labels = { [key: string]: string }

export class MetricDescriptorOption {
  unit?: string
  description?: string
  sparse?: boolean
}

export class Metric {
  descriptor: MetricDescriptor = MetricDescriptor.fromPartial({})
  usage = 0

  constructor(name: string, option?: MetricDescriptorOption) {
    this.descriptor.name = name
    if (option) {
      if (option.unit) {
        this.descriptor.unit = option.unit
      }
      if (option.description) {
        this.descriptor.description = option.description
      }
      if (option.sparse) {
        this.descriptor.sparse = option.sparse
      }
    }
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
      metadata: GetRecordMetaData(ctx, this, labels),
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
      metadata: GetRecordMetaData(ctx, this, labels),
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
