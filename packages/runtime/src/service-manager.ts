import { CallContext, ServerError, Status } from 'nice-grpc'
import { Piscina } from 'piscina'
import {
  DataBinding,
  DBRequest,
  DBResponse,
  DeepPartial,
  Empty,
  HandlerType,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessResult,
  ProcessStreamRequest,
  ProcessStreamResponse,
  StartRequest
} from '@sentio/protos'

import { IStoreContext } from './db-context.js'
import { Subject } from 'rxjs'

import { processMetrics } from './metrics.js'
import { MessageChannel } from 'node:worker_threads'
import { ProcessorServiceImpl } from './service.js'
import { TemplateInstanceState } from './state.js'
import { PluginManager } from './plugin.js'

const { process_binding_count, process_binding_time, process_binding_error } = processMetrics

;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export class ServiceManager extends ProcessorServiceImpl {
  private pool: Piscina<any, any>
  private workerData: any = {}

  constructor(
    readonly options: any,
    loader: () => Promise<any>,
    shutdownHandler?: () => void
  ) {
    super(loader, shutdownHandler)
    this.workerData.options = options
  }

  async getConfig(request: ProcessConfigRequest, context: CallContext): Promise<ProcessConfigResponse> {
    const newConfig = await super.getConfig(request, context)

    // check if templateInstances changed
    if (newConfig.templateInstances?.length != this.workerData?.configRequest?.templateInstances?.length) {
      this.workerData.startRequest = StartRequest.fromPartial({
        templateInstances: newConfig.templateInstances
      })
    }

    this.workerData.configRequest = request

    // if pool is initialized, this will trigger restart of all workers
    await this.initPool()
    return newConfig
  }

  async start(request: StartRequest, context: CallContext): Promise<Empty> {
    await super.start(request, context)
    this.workerData.startRequest = request
    return {}
  }

  async stop(request: Empty, context: CallContext): Promise<Empty> {
    await this.pool?.destroy()
    return await super.stop(request, context)
  }

  private readonly contexts = new Contexts()

  protected async handleRequests(
    requests: AsyncIterable<ProcessStreamRequest>,
    subject: Subject<DeepPartial<ProcessStreamResponse>>
  ) {
    for await (const request of requests) {
      let lastBinding: DataBinding | undefined = undefined

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

          if (this.enablePartition) {
            const partitions = await PluginManager.INSTANCE.partition(request.binding)
            subject.next({
              processId: request.processId,
              partitions
            })
            lastBinding = request.binding
          } else {
            this.doProcess(request.processId, request.binding, subject)
          }
        }
        if (request.start) {
          if (!lastBinding) {
            throw new ServerError(Status.INVALID_ARGUMENT, 'start request received without binding')
          }
          this.doProcess(request.processId, lastBinding, subject)
        }
        if (request.dbResult) {
          const dbContext = this.contexts.get(request.processId)
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

  private doProcess(processId: number, binding: DataBinding, subject: Subject<DeepPartial<ProcessStreamResponse>>) {
    const dbContext = this.contexts.new(processId, subject)

    const start = Date.now()
    this.process(binding, dbContext)
      .then(async (result) => {
        subject.next({
          result,
          processId: processId
        })
      })
      .catch((e) => {
        dbContext.error(processId, e)
        process_binding_error.add(1)
      })
      .finally(() => {
        const cost = Date.now() - start
        process_binding_time.add(cost)
        this.contexts.delete(processId)
      })
  }

  async process(request: DataBinding, dbContext?: ChannelStoreContext): Promise<ProcessResult> {
    if (!this.pool) {
      await this.initPool()
    }

    return this.pool.run(
      { request, workerPort: dbContext?.workerPort },
      { transferList: dbContext?.workerPort ? [dbContext?.workerPort] : [] }
    )
  }

  private async initPool() {
    if (this.pool) {
      await this.pool.close()
    }
    console.info('Initializing worker pool with worker count:', this.options.worker)
    this.pool = new Piscina({
      maxThreads: this.options.worker,
      minThreads: this.options.worker,
      filename: new URL('./service-worker.js', import.meta.url).href.replaceAll('runtime/src', 'runtime/lib'),
      argv: process.argv,
      workerData: this.workerData
    })
    this.pool.on('message', (msg) => {
      if (msg.event == 'add_template_instance') {
        // sync the template state from worker to the main thread
        TemplateInstanceState.INSTANCE.addValue(msg.value)
      }
    })
  }
}

export type WorkerMessage = DBRequest & { processId: number }

class Contexts {
  private contexts: Map<number, ChannelStoreContext> = new Map()

  get(processId: number) {
    return this.contexts.get(processId)
  }

  new(processId: number, subject: Subject<DeepPartial<ProcessStreamResponse>>) {
    const context = new ChannelStoreContext(subject, processId)
    this.contexts.set(processId, context)
    return context
  }

  delete(processId: number) {
    const context = this.get(processId)
    context?.close()
    this.contexts.delete(processId)
  }
}

export class ChannelStoreContext implements IStoreContext {
  channel = new MessageChannel()

  constructor(
    readonly subject: Subject<DeepPartial<ProcessStreamResponse>>,
    readonly processId: number
  ) {
    this.mainPort.on('message', (req: ProcessStreamRequest) => {
      subject.next({
        ...req,
        processId: processId
      })
    })
  }

  sendRequest(request: DeepPartial<Omit<DBRequest, 'opId'>>, timeoutSecs?: number): Promise<DBResponse> {
    throw new Error('should not be used on main thread')
  }

  get workerPort() {
    return this.channel.port2
  }

  get mainPort() {
    return this.channel.port1
  }

  result(dbResult: DBResponse) {
    this.mainPort.postMessage(dbResult)
  }

  close(): void {
    this.mainPort.close()
  }

  error(processId: number, e: any): void {
    console.error('process error', processId, e)
    const errorResult = ProcessResult.create({
      states: {
        error: e?.toString()
      }
    })
    this.subject.next({
      result: errorResult,
      processId
    })
  }
}
