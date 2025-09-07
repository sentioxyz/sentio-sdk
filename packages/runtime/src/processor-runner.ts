#!/usr/bin/env node

import { Command } from 'commander'
import { compressionAlgorithms } from '@grpc/grpc-js'
import { createServer } from 'nice-grpc'
import { errorDetailsServerMiddleware } from 'nice-grpc-error-details'
import { openTelemetryServerMiddleware } from 'nice-grpc-opentelemetry'
import http from 'http'
// @ts-ignore inspector promises is not included in @type/node
import { Session } from 'node:inspector/promises'
import fs from 'fs-extra'
import path from 'path'

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

// Get worker number from environment
let workerNum = 1
try {
  workerNum = parseInt(process.env['PROCESSOR_WORKER']?.trim() ?? '1')
} catch (e) {
  console.error('Failed to parse worker number', e)
}

// Create Commander.js program
const program = new Command()

program
  .name('processor-runner')
  .description('Sentio Processor Runtime - A high-performance blockchain data processor')
  .version('2.0.0-development')
  .argument('<target>', 'Path to the processor module to load')
  .option('-p, --port <port>', 'Port to listen on', '4000')
  .option('-c, --concurrency <number>', 'Number of concurrent workers', '4')
  .option('--batch-count <number>', 'Batch count for processing', '1')
  .option('--chains-config <path>', 'Path to chains configuration file', 'chains-config.json')
  .option('--chainquery-server <url>', 'Chain query server URL', '')
  .option('--pricefeed-server <url>', 'Price feed server URL', '')
  .option('--log-format <format>', 'Log format (console|json)', 'console')
  .option('--debug', 'Enable debug mode', false)
  .option('--otlp-debug', 'Enable OTLP debug mode', false)
  .option('--start-action-server', 'Start action server instead of processor server', false)
  .option('--worker <number>', 'Number of worker threads', workerNum.toString())
  .option('--process-timeout <seconds>', 'Process timeout in seconds', '60')
  .option('--worker-timeout <seconds>', 'Worker timeout in seconds', process.env['WORKER_TIMEOUT_SECONDS'] || '60')
  .option(
    '--enable-partition',
    'Enable binding data partition',
    process.env['SENTIO_ENABLE_BINDING_DATA_PARTITION'] === 'true'
  )
  .action(async (target: string, options: any) => {
    try {
      await startServer(target, options)
    } catch (error) {
      console.error('Failed to start server:', error)
      process.exit(1)
    }
  })

// Parse arguments
program.parse()

async function startServer(target: string, options: any): Promise<void> {
  // Setup logging
  const logLevel = process.env['LOG_LEVEL']?.toLowerCase()
  setupLogger(options.logFormat === 'json', logLevel === 'debug' ? true : options.debug)

  console.debug('Starting with target:', target)
  console.debug('Options:', options)

  // Setup OTLP
  await setupOTLP(options.otlpDebug)

  // Set error stack trace limit
  Error.stackTraceLimit = 20

  // Configure endpoints
  configureEndpoints(options)

  console.debug('Starting Server with options:', options)

  // Create loader function
  const loader = async () => {
    const m = await import(target)
    console.debug('Module loaded:', m)
    return m
  }

  if (options.startActionServer) {
    // Start action server
    const server = new ActionServer(loader)
    server.listen(parseInt(options.port))
    console.log('Action Server Started at:', options.port)
  } else {
    // Start processor server
    const server = createServer({
      'grpc.max_send_message_length': 768 * 1024 * 1024,
      'grpc.max_receive_message_length': 768 * 1024 * 1024,
      'grpc.default_compression_algorithm': compressionAlgorithms.gzip
    })
      .use(openTelemetryServerMiddleware())
      .use(errorDetailsServerMiddleware)

    // Create base service
    let baseService: ProcessorServiceImpl | ServiceManager
    const workerCount = parseInt(options.worker)

    if (workerCount > 1) {
      baseService = new ServiceManager(loader, options, server.shutdown)
    } else {
      baseService = new ProcessorServiceImpl(loader, options, server.shutdown)
    }

    // Create full services
    const service = new FullProcessorServiceImpl(baseService)
    const serviceV3 = new FullProcessorServiceV3Impl(new ProcessorServiceImplV3(loader, options, server.shutdown))

    // Add services to server
    server.add(ProcessorDefinition, service)
    server.add(ProcessorV3Definition, serviceV3)

    // Start server
    server.listen('0.0.0.0:' + options.port)
    console.log('Processor Server Started at:', options.port)

    // Start metrics server
    const metricsPort = 4040

    const httpServer = http
      .createServer(async function (req, res) {
        if (req.url) {
          const reqUrl = new URL(req.url, `http://${req.headers.host}`)
          const queries = reqUrl.searchParams

          switch (reqUrl.pathname) {
            case '/heap': {
              try {
                const file = '/tmp/' + Date.now() + '.heapsnapshot'
                await dumpHeap(file)
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

    // Setup process handlers
    process
      .on('SIGINT', function () {
        shutdownServers(server, httpServer, 0)
      })
      .on('uncaughtException', (err) => {
        console.error('Uncaught Exception, please checking if await is properly used', err)
        if (baseService) {
          baseService.unhandled = err
        }
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
      })

    // Setup OOM monitoring if enabled
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
          const file = path.join(dir, `${Date.now()}.heapsnapshot`)
          dumping = true
          await dumpHeap(file)
          process.exit(11)
        }
      }, 1000 * 60)
    }
  }
}

async function dumpHeap(file: string): Promise<void> {
  console.log('Heap dumping to', file)
  const session = new Session()
  fs.mkdirSync(path.dirname(file), { recursive: true })
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

function shutdownServers(server: any, httpServer: any, exitCode: number): void {
  server?.forceShutdown()
  console.log('RPC server shut down')

  httpServer.close(function () {
    console.log('Http server shut down')
    process.exit(exitCode)
  })
}
