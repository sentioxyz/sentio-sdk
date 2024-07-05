import { CallContext, ServerError, Status } from 'nice-grpc'
import { DebugInfo, RichServerError } from 'nice-grpc-error-details'
import { from } from 'ix/Ix.dom.asynciterable.js'
import { withAbort } from 'ix/Ix.dom.asynciterable.operators.js'

import {
  DataBinding,
  DeepPartial,
  Empty,
  EthCallParam,
  HandlerType,
  PreparedData,
  PreprocessResult,
  PreprocessStreamRequest,
  PreprocessStreamResponse,
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
import { metrics } from '@opentelemetry/api'
import { getProvider } from './provider.js'
import { EthChainId } from '@sentio/chain'
import { Provider, Interface } from 'ethers'

const meter = metrics.getMeter('processor_service')
const process_binding_count = meter.createCounter('process_binding_count')
const process_binding_time = meter.createCounter('process_binding_time')
const process_binding_error = meter.createCounter('process_binding_error')

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
    const ethCallResults = await this.preprocessBindings(request.bindings, undefined, options)

    const promises = []
    for (const binding of request.bindings) {
      const promise = this.processBinding(binding, { ethCallResults })
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

  async preprocessBindings(
    bindings: DataBinding[],
    dbContext?: StoreContext,
    options?: CallContext
  ): Promise<{ [calldata: string]: any[] }> {
    console.log('preprocessBindings start')
    const promises = []
    for (const binding of bindings) {
      promises.push(this.preprocessBinding(binding, dbContext, options))
    }
    let preprocessResults: PreprocessResult[]
    try {
      preprocessResults = await Promise.all(promises)
    } catch (e) {
      throw e
    }
    console.log(
      'ethCallParams: ',
      preprocessResults.map((r) => r.ethCallParams)
    )
    const groupedRequests = new Map<string, EthCallParam[]>()
    const providers = new Map<string, Provider>()
    for (const result of preprocessResults) {
      for (const param of result.ethCallParams) {
        if (!providers.has(param.chainId)) {
          providers.set(param.chainId, getProvider(param.chainId as EthChainId))
        }
        const key = param.chainId + '|' + param.address
        if (!groupedRequests.has(key)) {
          groupedRequests.set(key, [])
        }
        groupedRequests.get(key)!.push(param)
      }
    }

    const start = Date.now()
    const callPromises = []
    for (const params of groupedRequests.values()) {
      console.log(`chain: ${params[0].chainId}, address: ${params[0].address}, totalCalls: ${params.length}`)
      for (const param of params) {
        const frag = new Interface(param.signature)
        const calldata = frag.encodeFunctionData(param.function, param.args)
        callPromises.push(
          providers
            .get(param.chainId)!
            .call({
              to: param.address,
              data: calldata
            })
            .then((ret) => [calldata, frag.decodeFunctionResult(param.function, ret).toArray()] as [string, any[]])
        )
      }
    }
    const results = Object.fromEntries(await Promise.all(callPromises))
    console.log(`${callPromises.length} calls finished, elapsed: ${Date.now() - start}ms`)
    return results
  }

  async preprocessBinding(
    request: DataBinding,
    dbContext?: StoreContext,
    options?: CallContext
  ): Promise<PreprocessResult> {
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
    return await PluginManager.INSTANCE.preprocessBinding(request, dbContext)
  }

  async processBinding(
    request: DataBinding,
    preparedData: PreparedData | undefined,
    options?: CallContext
  ): Promise<ProcessResult> {
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
    const result = await PluginManager.INSTANCE.processBinding(request, preparedData)
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

  async handlePreprocessRequests(
    requests: AsyncIterable<PreprocessStreamRequest>,
    subject: Subject<DeepPartial<PreprocessStreamResponse>>
  ) {
    const contexts = new Contexts()

    for await (const request of requests) {
      try {
        console.debug('received request:', request)
        if (request.bindings) {
          const bindings = request.bindings.bindings
          const dbContext = contexts.new(request.processId, subject)
          const start = Date.now()
          this.preprocessBindings(bindings, dbContext)
            .then(() => {
              subject.next({
                processId: request.processId
              })
            })
            .catch((e) => {
              console.debug(e)
              dbContext.error(request.processId, e)
              process_binding_error.add(1)
            })
            .finally(() => {
              const cost = Date.now() - start
              console.debug('preprocessBinding', request.processId, ' took', cost, 'ms')
              process_binding_time.add(cost)
              contexts.delete(request.processId)
            })
        }
        if (request.dbResult) {
          const dbContext = contexts.get(request.processId)
          dbContext?.result(request.dbResult)
        }
      } catch (e) {
        // should not happen
        console.error('unexpect error during handle loop', e)
      }
    }
  }

  async *preprocessBindingsStream(requests: AsyncIterable<PreprocessStreamRequest>, context: CallContext) {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const subject = new Subject<DeepPartial<PreprocessStreamResponse>>()
    this.handlePreprocessRequests(requests, subject)
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
    const contexts = new Contexts()

    for await (const request of requests) {
      try {
        console.debug('received request:', request)
        if (request.binding) {
          process_binding_count.add(1)
          const binding = request.binding
          const dbContext = contexts.new(request.processId, subject)
          const start = Date.now()
          PluginManager.INSTANCE.processBinding(binding, undefined, dbContext)
            .then((result) => {
              subject.next({
                result,
                processId: request.processId
              })
              recordRuntimeInfo(result, binding.handlerType)
            })
            .catch((e) => {
              console.debug(e)
              dbContext.error(request.processId, e)
              process_binding_error.add(1)
            })
            .finally(() => {
              const cost = Date.now() - start
              console.debug('processBinding', request.processId, ' took', cost, 'ms')
              process_binding_time.add(cost)
              contexts.delete(request.processId)
            })
        }
        if (request.dbResult) {
          const dbContext = contexts.get(request.processId)
          dbContext?.result(request.dbResult)
        }
      } catch (e) {
        // should not happen
        console.error('unexpect error during handle loop', e)
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

class Contexts {
  private contexts: Map<number, StoreContext> = new Map()

  get(processId: number) {
    return this.contexts.get(processId)
  }

  new(processId: number, subject: Subject<DeepPartial<ProcessStreamResponse>>) {
    const context = new StoreContext(subject, processId)
    this.contexts.set(processId, context)
    return context
  }

  delete(processId: number) {
    const context = this.get(processId)
    context?.close()
    this.contexts.delete(processId)
  }
}
