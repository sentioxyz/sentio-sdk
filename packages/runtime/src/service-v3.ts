import {
  type DataBinding,
  EmptySchema,
  HandlerType,
  type ProcessConfigRequest,
  ProcessConfigResponseSchema,
  ProcessorV3,
  ProcessResultSchema,
  type ProcessStreamRequest,
  ProcessStreamResponseV3Schema,
  type StartRequest,
  type UpdateTemplatesRequest
} from '@sentio/protos'
import { clone, create, type MessageInitShape } from '@bufbuild/protobuf'
import { ConnectError, Code, type HandlerContext, type ServiceImpl } from '@connectrpc/connect'
import { PluginManager } from './plugin.js'
import { Subject } from 'rxjs'
import { from } from 'ix/asynciterable'
import { withAbort } from 'ix/asynciterable/operators'
import { errorString, recordRuntimeInfo } from './utils.js'

import { processMetrics } from './metrics.js'
import { DataBindingContext } from './db-context.js'
import { freezeGlobalConfig } from './global-config.js'
import { ProcessorRuntimeOptions } from './processor-runner-program.js'

type ProcessStreamResponseV3Init = MessageInitShape<typeof ProcessStreamResponseV3Schema>

const { process_binding_count, process_binding_time, process_binding_error } = processMetrics

const TIME_SERIES_RESULT_BATCH_SIZE = 1000

export class ProcessorServiceImplV3 implements ServiceImpl<typeof ProcessorV3> {
  readonly enablePartition: boolean
  private readonly loader: () => Promise<any>
  private readonly shutdownHandler?: () => void
  private started = false

  constructor(loader: () => Promise<any>, options?: ProcessorRuntimeOptions, shutdownHandler?: () => void) {
    this.loader = loader
    this.shutdownHandler = shutdownHandler

    this.enablePartition = options?.enablePartition == true
  }

  async start(request: StartRequest, context: HandlerContext) {
    if (this.started) {
      return create(EmptySchema)
    }

    freezeGlobalConfig()

    try {
      await this.loader()
    } catch (e) {
      throw new ConnectError('Failed to load processor: ' + errorString(e), Code.InvalidArgument)
    }

    await PluginManager.INSTANCE.start(request)

    this.started = true
    return create(EmptySchema)
  }

  async getConfig(request: ProcessConfigRequest, context: HandlerContext) {
    if (!this.started) {
      throw new ConnectError('Service Not started.', Code.Unavailable)
    }

    const newConfig = create(ProcessConfigResponseSchema, {})
    await PluginManager.INSTANCE.configure(newConfig)
    return newConfig
  }

  async *processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: HandlerContext) {
    const subject = new Subject<ProcessStreamResponseV3Init>()
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

  protected async handleRequests(
    requests: AsyncIterable<ProcessStreamRequest>,
    subject: Subject<ProcessStreamResponseV3Init>
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

  private contexts = new Contexts()

  async handleRequest(
    request: ProcessStreamRequest,
    lastBinding: DataBinding | undefined,
    subject: Subject<ProcessStreamResponseV3Init>
  ) {
    const binding = request.value.case === 'binding' ? request.value.value : undefined
    if (binding) {
      process_binding_count.add(1)

      if (binding.handlerType === HandlerType.UNKNOWN) {
        subject.next({
          processId: request.processId,
          value: { case: 'result', value: create(ProcessResultSchema) }
        })
        return
      }

      if (this.enablePartition) {
        try {
          console.debug('sending partition request', binding)
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
      const context = this.contexts.get(request.processId)
      try {
        context?.result(request.value.value)
      } catch (e) {
        subject.error(new Error('db result error, process should stop'))
      }
    }
  }

  private startProcess(processId: number, binding: DataBinding, subject: Subject<ProcessStreamResponseV3Init>) {
    const context = this.contexts.new(processId, subject)
    const start = Date.now()
    PluginManager.INSTANCE.processBinding(binding, undefined, context)
      .then(async (result) => {
        await context.awaitPendings()
        recordRuntimeInfo(result, binding.handlerType)

        const timeseriesResult = result.timeseriesResult
        for (let i = 0; i < timeseriesResult.length; i += TIME_SERIES_RESULT_BATCH_SIZE) {
          const batch = timeseriesResult.slice(i, i + TIME_SERIES_RESULT_BATCH_SIZE)
          subject.next({
            processId,
            value: { case: 'tsRequest', value: { data: batch } }
          })
        }

        // Send everything except the (already-batched) timeseries result back.
        const otherResults = clone(ProcessResultSchema, result)
        otherResults.timeseriesResult = []

        subject.next({
          processId,
          value: {
            case: 'result',
            value: otherResults
          }
        })
      })
      .catch((e) => {
        console.error(e, e.stack)
        context.error(processId, e)
        process_binding_error.add(1)
      })
      .finally(() => {
        const cost = Date.now() - start
        process_binding_time.add(cost)
        this.contexts.delete(processId)
      })
  }

  async updateTemplates(request: UpdateTemplatesRequest, context: HandlerContext) {
    await PluginManager.INSTANCE.updateTemplates(request)
    return create(EmptySchema)
  }
}

class Contexts {
  private contexts: Map<number, DataBindingContext> = new Map()

  get(processId: number) {
    return this.contexts.get(processId)
  }

  new(processId: number, subject: Subject<ProcessStreamResponseV3Init>) {
    const context = new DataBindingContext(processId, subject)
    this.contexts.set(processId, context)
    return context
  }

  delete(processId: number) {
    const context = this.get(processId)
    context?.close()
    this.contexts.delete(processId)
  }
}
