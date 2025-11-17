import {
  DataBinding,
  DeepPartial,
  Empty,
  HandlerType,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessorV3ServiceImplementation,
  ProcessResult,
  ProcessStreamRequest,
  ProcessStreamResponse,
  ProcessStreamResponseV3,
  StartRequest,
  UpdateTemplatesRequest
} from '@sentio/protos'
import { CallContext, ServerError, Status } from 'nice-grpc'
import { AsyncIterable } from 'ix'
import { PluginManager } from './plugin.js'
import { Subject } from 'rxjs'
import { from } from 'ix/asynciterable'
import { withAbort } from 'ix/asynciterable/operators'
import { errorString } from './utils.js'

import { processMetrics } from './metrics.js'
import { recordRuntimeInfo } from './service.js'
import { DataBindingContext } from './db-context.js'
import { freezeGlobalConfig } from './global-config.js'
import { ProcessorRuntimeOptions } from 'processor-runner-program.js'

const { process_binding_count, process_binding_time, process_binding_error } = processMetrics

export class ProcessorServiceImplV3 implements ProcessorV3ServiceImplementation {
  readonly enablePartition: boolean
  private readonly loader: () => Promise<any>
  private readonly shutdownHandler?: () => void
  private started = false

  constructor(loader: () => Promise<any>, options?: ProcessorRuntimeOptions, shutdownHandler?: () => void) {
    this.loader = loader
    this.shutdownHandler = shutdownHandler

    this.enablePartition = options?.enablePartition == true
  }

  async start(request: StartRequest, context: CallContext): Promise<Empty> {
    if (this.started) {
      return {}
    }

    freezeGlobalConfig()

    try {
      await this.loader()
    } catch (e) {
      throw new ServerError(Status.INVALID_ARGUMENT, 'Failed to load processor: ' + errorString(e))
    }

    await PluginManager.INSTANCE.start(request)

    this.started = true
    return {}
  }

  async getConfig(request: ProcessConfigRequest, context: CallContext): Promise<ProcessConfigResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const newConfig = ProcessConfigResponse.fromPartial({})
    await PluginManager.INSTANCE.configure(newConfig)
    return newConfig
  }

  async *processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: CallContext) {
    const subject = new Subject<DeepPartial<ProcessStreamResponseV3>>()
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
    subject: Subject<DeepPartial<ProcessStreamResponse>>
  ) {
    let lastBinding: DataBinding | undefined = undefined
    for await (const request of requests) {
      try {
        // console.log('received request:', request, 'lastBinding:', lastBinding)
        if (request.binding) {
          lastBinding = request.binding
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
    subject: Subject<DeepPartial<ProcessStreamResponseV3>>
  ) {
    if (request.binding) {
      process_binding_count.add(1)

      if (request.binding.handlerType === HandlerType.UNKNOWN) {
        subject.next({
          processId: request.processId,
          result: ProcessResult.create()
        })
        return
      }

      if (this.enablePartition) {
        try {
          console.debug('sending partition request', request.binding)
          const partitions = await PluginManager.INSTANCE.partition(request.binding)
          subject.next({
            processId: request.processId,
            partitions
          })
        } catch (e) {
          console.error('Partition error:', e)
          subject.error(new Error('Partition error: ' + errorString(e)))
          return
        }
      } else {
        this.startProcess(request.processId, request.binding, subject)
      }
    }

    if (request.start) {
      if (!lastBinding) {
        console.error('start request received without binding')
        subject.error(new Error('start request received without binding'))
        return
      }
      this.startProcess(request.processId, lastBinding, subject)
    }

    if (request.dbResult) {
      const context = this.contexts.get(request.processId)
      try {
        context?.result(request.dbResult)
      } catch (e) {
        subject.error(new Error('db result error, process should stop'))
      }
    }
  }

  private startProcess(
    processId: number,
    binding: DataBinding,
    subject: Subject<DeepPartial<ProcessStreamResponseV3>>
  ) {
    const context = this.contexts.new(processId, subject)
    const start = Date.now()
    console.debug('process binding', processId)
    PluginManager.INSTANCE.processBinding(binding, undefined, context)
      .then(async (result) => {
        console.debug(`process binding ${processId} done`)
        await context.awaitPendings()
        const { timeseriesResult, ...otherResults } = result
        console.debug('sending ts data length:', result.timeseriesResult.length)
        for (const ts of timeseriesResult) {
          subject.next({
            processId,
            tsRequest: {
              data: [ts]
            }
          })
        }

        /* if (result.states?.configUpdated) {
          console.debug('sending tpl updates:')
          subject.next({
            processId,
            tplRequest: {
              templates: TemplateInstanceState.INSTANCE.getValues()
            }
          })
        }*/

        console.debug('sending binding result', processId)
        subject.next({
          result: otherResults,
          processId: processId
        })
        recordRuntimeInfo(result, binding.handlerType)
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
        console.debug('process binding done', processId)
      })
  }

  async updateTemplates(request: UpdateTemplatesRequest, context: CallContext): Promise<DeepPartial<Empty>> {
    await PluginManager.INSTANCE.updateTemplates(request)
    return {}
  }
}

class Contexts {
  private contexts: Map<number, DataBindingContext> = new Map()

  get(processId: number) {
    return this.contexts.get(processId)
  }

  new(processId: number, subject: Subject<DeepPartial<ProcessStreamResponseV3>>) {
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
