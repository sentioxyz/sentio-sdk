import { CallContext, ServerError, Status } from 'nice-grpc'

import {
  DataBinding,
  HandlerType,
  ProcessBindingResponse,
  ProcessBindingsRequest,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessorServiceImplementation,
  ProcessResult,
  StartRequest,
} from '@sentio/protos'

import { Empty } from '@sentio/protos/lib/google/protobuf/empty'

import { MetricState } from './core/meter'
import { ExporterState } from './core/exporter'
import { EventTrackerState } from './core/event-tracker'
import { ProcessorTemplateProcessorState, TemplateInstanceState } from './core/base-processor-template'

// (Long.prototype as any).toBigInt = function() {
//   return BigInt(this.toString())
// };
import { PluginManager } from '@sentio/base'
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export const DEFAULT_MAX_BLOCK = 0n

export const USER_PROCESSOR = 'user_processor'

export class ProcessorServiceImpl implements ProcessorServiceImplementation {
  private started = false
  private processorConfig: ProcessConfigResponse

  private readonly loader: () => void

  private readonly shutdownHandler?: () => void

  constructor(loader: () => void, shutdownHandler?: () => void) {
    this.loader = loader
    this.shutdownHandler = shutdownHandler
  }

  async getConfig(request: ProcessConfigRequest, context: CallContext): Promise<ProcessConfigResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }
    if (!this.processorConfig) {
      throw new ServerError(Status.INTERNAL, 'Process config empty.')
    }
    return this.processorConfig
  }

  async configure() {
    this.processorConfig = ProcessConfigResponse.fromPartial({})
    // This syntax is to copy values instead of using references
    this.processorConfig.templateInstances = [...TemplateInstanceState.INSTANCE.getValues()]

    // part 0, prepare metrics and event tracking configs
    for (const metric of MetricState.INSTANCE.getValues()) {
      this.processorConfig.metricConfigs.push({
        ...metric.config,
      })
    }

    for (const eventTracker of EventTrackerState.INSTANCE.getValues()) {
      this.processorConfig.eventTrackingConfigs.push({
        distinctAggregationByDays: eventTracker.options.distinctByDays || [],
        eventName: eventTracker.name,
        retentionConfig: undefined,
        totalByDay: eventTracker.options.totalByDay || false,
        totalPerEntity: undefined,
        unique: eventTracker.options.unique || false,
      })
    }

    for (const exporter of ExporterState.INSTANCE.getValues()) {
      this.processorConfig.exportConfigs.push({
        name: exporter.name,
        channel: exporter.channel,
      })
    }

    PluginManager.INSTANCE.configure(this.processorConfig)
  }

  async start(request: StartRequest, context: CallContext): Promise<Empty> {
    if (this.started) {
      return {}
    }

    try {
      try {
        require('./core/eth-plugin')
        require('./core/sui-plugin')
        require('./aptos/aptos-plugin')
        require('./core/solana-plugin')
      } catch (e) {
        require('@sentio/sdk/lib/core/eth-plugin')
        require('@sentio/sdk/lib/core/sui-plugin')
        require('@sentio/sdk/lib/aptos/aptos-plugin')
        require('@sentio/sdk/lib/core/solana-plugin')
      }

      this.loader()
    } catch (e) {
      throw new ServerError(Status.INVALID_ARGUMENT, 'Failed to load processor: ' + errorString(e))
    }

    for (const instance of request.templateInstances) {
      const template = ProcessorTemplateProcessorState.INSTANCE.getValues()[instance.templateId]
      if (!template) {
        throw new ServerError(Status.INVALID_ARGUMENT, 'Invalid template contract:' + instance)
      }
      if (!instance.contract) {
        throw new ServerError(Status.INVALID_ARGUMENT, 'Contract Empty from:' + instance)
      }
      template.bind({
        name: instance.contract.name,
        address: instance.contract.address,
        network: Number(instance.contract.chainId),
        startBlock: instance.startBlock,
        endBlock: instance.endBlock,
      })
    }
    try {
      await this.configure()
    } catch (e) {
      throw new ServerError(Status.INTERNAL, 'Failed to start processor : ' + errorString(e))
    }
    this.started = true
    return {}
  }

  async stop(request: Empty, context: CallContext): Promise<Empty> {
    console.log('Server Shutting down in 5 seconds')
    if (this.shutdownHandler) {
      setTimeout(this.shutdownHandler, 5000)
    }
    return {}
  }

  async processBindings(request: ProcessBindingsRequest, options?: CallContext): Promise<ProcessBindingResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const promises = request.bindings.map((binding) => this.processBinding(binding))
    const result = mergeProcessResults(await Promise.all(promises))

    let updated = false
    const t = TemplateInstanceState.INSTANCE.getValues()
    if (TemplateInstanceState.INSTANCE.getValues().length !== this.processorConfig.templateInstances.length) {
      await this.configure()
      updated = true
    }

    return {
      result,
      configUpdated: updated,
    }
  }

  async processBinding(request: DataBinding, options?: CallContext): Promise<ProcessResult> {
    const result = await PluginManager.INSTANCE.processBinding(request)
    recordRuntimeInfo(result, request.handlerType)
    return result
  }

  async *processBindingsStream(requests: AsyncIterable<DataBinding>, context: CallContext) {
    for await (const request of requests) {
      const result = await this.processBinding(request)
      let updated = false
      if (TemplateInstanceState.INSTANCE.getValues().length !== this.processorConfig.templateInstances.length) {
        await this.configure()
        updated = true
      }
      yield {
        result,
        configUpdated: updated,
      }
    }
  }
}

// https://ourcodeworld.com/articles/read/164/how-to-convert-an-uint8array-to-string-in-javascript
/* eslint-disable */
export function Utf8ArrayToStr(array: Uint8Array) {
  let out, i, len, c
  let char2, char3

  out = ''
  len = array.length
  i = 0
  while (i < len) {
    c = array[i++]
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c)
        break
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++]
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f))
        break
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++]
        char3 = array[i++]
        out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0))
        break
    }
  }

  return out
}

export function mergeProcessResults(results: ProcessResult[]): ProcessResult {
  const res = ProcessResult.fromPartial({})

  for (const r of results) {
    res.counters = res.counters.concat(r.counters)
    res.gauges = res.gauges.concat(r.gauges)
    res.logs = res.logs.concat(r.logs)
    res.events = res.events.concat(r.events)
    res.exports = res.exports.concat(r.exports)
  }
  return res
}

function recordRuntimeInfo(results: ProcessResult, handlerType: HandlerType) {
  for (const list of [results.gauges, results.counters, results.logs, results.events, results.exports]) {
    list.forEach((e) => {
      e.runtimeInfo = {
        from: handlerType,
      }
    })
  }
}

export function errorString(e: Error): string {
  return e.stack || e.message
}
