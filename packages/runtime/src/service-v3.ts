import {
  ConfigureHandlersRequest,
  ConfigureHandlersResponse,
  DataBinding,
  DeepPartial,
  Empty,
  HandlerType,
  InitResponse,
  ProcessConfigResponse,
  ProcessorV3ServiceImplementation,
  ProcessResult,
  ProcessStreamRequest,
  ProcessStreamResponseV2,
  StartRequest
} from '@sentio/protos'
import { CallContext } from 'nice-grpc'
import { AsyncIterable } from 'ix'
import { PluginManager } from './plugin.js'
import { Subject } from 'rxjs'
import { from } from 'ix/asynciterable'
import { withAbort } from 'ix/asynciterable/operators'
import { errorString } from './utils.js'

import { processMetrics } from './metrics.js'
import { recordRuntimeInfo } from './service.js'
import { DataBindingContext } from './db-context.js'
import { TemplateInstanceState } from './state.js'

const { process_binding_count, process_binding_time, process_binding_error } = processMetrics

export class ProcessorServiceImplV3 implements ProcessorV3ServiceImplementation {
  readonly enablePartition: boolean
  private readonly loader: () => Promise<any>
  private readonly shutdownHandler?: () => void

  constructor(loader: () => Promise<any>, options?: any, shutdownHandler?: () => void) {
    this.loader = loader
    this.shutdownHandler = shutdownHandler

    this.enablePartition = options?.['enable-partition'] == true
  }

  async init(request: Empty, context: CallContext): Promise<DeepPartial<InitResponse>> {
    await this.loader()
    const resp = InitResponse.fromPartial({
      chainIds: []
    })
    await PluginManager.INSTANCE.init(resp)
    resp.chainIds = Array.from(new Set(resp.chainIds))
    return resp
  }

  async *processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: CallContext) {
    const subject = new Subject<DeepPartial<ProcessStreamResponseV2>>()
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
    yield* from(subject).pipe(withAbort(context.signal))
  }
  private contexts = new Contexts()

  async handleRequest(
    request: ProcessStreamRequest,
    lastBinding: DataBinding | undefined,
    subject: Subject<DeepPartial<ProcessStreamResponseV2>>
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
    subject: Subject<DeepPartial<ProcessStreamResponseV2>>
  ) {
    const context = this.contexts.new(processId, subject)
    const start = Date.now()
    PluginManager.INSTANCE.processBinding(binding, undefined, context)
      .then(async (result) => {
        // await all pending db requests
        await context.awaitPendings()

        for (const ts of result.timeseriesResult) {
          subject.next({
            processId,
            tsRequest: {
              data: [ts]
            }
          })
        }

        if (result.states?.configUpdated) {
          subject.next({
            processId,
            tplRequest: {
              templates: TemplateInstanceState.INSTANCE.getValues()
            }
          })
        }

        subject.next({
          result: {
            states: result.states,
            exports: result.exports
          },
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
      })
  }

  async configureHandlers(
    request: ConfigureHandlersRequest,
    context: CallContext
  ): Promise<DeepPartial<ConfigureHandlersResponse>> {
    await PluginManager.INSTANCE.start(
      StartRequest.fromPartial({
        templateInstances: request.templateInstances
      })
    )

    const newConfig = ProcessConfigResponse.fromPartial({})
    await PluginManager.INSTANCE.configure(newConfig, request.chainId)
    return {
      accountConfigs: newConfig.accountConfigs,
      contractConfigs: newConfig.contractConfigs
    }
  }
}

class Contexts {
  private contexts: Map<number, DataBindingContext> = new Map()

  get(processId: number) {
    return this.contexts.get(processId)
  }

  new(processId: number, subject: Subject<DeepPartial<ProcessStreamResponseV2>>) {
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
