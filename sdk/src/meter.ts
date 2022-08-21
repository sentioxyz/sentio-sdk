import { RecordMetaData } from './gen/processor/protos/processor'
import { Context, SolanaContext } from './context'
import { convertNumber, Numberish } from './numberish'
import Long from 'long'

function GetRecordMetaData(ctx: Context<any, any> | SolanaContext, name: string, labels: Labels): RecordMetaData {
  if (ctx instanceof Context) {
    if (ctx.log) {
      return {
        contractAddress: ctx.contract._underlineContract.address,
        blockNumber: Long.fromNumber(ctx.log.blockNumber, true), // TODO need number type to be long
        transactionIndex: ctx.log.transactionIndex,
        logIndex: ctx.log.logIndex,
        chainId: ctx.chainId,
        name: name,
        labels: labels,
      }
    }
    if (ctx.block) {
      return {
        contractAddress: ctx.contract._underlineContract.address,
        blockNumber: Long.fromNumber(ctx.block.number, true),
        transactionIndex: -1,
        logIndex: -1,
        chainId: ctx.chainId,
        name: name,
        labels: labels,
      }
    }
  } else if (ctx instanceof SolanaContext) {
    return {
      contractAddress: ctx.address,
      blockNumber: Long.ZERO, // TODO need number type to be long
      transactionIndex: 0,
      logIndex: 0,
      chainId: 'SOL:mainnet', // TODO set in context
      name: name,
      labels: labels,
    }
  }
  throw new Error("This can't happen")
}

export type Labels = { [key: string]: string }

export class Counter {
  private readonly ctx: Context<any, any> | SolanaContext
  private readonly name: string

  constructor(name: string, ctx: Context<any, any> | SolanaContext) {
    this.name = name
    this.ctx = ctx
  }

  add(value: Numberish, labels: Labels = {}) {
    this.record(value, labels, true)
  }

  sub(value: Numberish, labels: Labels = {}) {
    this.record(value, labels, false)
  }

  private record(value: Numberish, labels: Labels, add: boolean) {
    this.ctx.counters.push({
      metadata: GetRecordMetaData(this.ctx, this.name, labels),
      metricValue: convertNumber(value),
      add: add,
    })
  }
}

export class Gauge {
  private readonly name: string
  private readonly ctx: Context<any, any> | SolanaContext

  constructor(name: string, ctx: Context<any, any> | SolanaContext) {
    this.name = name
    this.ctx = ctx
  }

  record(value: Numberish, labels: Labels = {}) {
    this.ctx.gauges.push({
      metadata: GetRecordMetaData(this.ctx, this.name, labels),
      metricValue: convertNumber(value),
    })
  }
}

export class Meter {
  private readonly ctx: Context<any, any> | SolanaContext

  // TODO is map necessary since we are sending request remotely?
  // counterMap = new Map<string, Counter>()
  // gaugeMap = new Map<string, Gauge>()

  constructor(ctx: Context<any, any> | SolanaContext) {
    this.ctx = ctx
  }

  Counter(name: string): Counter {
    // let counter = this.counterMap.get(name)

    // if (!counter) {
    //     counter =  new Counter(name, this.ctx)
    // }
    // return counter

    return new Counter(name, this.ctx)
  }

  Gauge(name: string): Gauge {
    // let gauge = this.gaugeMap.get(name)
    //
    // if (!gauge) {
    //     gauge = new Gauge(name, this.ctx)
    // }
    // return gauge
    return new Gauge(name, this.ctx)
  }
}
