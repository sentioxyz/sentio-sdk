import { CallContext, ServerError, Status } from 'nice-grpc'
import { DebugInfo, RichServerError } from 'nice-grpc-error-details'
import { from } from 'ix/Ix.dom.asynciterable.js'
import { withAbort } from 'ix/Ix.dom.asynciterable.operators.js'

import {
  DataBinding,
  DeepPartial,
  Empty,
  HandlerType,
  ProcessBindingResponse,
  ProcessBindingsRequest,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessorServiceImplementation,
  ProcessResult,
  ProcessStreamRequest,
  ProcessStreamResponse,
  StartRequest
} from '@sentio/protos'

import { PluginManager } from './plugin.js'
import { errorString, mergeProcessResults } from './utils.js'
import { freezeGlobalConfig, GLOBAL_CONFIG } from './global-config.js'

import { StoreContext } from './db-context.js'
import { Subject } from 'rxjs'
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export class ProcessorServiceImpl implements ProcessorServiceImplementation {
  private started = false
  // When there is unhandled error, stop process and return unavailable error
  unhandled: Error
  // private processorConfig: ProcessConfigResponse

  private readonly loader: () => Promise<any>

  private readonly shutdownHandler?: () => void

  constructor(loader: () => Promise<any>, shutdownHandler?: () => void) {
    this.loader = loader
    this.shutdownHandler = shutdownHandler
  }

  async getConfig(request: ProcessConfigRequest, context: CallContext): Promise<ProcessConfigResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }
    // if (!this.processorConfig) {
    //   throw new ServerError(Status.INTERNAL, 'Process config empty.')
    // }

    // Don't use .create to keep compatiblity
    const newConfig = ProcessConfigResponse.fromPartial({})
    await PluginManager.INSTANCE.configure(newConfig)
    return newConfig
  }

  //
  // async configure() {
  //   this.processorConfig = ProcessConfigResponse.fromPartial({})
  //   await PluginManager.INSTANCE.configure(this.processorConfig)
  // }

  async start(request: StartRequest, context: CallContext): Promise<Empty> {
    if (this.started) {
      return {}
    }

    freezeGlobalConfig()

    try {
      // for (const plugin of ['@sentio/sdk', '@sentio/sdk/eth']) {
      //   try {
      //     await import(plugin)
      //   } catch (e) {
      //     console.error('Failed to load plugin: ', plugin)
      //   }
      // }
      //
      // for (const plugin of ['@sentio/sdk/aptos', '@sentio/sdk/solana']) {
      //   try {
      //     await import(plugin)
      //   } catch (e) {}
      // }

      await this.loader()
    } catch (e) {
      throw new ServerError(Status.INVALID_ARGUMENT, 'Failed to load processor: ' + errorString(e))
    }

    await PluginManager.INSTANCE.start(request)

    // try {
    //   await this.configure()
    // } catch (e) {
    //   throw new ServerError(Status.INTERNAL, 'Failed to start processor : ' + errorString(e))
    // }
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
    const promises = []

    for (const binding of request.bindings) {
      const promise = this.processBinding(binding)
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    let promise
    try {
      promise = await Promise.all(promises)
    } catch (e) {
      throw e
    }
    const result = mergeProcessResults(promise)

    // let updated = false
    // if (PluginManager.INSTANCE.stateDiff(this.processorConfig)) {
    //   await this.configure()
    //   updated = true
    // }

    return {
      result
    }
  }

  async processBinding(request: DataBinding, options?: CallContext): Promise<ProcessResult> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }
    if (this.unhandled) {
      throw new RichServerError(
        Status.UNAVAILABLE,
        'Unhandled exception/rejection in previous request: ' + errorString(this.unhandled),
        [
          DebugInfo.fromPartial({
            detail: this.unhandled.message,
            stackEntries: this.unhandled.stack?.split('\n')
          })
        ]
      )
    }
    const result = await PluginManager.INSTANCE.processBinding(request)
    recordRuntimeInfo(result, request.handlerType)
    return result
  }

  async *processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: CallContext) {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const subject = new Subject<DeepPartial<ProcessStreamResponse>>()
    this.handleRequests(requests, subject)
      .then(() => {
        subject.complete()
      })
      .catch((e) => {
        console.error(e)
        subject.error(e)
      })
    yield* from(subject).pipe(withAbort(context.signal))
  }

  private async handleRequests(
    requests: AsyncIterable<ProcessStreamRequest>,
    subject: Subject<DeepPartial<ProcessStreamResponse>>
  ) {
    const contexts: Record<number, StoreContext> = {}

    for await (const request of requests) {
      console.log('received request:', request)
      if (request.binding) {
        const binding = request.binding
        const dbContext = new StoreContext(subject, request.processId)
        contexts[request.processId] = dbContext
        PluginManager.INSTANCE.processBinding(binding, dbContext)
          .then((result) => {
            subject.next({
              result,
              processId: request.processId
            })
            recordRuntimeInfo(result, binding.handlerType)
          })
          .catch((e) => {
            console.error(e)
            dbContext.error(request.processId, e)
          })
          .finally(() => {
            delete contexts[request.processId]
          })
      }
      if (request.dbResult) {
        const dbContext = contexts[request.processId]
        dbContext?.result(request.dbResult)
      }
    }
  }
}

function recordRuntimeInfo(results: ProcessResult, handlerType: HandlerType) {
  for (const list of [results.gauges, results.counters, results.events, results.exports]) {
    list.forEach((e) => {
      e.runtimeInfo = {
        from: handlerType
      }
    })
  }
}
