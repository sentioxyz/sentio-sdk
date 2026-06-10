import { ConnectError, Code, type HandlerContext, type ServiceImpl } from '@connectrpc/connect'
import { from } from 'ix/Ix.asynciterable'
import { withAbort } from 'ix/Ix.asynciterable.operators'

import {
  type DataBinding,
  type Empty,
  EmptySchema,
  type EthCallParam,
  HandlerType,
  type PreparedData,
  PreparedDataSchema,
  type PreprocessResult,
  type PreprocessStreamRequest,
  ProcessBindingResponseSchema,
  type ProcessBindingsRequest,
  type ProcessConfigRequest,
  type ProcessConfigResponse,
  ProcessConfigResponseSchema,
  Processor,
  type ProcessResult,
  ProcessResultSchema,
  RuntimeInfoSchema,
  type ProcessStreamRequest,
  ProcessStreamResponseSchema,
  PreprocessStreamResponseSchema,
  type StartRequest
} from '@sentio/protos'
import { create, type MessageInitShape } from '@bufbuild/protobuf'

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
import { ProcessorRuntimeOptions } from './processor-runner-program.js'

const { process_binding_count, process_binding_time, process_binding_error } = processMetrics

;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

// Init-shapes carried over the rxjs Subject before being yielded by connect.
// connect accepts MessageInitShape for streaming outputs, so the oneof discriminated
// union must be filled in (e.g. { value: { case: 'result', value: ... } }).
export type ProcessStreamResponseInit = MessageInitShape<typeof ProcessStreamResponseSchema>
export type PreprocessStreamResponseInit = MessageInitShape<typeof PreprocessStreamResponseSchema>

export class ProcessorServiceImpl implements ServiceImpl<typeof Processor> {
  private started = false
  // When there is unhandled error, stop process and return unavailable error
  unhandled: Error
  // private processorConfig: ProcessConfigResponse

  private readonly loader: () => Promise<any>

  private readonly shutdownHandler?: () => void

  private readonly enablePreprocess: boolean

  private preparedData: PreparedData | undefined
  readonly enablePartition: boolean

  constructor(loader: () => Promise<any>, options?: ProcessorRuntimeOptions, shutdownHandler?: () => void) {
    this.loader = loader
    this.shutdownHandler = shutdownHandler

    this.enablePreprocess = process.env['ENABLE_PREPROCESS']
      ? process.env['ENABLE_PREPROCESS'].toLowerCase() == 'true'
      : false

    this.enablePartition = options?.enablePartition == true
  }

  async getConfig(request: ProcessConfigRequest, context: HandlerContext): Promise<ProcessConfigResponse> {
    if (!this.started) {
      throw new ConnectError('Service Not started.', Code.Unavailable)
    }
    // if (!this.processorConfig) {
    //   throw new ConnectError('Process config empty.', Code.Internal)
    // }

    // Don't use .create to keep compatiblity
    const newConfig = create(ProcessConfigResponseSchema, {})
    await PluginManager.INSTANCE.configure(newConfig)
    return newConfig
  }

  //
  // async configure() {
  //   this.processorConfig = ProcessConfigResponse.fromPartial({})
  //   await PluginManager.INSTANCE.configure(this.processorConfig)
  // }

  async start(request: StartRequest, context: HandlerContext): Promise<MessageInitShape<typeof EmptySchema>> {
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
      throw new ConnectError('Failed to load processor: ' + errorString(e), Code.InvalidArgument)
    }

    await PluginManager.INSTANCE.start(request)

    // try {
    //   await this.configure()
    // } catch (e) {
    //   throw new ConnectError('Failed to start processor : ' + errorString(e), Code.Internal)
    // }
    this.started = true
    return {}
  }

  async stop(request: Empty, context: HandlerContext): Promise<MessageInitShape<typeof EmptySchema>> {
    console.log('Server Shutting down in 5 seconds')
    if (this.shutdownHandler) {
      setTimeout(this.shutdownHandler, 5000)
    }
    return {}
  }

  async processBindings(
    request: ProcessBindingsRequest,
    context?: HandlerContext
  ): Promise<MessageInitShape<typeof ProcessBindingResponseSchema>> {
    const preparedData = this.enablePreprocess
      ? await this.preprocessBindings(request.bindings, {}, undefined, context)
      : create(PreparedDataSchema, { ethCallResults: {} })

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
    options?: HandlerContext
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
    return create(PreparedDataSchema, {
      ethCallResults: results
    })
  }

  async preprocessBinding(
    request: DataBinding,
    preprocessStore: { [k: string]: any },
    dbContext?: StoreContext,
    options?: HandlerContext
  ): Promise<PreprocessResult> {
    if (!this.started) {
      throw new ConnectError('Service Not started.', Code.Unavailable)
    }
    if (this.unhandled) {
      throw new ConnectError(
        'Unhandled exception/rejection in previous request: ' + errorString(this.unhandled),
        Code.Unavailable
      )
    }
    return await PluginManager.INSTANCE.preprocessBinding(request, preprocessStore, dbContext)
  }

  async processBinding(
    request: DataBinding,
    preparedData: PreparedData | undefined,
    options?: HandlerContext
  ): Promise<ProcessResult> {
    if (!this.started) {
      throw new ConnectError('Service Not started.', Code.Unavailable)
    }
    if (this.unhandled) {
      throw new ConnectError(
        'Unhandled exception/rejection in previous request: ' + errorString(this.unhandled),
        Code.Unavailable
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

  async *processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: HandlerContext) {
    if (!this.started) {
      throw new ConnectError('Service Not started.', Code.Unavailable)
    }

    const subject = new Subject<ProcessStreamResponseInit>()
    this.handleRequests(requests, subject)
      .then(() => {
        if (this.preparedData) {
          this.preparedData = create(PreparedDataSchema, { ethCallResults: {} })
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
    subject: Subject<PreprocessStreamResponseInit>
  ) {
    const contexts = new Contexts()
    const preprocessStore: { [k: string]: any } = {}

    for await (const request of requests) {
      try {
        if (request.value.case === 'bindings') {
          const bindings = request.value.value.bindings
          // NOTE: StoreContext/Contexts are typed for the V2 ProcessStreamResponse stream, but the
          // preprocess flow reuses them only to drive DB request/response plumbing. The preprocess
          // stream message (flat `dbRequest`) differs from the V2 oneof shape, so we hand the
          // preprocess subject in via a cast. db-context.ts owns the actual emit shape; integrator
          // should confirm StoreContext.doSend stays compatible with both stream message types.
          const dbContext = contexts.new(request.processId, subject as unknown as Subject<ProcessStreamResponseInit>)
          const start = Date.now()
          this.preprocessBindings(bindings, preprocessStore, dbContext, undefined)
            .then((preparedData) => {
              // TODO maybe not proper to pass data in this way
              this.preparedData = create(PreparedDataSchema, {
                ethCallResults: {
                  ...this.preparedData?.ethCallResults,
                  ...preparedData.ethCallResults
                }
              })
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
        if (request.value.case === 'dbResult') {
          const dbContext = contexts.get(request.processId)
          dbContext?.result(request.value.value)
        }
      } catch (e) {
        // should not happen
        console.error('unexpect error during handle loop', e)
      }
    }
  }

  async *preprocessBindingsStream(requests: AsyncIterable<PreprocessStreamRequest>, context: HandlerContext) {
    if (!this.started) {
      throw new ConnectError('Service Not started.', Code.Unavailable)
    }

    const subject = new Subject<PreprocessStreamResponseInit>()
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

  private dbContexts = new Contexts()

  protected async handleRequests(
    requests: AsyncIterable<ProcessStreamRequest>,
    subject: Subject<ProcessStreamResponseInit>
  ) {
    let lastBinding: DataBinding | undefined = undefined
    for await (const request of requests) {
      try {
        // console.log('received request:', request, 'lastBinding:', lastBinding)
        if (request.value.case === 'binding') {
          lastBinding = request.value.value
        }
        this.handleRequest(request, lastBinding, subject)
      } catch (e) {
        // should not happen
        console.error('unexpect error during handle loop', e)
      }
    }
  }

  async handleRequest(
    request: ProcessStreamRequest,
    lastBinding: DataBinding | undefined,
    subject: Subject<ProcessStreamResponseInit>
  ) {
    if (request.value.case === 'binding') {
      const binding = request.value.value
      process_binding_count.add(1)

      // Adjust binding will make some request become invalid by setting UNKNOWN HandlerType
      // for older SDK version, so we just return empty result for them here
      if (binding.handlerType === HandlerType.UNKNOWN) {
        subject.next({
          processId: request.processId,
          value: { case: 'result', value: create(ProcessResultSchema) }
        })
        return
      }

      if (this.enablePartition) {
        try {
          const partitions = await PluginManager.INSTANCE.partition(binding)
          subject.next({
            processId: request.processId,
            value: { case: 'partitions', value: partitions }
          })
        } catch (e) {
          console.error('Partition error:', e)
          subject.error(new Error('Partition error: ' + errorString(e)))
          return
        }
      } else {
        this.startProcess(request.processId, binding, subject)
      }
    }

    if (request.value.case === 'start') {
      if (!lastBinding) {
        console.error('start request received without binding')
        subject.error(new Error('start request received without binding'))
        return
      }
      this.startProcess(request.processId, lastBinding, subject)
    }

    if (request.value.case === 'dbResult') {
      const dbContext = this.dbContexts.get(request.processId)
      try {
        dbContext?.result(request.value.value)
      } catch (e) {
        subject.error(new Error('db result error, process should stop'))
      }
    }
  }

  private startProcess(processId: number, binding: DataBinding, subject: Subject<ProcessStreamResponseInit>) {
    const dbContext = this.dbContexts.new(processId, subject)
    const start = Date.now()
    PluginManager.INSTANCE.processBinding(binding, this.preparedData, dbContext)
      .then(async (result) => {
        // await all pending db requests
        await dbContext.awaitPendings()
        subject.next({
          value: { case: 'result', value: result },
          processId: processId
        })
        recordRuntimeInfo(result, binding.handlerType)
      })
      .catch((e) => {
        console.error(e, e.stack)
        dbContext.error(processId, e)
        process_binding_error.add(1)
      })
      .finally(() => {
        const cost = Date.now() - start
        process_binding_time.add(cost)
        this.dbContexts.delete(processId)
      })
  }
}

export function recordRuntimeInfo(results: ProcessResult, handlerType: HandlerType) {
  for (const list of [results.gauges, results.counters, results.events, results.exports]) {
    list.forEach((e) => {
      e.runtimeInfo = create(RuntimeInfoSchema, {
        from: handlerType
      })
    })
  }
}

class Contexts {
  private contexts: Map<number, StoreContext> = new Map()

  get(processId: number) {
    return this.contexts.get(processId)
  }

  new(processId: number, subject: Subject<ProcessStreamResponseInit>) {
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
