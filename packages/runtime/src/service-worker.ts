import {
  DataBinding,
  DBResponse,
  DeepPartial,
  Empty,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessStreamResponse,
  StartRequest
} from '@sentio/protos'
import { CallContext, ServerError, Status } from 'nice-grpc'
import { PluginManager } from './plugin.js'
import { errorString } from './utils.js'
import { freezeGlobalConfig } from './global-config.js'
import { DebugInfo, RichServerError } from 'nice-grpc-error-details'
import { recordRuntimeInfo } from './service.js'
import { BroadcastChannel, MessagePort, threadId } from 'worker_threads'
import { Piscina } from 'piscina'
import { configureEndpoints } from './endpoints.js'
import { setupLogger } from './logger.js'
import { AbstractStoreContext } from './db-context.js'

let started = false

let unhandled: Error | undefined

process
  .on('uncaughtException', (err) => {
    console.error('Uncaught Exception, please checking if await is properly used', err)
    unhandled = err
  })
  .on('unhandledRejection', (reason, p) => {
    // @ts-ignore ignore invalid ens error
    if (reason?.message.startsWith('invalid ENS name (disallowed character: "*"')) {
      return
    }
    console.error('Unhandled Rejection, please checking if await is properly', reason)
    unhandled = reason as Error
    // shutdownServers(1)
  })
  .on('exit', () => {
    console.info('Worker thread exiting, threadId:', threadId)
  })

async function getConfig(request: ProcessConfigRequest, context?: CallContext): Promise<ProcessConfigResponse> {
  if (!started) {
    throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
  }

  const newConfig = ProcessConfigResponse.fromPartial({})
  await PluginManager.INSTANCE.configure(newConfig)
  return newConfig
}

const loader = async (options: any) => {
  if (options.target) {
    const m = await import(options.target)
    console.debug('Module loaded, path:', options.target, 'module:', m)
    return m
  }
}

const configureChannel = new BroadcastChannel('configure_channel')
configureChannel.onmessage = (request: ProcessConfigRequest) => {
  getConfig(request)
}

async function start(request: StartRequest, options: any): Promise<Empty> {
  if (started) {
    return {}
  }
  freezeGlobalConfig()

  try {
    await loader(options)
  } catch (e) {
    throw new ServerError(Status.INVALID_ARGUMENT, 'Failed to load processor: ' + errorString(e))
  }

  await PluginManager.INSTANCE.start(request)
  started = true
  return {}
}

export default async function ({
  request,
  processId,
  workerPort
}: {
  request: DataBinding
  processId: number
  workerPort?: MessagePort
}) {
  const { startRequest, configRequest, options } = Piscina.workerData
  if (!started) {
    const logLevel = process.env['LOG_LEVEL']?.toUpperCase()
    setupLogger(options['log-format'] === 'json', logLevel === 'debug' ? true : options.debug, threadId)

    configureEndpoints(options)

    if (startRequest) {
      await start(startRequest, options)
      console.debug('worker started, template instance:', startRequest.templateInstances?.length, 'threadId:', threadId)
    }

    if (configRequest) {
      await getConfig(configRequest)
      console.debug('worker configured')
    }
  }

  if (unhandled) {
    const err = unhandled
    unhandled = undefined
    console.error('Unhandled exception/rejection in previous request:', err)
    throw new RichServerError(
      Status.UNAVAILABLE,
      'Unhandled exception/rejection in previous request: ' + errorString(err),
      [
        DebugInfo.fromPartial({
          detail: err.message,
          stackEntries: err.stack?.split('\n')
        })
      ]
    )
  }

  console.debug('Worker Processing request ', processId)
  const now = Date.now()
  const result = await PluginManager.INSTANCE.processBinding(
    request,
    undefined,
    workerPort ? new WorkerStoreContext(workerPort, processId) : undefined
  )
  console.debug('Worker processed request', processId, 'took', Date.now() - now)
  recordRuntimeInfo(result, request.handlerType)
  return result
}

class WorkerStoreContext extends AbstractStoreContext {
  constructor(
    readonly port: MessagePort,
    processId: number
  ) {
    super(processId)
    this.port.on('message', (resp: DBResponse) => {
      this.result(resp)
    })
    this.port.on('close', () => {
      this.close()
    })
  }

  doSend(req: DeepPartial<ProcessStreamResponse>): void {
    this.port.postMessage(req)
  }
}
