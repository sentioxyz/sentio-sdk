#!/usr/bin/env node

import fs from 'fs-extra'
// import { compressionAlgorithms } from '@grpc/grpc-js'
import { createServer } from 'nice-grpc'
import { errorDetailsServerMiddleware } from 'nice-grpc-error-details'
// import { registry as niceGrpcRegistry } from 'nice-grpc-prometheus'
// import { openTelemetryServerMiddleware } from 'nice-grpc-opentelemetry'
import http from 'http'
// @ts-ignore inspector promises is not included in @type/node
import { Session } from 'node:inspector/promises'

import { ProcessorDefinition } from './gen/processor/protos/processor.js'
import { ProcessorServiceImpl } from './service.js'
import { configureEndpoints } from './endpoints.js'
import { FullProcessorServiceImpl, FullProcessorServiceV3Impl } from './full-service.js'
import { setupLogger } from './logger.js'

import { setupOTLP } from './otlp.js'
import { ActionServer } from './action-server.js'
import { ServiceManager } from './service-manager.js'
import { ProcessorV3Definition } from '@sentio/protos'
import { ProcessorServiceImplV3 } from './service-v3.js'
import { dirname, join } from 'path'
import { program, ProcessorRuntimeOptions } from 'processor-runner-program.js'

program.parse()

const options: ProcessorRuntimeOptions = {
  ...program.opts(),
  target: program.args[program.args.length - 1]
}

const logLevel = process.env['LOG_LEVEL']?.toLowerCase()

setupLogger(options.logFormat === 'json', logLevel === 'debug' ? true : options.debug!)
console.debug('Starting with', options.target)

await setupOTLP(options.otlpDebug)

Error.stackTraceLimit = 20

configureEndpoints(options)

console.debug('Starting Server', options)

let server: any
let baseService: ProcessorServiceImpl | ServiceManager
const loader = async () => {
  const m = await import(options.target)
  console.debug('Module loaded', m)
  return m
}
if (options.startActionServer) {
  server = new ActionServer(loader)
  server.listen(options.port)
} else {
  server = createServer({
    'grpc.max_send_message_length': 768 * 1024 * 1024,
    'grpc.max_receive_message_length': 768 * 1024 * 1024
    // 'grpc.default_compression_algorithm': compressionAlgorithms.gzip
  })
    // .use(prometheusServerMiddleware())
    // .use(openTelemetryServerMiddleware())
    .use(errorDetailsServerMiddleware)

  if (options.worker > 1) {
    baseService = new ServiceManager(loader, options, server.shutdown)
  } else {
    baseService = new ProcessorServiceImpl(loader, options, server.shutdown)
  }

  const service = new FullProcessorServiceImpl(baseService)

  server.add(ProcessorDefinition, service)
  server.add(
    ProcessorV3Definition,
    new FullProcessorServiceV3Impl(new ProcessorServiceImplV3(loader, options, server.shutdown))
  )

  server.listen('0.0.0.0:' + options.port)
  console.log('Processor Server Started at:', options.port)
}
const metricsPort = 4040

const httpServer = http
  .createServer(async function (req, res) {
    if (req.url) {
      const reqUrl = new URL(req.url, `http://${req.headers.host}`)
      const queries = reqUrl.searchParams
      switch (reqUrl.pathname) {
        // case '/metrics':
        //   const metrics = await mergedRegistry.metrics()
        //   res.write(metrics)
        //   break
        case '/heap': {
          try {
            const file = '/tmp/' + Date.now() + '.heapsnapshot'
            await dumpHeap(file)
            // send the file
            const readStream = fs.createReadStream(file)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            readStream.pipe(res)
            res.end()
          } catch {
            res.writeHead(500)
            res.end()
          }
          break
        }
        case '/profile': {
          try {
            const profileTime = parseInt(queries.get('t') || '1000', 10) || 1000
            const session = new Session()
            session.connect()

            await session.post('Profiler.enable')
            await session.post('Profiler.start')

            await new Promise((resolve) => setTimeout(resolve, profileTime))
            const { profile } = await session.post('Profiler.stop')

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.write(JSON.stringify(profile))
            session.disconnect()
          } catch {
            res.writeHead(500)
          }
          break
        }
        default:
          res.writeHead(404)
      }
    } else {
      res.writeHead(404)
    }
    res.end()
  })
  .listen(metricsPort)

console.log('Metric Server Started at:', metricsPort)

process
  .on('SIGINT', function () {
    shutdownServers(0)
  })
  .on('uncaughtException', (err) => {
    console.error('Uncaught Exception, please checking if await is properly used', err)
    if (baseService) {
      baseService.unhandled = err
    }
    // shutdownServers(1)
  })
  .on('unhandledRejection', (reason, p) => {
    // @ts-ignore ignore invalid ens error
    if (reason?.message.startsWith('invalid ENS name (disallowed character: "*"')) {
      return
    }
    console.error('Unhandled Rejection, please checking if await is properly', reason)
    if (baseService) {
      baseService.unhandled = reason as Error
    }
    // shutdownServers(1)
  })

if (process.env['OOM_DUMP_MEMORY_SIZE_GB']) {
  let dumping = false
  const memorySize = parseFloat(process.env['OOM_DUMP_MEMORY_SIZE_GB']!)
  console.log('heap dumping is enabled, limit set to ', memorySize, 'gb')
  const dir = process.env['OOM_DUMP_DIR'] || '/tmp'
  setInterval(async () => {
    const mem = process.memoryUsage()
    console.log('Current Memory Usage', mem)
    // if memory usage is greater this size, dump heap and exit
    if (mem.heapTotal > memorySize * 1024 * 1024 * 1024 && !dumping) {
      const file = join(dir, `${Date.now()}.heapsnapshot`)
      dumping = true
      await dumpHeap(file)
      // force exit and keep pod running
      process.exit(11)
    }
  }, 1000 * 60)
}
// }

async function dumpHeap(file: string): Promise<void> {
  console.log('Heap dumping to', file)
  const session = new Session()
  fs.mkdirSync(dirname(file), { recursive: true })
  const fd = fs.openSync(file, 'w')
  try {
    session.connect()
    session.on('HeapProfiler.addHeapSnapshotChunk', (m: any) => {
      fs.writeSync(fd, m.params.chunk)
    })

    await session.post('HeapProfiler.takeHeapSnapshot')
    console.log('Heap dumped to', file)
  } finally {
    session.disconnect()
    fs.closeSync(fd)
  }
}

function shutdownServers(exitCode: number): void {
  server.forceShutdown()
  console.log('RPC server shut down')

  httpServer.close(function () {
    console.log('Http server shut down')
    process.exit(exitCode)
  })
}
