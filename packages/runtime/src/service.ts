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

import { PluginManager } from './plugin'
import { errorString, mergeProcessResults } from './utils'
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

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
    PluginManager.INSTANCE.configure(this.processorConfig)
  }

  async start(request: StartRequest, context: CallContext): Promise<Empty> {
    if (this.started) {
      return {}
    }

    try {
      for (const plugin of ['@sentio/sdk/lib/core/core-plugin', '@sentio/sdk/lib/core/eth-plugin']) {
        try {
          require(plugin)
        } catch (e) {
          console.error('Failed to load plugin: ', plugin)
        }
      }

      // for (const plugin of [
      //   '@sentio/sdk/lib/core/sui-plugin',
      //   '@sentio/sdk-aptos/lib/aptos-plugin',
      //   '@sentio/sdk-solana/lib/solana-plugin',
      // ]) {
      //   try {
      //     require(plugin)
      //   } catch (e) {}
      // }

      this.loader()
    } catch (e) {
      throw new ServerError(Status.INVALID_ARGUMENT, 'Failed to load processor: ' + errorString(e))
    }

    PluginManager.INSTANCE.start(request)

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
    if (PluginManager.INSTANCE.stateDiff(this.processorConfig)) {
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
      if (PluginManager.INSTANCE.stateDiff(this.processorConfig)) {
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

function recordRuntimeInfo(results: ProcessResult, handlerType: HandlerType) {
  for (const list of [results.gauges, results.counters, results.logs, results.events, results.exports]) {
    list.forEach((e) => {
      e.runtimeInfo = {
        from: handlerType,
      }
    })
  }
}
