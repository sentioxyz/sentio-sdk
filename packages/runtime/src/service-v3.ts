import {
  type DataBinding,
  EmptySchema,
  HandlerType,
  type ProcessConfigRequest,
  ProcessConfigResponseSchema,
  ProcessorV3,
  ProcessResultSchema,
  ProcessStreamResponse_PartitionsSchema,
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

// SENTIO_PARTITION_EAGER_START=false restores waiting for the driver's start
// command after the partition response.
const PARTITION_EAGER_START = process.env['SENTIO_PARTITION_EAGER_START'] !== 'false'

export class ProcessorServiceImplV3 implements ServiceImpl<typeof ProcessorV3> {
  readonly enablePartition: boolean
  // Per stream: the process whose binding ran on its own right after the
  // partition response. A start command for it is ignored: an older driver still
  // sends one, possibly after the binding finished, but always before the next
  // binding on that stream, which replaces the entry. Process ids are unique per
  // binding, so nothing is kept per process.
  private readonly eagerStarted = new WeakMap<Subject<ProcessStreamResponseV3Init>, number>()
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
      this.eagerStarted.delete(subject)
      process_binding_count.add(1)

      if (binding.handlerType === HandlerType.UNKNOWN) {
        if (this.enablePartition) {
          // Keep the partition handshake: the driver reads the first message as
          // the partition response. With eager start the result follows at once
          // and a late start command is a no-op; without it the driver's start
          // command is answered in the start branch below.
          if (PARTITION_EAGER_START) {
            this.eagerStarted.set(subject, request.processId)
          }
          subject.next({
            processId: request.processId,
            value: {
              case: 'partitions',
              value: create(ProcessStreamResponse_PartitionsSchema, { started: PARTITION_EAGER_START })
            }
          })
          if (!PARTITION_EAGER_START) {
            return
          }
        }
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
          // Eager start: run the binding right after answering the partition
          // request instead of waiting for the driver's start command. The driver
          // gates the binding's first db read on the previous task of the same
          // partition anyway, so nothing observable moves earlier; the start
          // round trip just leaves the critical path. `started` tells a driver
          // that understands it to skip the start command; an older driver still
          // sends one, which is ignored below.
          partitions.started = PARTITION_EAGER_START
          if (PARTITION_EAGER_START) {
            this.eagerStarted.set(subject, request.processId)
          }
          subject.next({
            processId: request.processId,
            value: { case: 'partitions', value: partitions }
          })
          if (PARTITION_EAGER_START) {
            this.startProcess(request.processId, binding, subject)
          }
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
      if (this.eagerStarted.get(subject) === request.processId) {
        // The binding already ran after its partition response. A driver that does
        // not read `started` still sends the command, possibly after the binding
        // finished, so it must not start anything again.
        return
      }
      if (!lastBinding) {
        console.error('start request received without binding')
        subject.error(new Error('start request received without binding'))
        return
      }
      if (lastBinding.handlerType === HandlerType.UNKNOWN) {
        // The shortcut above answered the partition request; the start command
        // gets the empty result it would have sent without partitioning.
        subject.next({
          processId: request.processId,
          value: { case: 'result', value: create(ProcessResultSchema) }
        })
        return
      }
      this.startProcess(request.processId, lastBinding, subject)
    }

    if (request.value.case === 'dbResult') {
      const dbResult = request.value.value
      const context = this.contexts.get(request.processId)
      if (!context) {
        if (dbResult.value.case === 'error') {
          // A write the process did not wait for failed after the process had
          // finished. The driver has failed the binding; this is for the log.
          console.error('db error for finished process', request.processId, 'op:', dbResult.opId, dbResult.value.value)
        }
        return
      }
      try {
        context.result(dbResult)
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

        // Close the context to further messages in the same synchronous step that
        // emits the result: after this point the stream may be recycled to another
        // process, and waiting for the .finally() below would leave a microtask
        // window in which a detached continuation could still append to it.
        context.finish()
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
        context.finish() // same reasoning as the success path — error() emits a result too
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
