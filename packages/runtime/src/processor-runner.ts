#!/usr/bin/env node

import fs from 'fs-extra'

import { compressionAlgorithms } from '@grpc/grpc-js'
import commandLineArgs from 'command-line-args'
import { createServer } from 'nice-grpc'
import { errorDetailsServerMiddleware } from 'nice-grpc-error-details'
// import { registry as niceGrpcRegistry } from 'nice-grpc-prometheus'
import { openTelemetryServerMiddleware } from 'nice-grpc-opentelemetry'
import http from 'http'
// @ts-ignore inspector promises is not included in @type/node
import { Session } from 'node:inspector/promises'

import { ProcessorDefinition } from './gen/processor/protos/processor.js'
import { ProcessorServiceImpl } from './service.js'
import { configureEndpoints } from './endpoints.js'
import { FullProcessorServiceImpl } from './full-service.js'
import { setupLogger } from './logger.js'

import { setupOTLP } from './otlp.js'
import { ActionServer } from './action-server.js'
import { ServiceManager } from './service-manager.js'
import path from 'path'

// const mergedRegistry = Registry.merge([globalRegistry, niceGrpcRegistry])

let workerNum = 1
try {
  workerNum = parseInt(process.env['PROCESSOR_WORKER']?.trim() ?? '1')
} catch (e) {
  console.error('Failed to parse worker number', e)
}
export const optionDefinitions = [
  { name: 'target', type: String, defaultOption: true },
  { name: 'port', alias: 'p', type: String, defaultValue: '4000' },
  { name: 'concurrency', type: Number, defaultValue: 4 },
  { name: 'batch-count', type: Number, defaultValue: 1 },
  // { name: 'use-chainserver', type: Boolean, defaultValue: false },
  {
    name: 'chains-config',
    alias: 'c',
    type: String,
    defaultValue: 'chains-config.json'
  },
  { name: 'chainquery-server', type: String, defaultValue: '' },
  { name: 'pricefeed-server', type: String, defaultValue: '' },
  { name: 'log-format', type: String, defaultValue: 'console' },
  { name: 'debug', type: Boolean, defaultValue: false },
  { name: 'otlp-debug', type: Boolean, defaultValue: false },
  { name: 'start-action-server', type: Boolean, defaultValue: false },
  { name: 'worker', type: Number, defaultValue: workerNum },
  { name: 'process-timeout', type: Number, defaultValue: 60 },
  { name: 'worker-timeout', type: Number, defaultValue: parseInt(process.env['WORKER_TIMEOUT_SECONDS'] || '60') },
  {
    name: 'enable-partition',
    type: Boolean,
    defaultValue: process.env['SENTIO_ENABLE_BINDING_DATA_PARTITION'] === 'true'
  }
]

const options = commandLineArgs(optionDefinitions, { partial: true })

const logLevel = process.env['LOG_LEVEL']?.toLowerCase()

setupLogger(options['log-format'] === 'json', logLevel === 'debug' ? true : options.debug)
console.debug('Starting with', options.target)

await setupOTLP(options['otlp-debug'])

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
if (options['start-action-server']) {
  server = new ActionServer(loader)
  server.listen(options.port)
} else {
  server = createServer({
    'grpc.max_send_message_length': 768 * 1024 * 1024,
    'grpc.max_receive_message_length': 768 * 1024 * 1024,
    'grpc.default_compression_algorithm': compressionAlgorithms.gzip
  })
    // .use(prometheusServerMiddleware())
    .use(openTelemetryServerMiddleware())
    .use(errorDetailsServerMiddleware)

  if (options.worker > 1) {
    baseService = new ServiceManager(loader, options, server.shutdown)
  } else {
    baseService = new ProcessorServiceImpl(loader, options, server.shutdown)
  }

  const service = new FullProcessorServiceImpl(baseService)

  server.add(ProcessorDefinition, service)

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
  const memorySize = parseFloat(process.env['OOM_DUMP_MEMORY_SIZE_GB'])
  console.log('heap dumping is enabled, limit set to ', memorySize, 'gb')
  const dir = process.env['OOM_DUMP_DIR'] || '/tmp'
  setInterval(async () => {
    const mem = process.memoryUsage()
    console.log('Current Memory Usage', mem)
    // if memory usage is greater this size, dump heap and exit
    if (mem.heapTotal > memorySize * 1024 * 1024 * 1024 && !dumping) {
      const file = path.join(dir, `${Date.now()}.heapsnapshot`)
      dumping = true
      await dumpHeap(file)
      // force exit and keep pod running
      process.exit(11)
    }
  }, 1000 * 60)
}

async function dumpHeap(file: string) {
  console.log('Heap dumping to', file)
  const session = new Session()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const fd = fs.openSync(file, 'w')
  try {
    session.connect()
    session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
      fs.writeSync(fd, m.params.chunk)
    })

    await session.post('HeapProfiler.takeHeapSnapshot')
    console.log('Heap dumped to', file)
  } finally {
    session.disconnect()
    fs.closeSync(fd)
  }
}

function shutdownServers(exitCode: number) {
  server?.forceShutdown()
  console.log('RPC server shut down')

  httpServer.close(function () {
    console.log('Http server shut down')
    process.exit(exitCode)
  })
}
