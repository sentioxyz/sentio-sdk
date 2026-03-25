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
import { fork, ChildProcess } from 'child_process'
import { fileURLToPath } from 'url'

import { ProcessorDefinition } from './gen/processor/protos/processor.js'
import { ProcessorServiceImpl } from './service.js'
import { configureEndpoints } from './endpoints.js'
import { FullProcessorServiceImpl, FullProcessorServiceV3Impl } from './full-service.js'
import { setupLogger } from './logger.js'

import { setupOTLP } from './otlp.js'
import { ActionServer } from './action-server.js'
import { ProcessorV3Definition } from '@sentio/protos'
import { ProcessorServiceImplV3 } from './service-v3.js'
import { dirname, join } from 'path'
import { program, ProcessorRuntimeOptions } from 'processor-runner-program.js'
import { locatePackageJson } from './utils.js'

program.parse()

const options: ProcessorRuntimeOptions = {
  ...program.opts(),
  target: program.args[program.args.length - 1]
}

const logLevel = process.env['LOG_LEVEL']?.toLowerCase()

// Track parent shutdown so worker restarts do not happen during intentional exits.
let isParentShuttingDown = false
let areChildrenShuttingDown = false
let shutdownChildren = () => {}

setupLogger(options.logFormat === 'json', logLevel === 'debug' ? true : options.debug!)
console.debug('Starting with', options.target)

await setupOTLP(options.otlpDebug)

Error.stackTraceLimit = 20

configureEndpoints(options)

console.debug('Starting Server', options)

// Check if this is a child process spawned for multi-server mode
const isChildProcess = process.env['IS_CHILD'] === 'true'

function exitProcess(exitCode: number): never {
  if (!isChildProcess) {
    isParentShuttingDown = true
    shutdownChildren()
  }
  process.exit(exitCode)
}

if (!isChildProcess) {
  const sdkPackageJson = locatePackageJson('@sentio/sdk')
  const runtimePackageJson = locatePackageJson('@sentio/runtime')
  console.log('Runtime version:', runtimePackageJson.version, 'SDK version:', sdkPackageJson.version)
}

let server: any
let baseService: ProcessorServiceImpl
let httpServer: http.Server | undefined

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

  // for V2
  baseService = new ProcessorServiceImpl(loader, options, server.shutdown)
  const service = new FullProcessorServiceImpl(baseService)

  server.add(ProcessorDefinition, service)

  // for V3
  server.add(
    ProcessorV3Definition,
    new FullProcessorServiceV3Impl(new ProcessorServiceImplV3(loader, options, server.shutdown))
  )

  server.listen('0.0.0.0:' + options.port)
  console.log('Processor Server Started at:', options.port)
}

// Only start metrics server on the main process (not child processes)
if (!isChildProcess) {
  const metricsPort = 4040

  httpServer = http
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
}

// Process event handlers
process
  .once('SIGINT', function () {
    if (isParentShuttingDown) {
      return
    }
    isParentShuttingDown = true
    shutdownChildren()
    shutdownServers(0)
  })
  .once('SIGTERM', function () {
    if (isParentShuttingDown) {
      return
    }
    isParentShuttingDown = true
    shutdownChildren()
    shutdownServers(0)
  })
  .on('uncaughtException', (err) => {
    console.error('Uncaught Exception, please checking if await is properly used', err)
    if (baseService) {
      baseService.unhandled = err
    }
    // shutdownServers(1)
  })
  .on('unhandledRejection', (reason, _p) => {
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

  if (httpServer) {
    httpServer.close(function () {
      console.log('Http server shut down')
      exitProcess(exitCode)
    })
  } else {
    exitProcess(exitCode)
  }
}

// Multi-worker mode: spawn child processes for additional servers
if (options.worker > 1 && !isChildProcess) {
  const childProcesses = new Map<number, ChildProcess>()
  const restartTimers = new Map<number, NodeJS.Timeout>()
  const basePort = parseInt(options.port)
  const restartDelayMs = 1000

  const spawnChild = (childPort: number): void => {
    const args = process.argv.slice(2)
    const childArgs: string[] = ['--port=' + String(childPort)]
    // Ignore port argument for child process
    // handle both '-p 4000' and '--port=4000' styles
    // ignore '--inspect=0.0.0.0:9229'
    for (let j = 0; j < args.length; j++) {
      const arg = args[j]
      if (arg === '-p' || arg === '--port') {
        j++ // skip next arg
        continue
      } else if (arg.startsWith('--port=') || arg.startsWith('--inspect=')) {
        continue
      }

      childArgs.push(arg)
    }

    const child = fork(fileURLToPath(import.meta.url), childArgs, {
      env: {
        ...process.env,
        IS_CHILD: 'true'
      },
      stdio: 'inherit'
    })

    child.on('error', (err) => {
      console.error(`Child process on port ${childPort} error:`, err)
    })

    child.on('exit', (code, signal) => {
      childProcesses.delete(childPort)
      console.log(`Child process on port ${childPort} exited with code ${code}, signal ${signal ?? 'none'}`)

      if (isParentShuttingDown) {
        return
      }

      if (restartTimers.has(childPort)) {
        return
      }

      console.log(`Scheduling restart for child process on port ${childPort} in ${restartDelayMs}ms`)
      const timer = setTimeout(() => {
        restartTimers.delete(childPort)
        if (isParentShuttingDown) {
          return
        }
        console.log(`Restarting child process on port ${childPort}`)
        spawnChild(childPort)
      }, restartDelayMs)
      restartTimers.set(childPort, timer)
    })

    childProcesses.set(childPort, child)
    console.log(`Spawned child server process for port ${childPort} (pid: ${child.pid})`)
  }

  // Spawn child processes for ports basePort+1 to basePort+(worker-1)
  for (let i = 1; i < options.worker; i++) {
    const childPort = basePort + i
    spawnChild(childPort)
  }

  // Handle parent process shutdown - kill all children
  shutdownChildren = () => {
    if (areChildrenShuttingDown) {
      return
    }
    areChildrenShuttingDown = true
    isParentShuttingDown = true
    for (const timer of restartTimers.values()) {
      clearTimeout(timer)
    }
    restartTimers.clear()
    for (const child of childProcesses.values()) {
      child.kill('SIGINT')
    }
  }
}
