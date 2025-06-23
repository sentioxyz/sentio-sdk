import {
  DeepPartial,
  Empty,
  ProcessConfigRequest,
  ProcessStreamRequest,
  ProcessStreamResponse,
  StartRequest
} from '@sentio/protos'
import { CallContext, ServerError, Status } from 'nice-grpc'
import { errorString } from './utils.js'
import { freezeGlobalConfig } from './global-config.js'
import { DebugInfo, RichServerError } from 'nice-grpc-error-details'
import { ProcessorServiceImpl } from './service.js'
import { BroadcastChannel, MessagePort, threadId } from 'worker_threads'
import { Piscina } from 'piscina'
import { configureEndpoints } from './endpoints.js'
import { setupLogger } from './logger.js'
import { Subject } from 'rxjs'

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

let service: ProcessorServiceImpl | undefined

const loader = async (options: any) => {
  if (options.target) {
    const m = await import(options.target)
    console.debug('Module loaded, path:', options.target, 'module:', m)
    return m
  }
}

const configureChannel = new BroadcastChannel('configure_channel')
configureChannel.onmessage = (request: ProcessConfigRequest) => {
  service?.getConfig(request, emptyCallContext)
}

const emptyCallContext = <CallContext>{}

async function start(request: StartRequest, options: any): Promise<Empty> {
  if (started) {
    return {}
  }
  freezeGlobalConfig()

  try {
    service = new ProcessorServiceImpl(() => loader(options), options)
  } catch (e) {
    throw new ServerError(Status.INVALID_ARGUMENT, 'Failed to load processor: ' + errorString(e))
  }

  await service.start(request, emptyCallContext)
  started = true
  return {}
}

export default async function ({
  processId,
  request: firstRequest,
  workerPort
}: {
  processId: number
  request: ProcessStreamRequest
  workerPort: MessagePort
}) {
  const { startRequest, configRequest, options } = Piscina.workerData
  if (!started) {
    const logLevel = process.env['LOG_LEVEL']?.toUpperCase()
    setupLogger(options['log-format'] === 'json', logLevel === 'debug' ? true : options.debug, threadId)

    configureEndpoints(options)

    if (startRequest) {
      await start(startRequest, options)
      console.debug('worker', threadId, ' started, template instance:', startRequest.templateInstances?.length)
    }

    if (configRequest) {
      await service?.getConfig(configRequest, emptyCallContext)
      console.debug('worker', threadId, ' configured')
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

  await new Promise<void>((resolve) => {
    const subject = new Subject<DeepPartial<ProcessStreamResponse>>()
    subject.subscribe((resp: ProcessStreamResponse) => {
      workerPort.postMessage(resp)
      // receive the response from the processor , close and resolve the promise
      if (resp.result) {
        resolve()
        workerPort.close()
      }
    })
    workerPort.on('message', (msg: ProcessStreamRequest) => {
      const request = msg as ProcessStreamRequest
      service?.handleRequest(request, firstRequest.binding, subject)
    })
    service?.handleRequest(firstRequest, firstRequest.binding, subject)
  })
}
