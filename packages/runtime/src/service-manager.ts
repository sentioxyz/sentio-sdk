import { CallContext } from 'nice-grpc'
import { Piscina } from 'piscina'
import {
  DeepPartial,
  Empty,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessResult,
  ProcessStreamRequest,
  ProcessStreamResponse,
  ProcessStreamResponse_Partitions,
  StartRequest
} from '@sentio/protos'
import { Subject } from 'rxjs'

import { MessageChannel } from 'node:worker_threads'
import { ProcessorServiceImpl } from './service.js'
import { TemplateInstanceState } from './state.js'
import { ProcessorRuntimeOptions } from 'processor-runner-program.js'
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export class ServiceManager extends ProcessorServiceImpl {
  private pool: Piscina<any, any>
  private workerData: any = {}

  constructor(
    loader: () => Promise<any>,
    readonly options: ProcessorRuntimeOptions,
    shutdownHandler?: () => void
  ) {
    super(loader, options, shutdownHandler)
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
    if (!this.pool) {
      await this.initPool()
    }
    for await (const request of requests) {
      this.handleSingleRequest(request, subject)
    }
  }

  async handleSingleRequest(request: ProcessStreamRequest, subject: Subject<DeepPartial<ProcessStreamResponse>>) {
    const processId = request.processId
    if (request.binding) {
      const context = this.contexts.new(processId)
      context.mainPort.on('message', (resp: ProcessStreamResponse) => {
        subject.next(resp)
        if (resp.result) {
          // last response
          this.contexts.delete(processId)
        }
      })
      try {
        await this.pool.run(
          { request, workerPort: context.workerPort, processId },
          { transferList: [context.workerPort] }
        )
      } catch (err) {
        console.error('Error processing request:', err)
        subject.error(err)
      }
    } else {
      const context = this.contexts.get(processId)
      if (!context) {
        console.error('No context found for processId:', processId)
        throw new Error(`No context found for processId: ${processId}`)
      }
      context.sendRequest(request)
    }
  }

  async process(processId: number, context: ChannelContext): Promise<ProcessResult | ProcessStreamResponse_Partitions> {
    if (!this.pool) {
      await this.initPool()
    }

    return this.pool.run(
      { workerPort: context?.workerPort, processId },
      { transferList: context?.workerPort ? [context?.workerPort] : [] }
    )
  }

  private async initPool() {
    if (this.pool) {
      await this.pool.close()
    }

    if (this.enablePartition) {
      const concurrent = parseInt(process.env['PROCESS_CONCURRENCY'] || '0')
      if (this.options.worker! < concurrent) {
        console.warn(
          `When partition is enabled, the worker count must >= 'PROCESS_CONCURRENCY', will set worker count to ${concurrent})`
        )
        this.options.worker = concurrent
      }
    }

    console.info('Initializing worker pool with worker count:', this.options.worker)
    this.pool = new Piscina({
      maxThreads: this.options.worker,
      minThreads: this.options.worker,
      filename: new URL('./service-worker.js', import.meta.url).href.replaceAll('runtime/src', 'runtime/lib'),
      argv: process.argv,
      workerData: this.workerData
    })
    // @ts-ignore - Piscina message handling for template instance sync
    this.pool.on('message', (msg: any) => {
      if (msg.event == 'add_template_instance') {
        // sync the template state from worker to the main thread
        TemplateInstanceState.INSTANCE.addValue(msg.value)
      }
    })
  }
}

class Contexts {
  private contexts: Map<number, ChannelContext> = new Map()

  get(processId: number) {
    return this.contexts.get(processId)
  }

  new(processId: number) {
    let context = this.get(processId)
    if (context) {
      return context
    }
    context = new ChannelContext(processId)
    this.contexts.set(processId, context)
    return context
  }

  delete(processId: number) {
    const context = this.get(processId)
    context?.close()
    this.contexts.delete(processId)
  }

  has(processId: number) {
    return this.contexts.has(processId)
  }
}

export class ChannelContext {
  channel = new MessageChannel()

  constructor(readonly processId: number) {}

  sendRequest(request: ProcessStreamRequest) {
    this.mainPort.postMessage(request)
  }

  get workerPort() {
    return this.channel.port2
  }

  get mainPort() {
    return this.channel.port1
  }

  close(): void {
    this.mainPort.close()
  }
}
