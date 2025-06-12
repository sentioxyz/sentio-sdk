import { CallContext, ServerError, Status } from 'nice-grpc'
import { DebugInfo, RichServerError } from 'nice-grpc-error-details'
import { from } from 'ix/Ix.asynciterable'
import { withAbort } from 'ix/Ix.asynciterable.operators'

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
import { errorString, makeEthCallKey, mergeProcessResults } from './utils.js'
import { freezeGlobalConfig, GLOBAL_CONFIG } from './global-config.js'

import { StoreContext } from './db-context.js'
import { Subject } from 'rxjs'
import { getProvider } from './provider.js'
import { EthChainId } from '@sentio/chain'
import { Provider } from 'ethers'
import { decodeMulticallResult, encodeMulticallData, getMulticallAddress, Multicall3Call } from './multicall.js'

import { processMetrics } from './metrics.js'

const { process_binding_count, process_binding_time, process_binding_error } = processMetrics

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

  private readonly enablePreprocess: boolean

  private preparedData: PreparedData | undefined
  readonly enablePartition: boolean

  constructor(loader: () => Promise<any>, shutdownHandler?: () => void) {
    this.loader = loader
    this.shutdownHandler = shutdownHandler

    this.enablePreprocess = process.env['ENABLE_PREPROCESS']
      ? process.env['ENABLE_PREPROCESS'].toLowerCase() == 'true'
      : false

    this.enablePartition = process.env['SENTIO_ENABLE_BINDING_DATA_PARTITION'] == 'true'
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
    const preparedData = this.enablePreprocess
      ? await this.preprocessBindings(request.bindings, {}, undefined, options)
      : { ethCallResults: {} }

    const promises = []
    for (const binding of request.bindings) {
      const promise = this.processBinding(binding, preparedData)
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    let promise
    try {
      promise = await Promise.all(promises)
      processMetrics.process_binding_count.add(request.bindings.length)
    } catch (e) {
      processMetrics.process_binding_error.add(request.bindings.length)
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
    preprocessStore: { [k: string]: any },
    dbContext?: StoreContext,
    options?: CallContext
  ): Promise<PreparedData> {
    // console.debug(`preprocessBindings start, bindings: ${bindings.length}`)
    const promises = []
    for (const binding of bindings) {
      promises.push(this.preprocessBinding(binding, preprocessStore, dbContext, options))
    }
    let preprocessResults: PreprocessResult[]
    try {
      preprocessResults = await Promise.all(promises)
    } catch (e) {
      throw e
    }
    const groupedRequests = new Map<string, EthCallParam[]>()
    const providers = new Map<string, Provider>()
    for (const result of preprocessResults) {
      for (const param of result.ethCallParams) {
        const { chainId, blockTag } = param.context!
        if (!providers.has(chainId)) {
          providers.set(chainId, getProvider(chainId as EthChainId))
        }
        const key = [chainId, blockTag].join('|')
        if (!groupedRequests.has(key)) {
          groupedRequests.set(key, [])
        }
        groupedRequests.get(key)!.push(param)
      }
    }

    const start = Date.now()
    const MULTICALL_THRESHOLD = 1
    const callPromises: Promise<[string, string]>[] = []
    const multicallPromises: Promise<[string, string][]>[] = []

    for (const params of groupedRequests.values()) {
      const { chainId, blockTag } = params[0].context!
      const multicallAddress = getMulticallAddress(chainId as EthChainId)
      if (params.length <= MULTICALL_THRESHOLD || !multicallAddress) {
        for (const param of params) {
          callPromises.push(
            providers
              .get(chainId)!
              .call({
                to: param.context!.address,
                data: param.calldata,
                blockTag
              })
              .then((result) => [makeEthCallKey(param), result])
          )
        }
        continue
      }

      // construct multicalls
      const CHUNK_SIZE = 128
      for (let i = 0; i < params.length; i += CHUNK_SIZE) {
        const chunk = params.slice(i, i + CHUNK_SIZE)
        const calls: Multicall3Call[] = chunk.map((param) => ({
          target: param.context!.address,
          callData: param.calldata
        }))
        const data = encodeMulticallData(calls)
        multicallPromises.push(
          providers
            .get(chainId)!
            .call({
              to: multicallAddress,
              data: data,
              blockTag
            })
            .then((raw) => {
              const result = decodeMulticallResult(raw).returnData
              if (result.length != chunk.length) {
                throw new Error(`multicall result length mismatch, params: ${chunk.length}, result: ${result.length}`)
              }
              const ret: [string, string][] = []
              for (let i = 0; i < chunk.length; i++) {
                ret.push([makeEthCallKey(chunk[i]), result[i]])
              }
              return ret
            })
        )
      }
    }

    let results: { [p: string]: string } = {}
    try {
      results = Object.fromEntries(await Promise.all(callPromises))
      for (const multicallResult of await Promise.all(multicallPromises)) {
        results = {
          ...results,
          ...Object.fromEntries(multicallResult)
        }
      }
    } catch (e) {
      console.error(`eth call error: ${e}`)
    }
    // console.debug(
    //   `${Object.keys(results).length} calls finished, actual calls: ${callPromises.length + multicallPromises.length}, elapsed: ${Date.now() - start}ms`
    // )
    return {
      ethCallResults: results
    }
  }

  async preprocessBinding(
    request: DataBinding,
    preprocessStore: { [k: string]: any },
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
    return await PluginManager.INSTANCE.preprocessBinding(request, preprocessStore, dbContext)
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

    const result = await PluginManager.INSTANCE.processBinding(
      request,
      preparedData,
      PluginManager.INSTANCE.dbContextLocalStorage.getStore()
    )
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
        if (this.preparedData) {
          this.preparedData = { ethCallResults: {} }
        }
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
    const preprocessStore: { [k: string]: any } = {}

    for await (const request of requests) {
      try {
        if (request.bindings) {
          const bindings = request.bindings.bindings
          const dbContext = contexts.new(request.processId, subject)
          const start = Date.now()
          this.preprocessBindings(bindings, preprocessStore, dbContext, undefined)
            .then((preparedData) => {
              // TODO maybe not proper to pass data in this way
              this.preparedData = {
                ethCallResults: {
                  ...this.preparedData?.ethCallResults,
                  ...preparedData.ethCallResults
                }
              }
              subject.next({
                processId: request.processId
              })
            })
            .catch((e) => {
              console.debug(e)
              dbContext.error(request.processId, e)
            })
            .finally(() => {
              const cost = Date.now() - start
              console.debug('preprocessBinding', request.processId, ' took', cost, 'ms')
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

  protected async handleRequests(
    requests: AsyncIterable<ProcessStreamRequest>,
    subject: Subject<DeepPartial<ProcessStreamResponse>>
  ) {
    const contexts = new Contexts()
    let lastBinding: DataBinding | undefined = undefined
    for await (const request of requests) {
      try {
        // console.debug('received request:', request)
        if (request.binding) {
          process_binding_count.add(1)

          // Adjust binding will make some request become invalid by setting UNKNOWN HandlerType
          // for older SDK version, so we just return empty result for them here
          if (request.binding.handlerType === HandlerType.UNKNOWN) {
            subject.next({
              processId: request.processId,
              result: ProcessResult.create()
            })
            continue
          }
          lastBinding = request.binding

          if (this.enablePartition) {
            const partitions = await PluginManager.INSTANCE.partition(request.binding)
            subject.next({
              processId: request.processId,
              partitions
            })
          } else {
            this.startProcess(request.processId, request.binding, contexts, subject)
          }
        }

        if (request.start) {
          if (!lastBinding) {
            throw new ServerError(Status.INVALID_ARGUMENT, 'start request received without binding')
          }
          this.startProcess(request.processId, lastBinding, contexts, subject)
        }

        if (request.dbResult) {
          const dbContext = contexts.get(request.processId)
          try {
            dbContext?.result(request.dbResult)
          } catch (e) {
            subject.error(new Error('db result error, process should stop'))
          }
        }
      } catch (e) {
        // should not happen
        console.error('unexpect error during handle loop', e)
      }
    }
  }

  private startProcess(
    processId: number,
    binding: DataBinding,
    contexts: Contexts,
    subject: Subject<DeepPartial<ProcessStreamResponse>>
  ) {
    const dbContext = contexts.new(processId, subject)
    const start = Date.now()
    PluginManager.INSTANCE.processBinding(binding, this.preparedData, dbContext)
      .then(async (result) => {
        // await all pending db requests
        await dbContext.awaitPendings()
        subject.next({
          result,
          processId: processId
        })
        recordRuntimeInfo(result, binding.handlerType)
      })
      .catch((e) => {
        console.debug(e)
        dbContext.error(processId, e)
        process_binding_error.add(1)
      })
      .finally(() => {
        const cost = Date.now() - start
        process_binding_time.add(cost)
        contexts.delete(processId)
      })
  }
}

export function recordRuntimeInfo(results: ProcessResult, handlerType: HandlerType) {
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
