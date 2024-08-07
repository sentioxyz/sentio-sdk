#!/usr/bin/env node

import path from 'path'
import fs from 'fs-extra'

import { compressionAlgorithms } from '@grpc/grpc-js'
import commandLineArgs from 'command-line-args'
import { createServer } from 'nice-grpc'
import { errorDetailsServerMiddleware } from 'nice-grpc-error-details'
// import { registry as niceGrpcRegistry } from 'nice-grpc-prometheus'
import { openTelemetryServerMiddleware } from 'nice-grpc-opentelemetry'
// import { register as globalRegistry, Registry } from 'prom-client'
import http from 'http'
// @ts-ignore inspector promises is not included in @type/node
import { Session } from 'node:inspector/promises'

import { ProcessorDefinition } from './gen/processor/protos/processor.js'
import { ProcessorServiceImpl } from './service.js'
import { Endpoints } from './endpoints.js'
import { FullProcessorServiceImpl } from './full-service.js'
import { ChainConfig } from './chain-config.js'
import { setupLogger } from './logger.js'

// import { NodeSDK } from '@opentelemetry/sdk-node'
import { envDetector } from '@opentelemetry/resources'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { PeriodicExportingMetricReader, MeterProvider } from '@opentelemetry/sdk-metrics'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { diag, DiagConsoleLogger, DiagLogLevel, metrics, trace } from '@opentelemetry/api'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'

// const mergedRegistry = Registry.merge([globalRegistry, niceGrpcRegistry])

const optionDefinitions = [
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
  { name: 'debug', type: Boolean, defaultValue: false }
]

const options = commandLineArgs(optionDefinitions, { partial: true })

const logLevel = process.env['LOG_LEVEL']?.toUpperCase()

setupLogger(options['log-format'] === 'json', logLevel === 'debug' ? true : options.debug)
console.debug('Starting with', options.target)

if (options.debug) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
}

const resource = await envDetector.detect()

const meterProvider = new MeterProvider({
  resource,
  readers: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter()
    }),
    new PrometheusExporter({
      // http://localhost:4041/metrics
      port: 4041
    })
  ]
})

const traceProvider = new NodeTracerProvider({
  resource: resource
})
const exporter = new OTLPTraceExporter() // new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter)
traceProvider.addSpanProcessor(processor)
traceProvider.register()

metrics.setGlobalMeterProvider(meterProvider)
trace.setGlobalTracerProvider(traceProvider)
;['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal as any, () => shutdownProvider())
})

export async function shutdownProvider() {
  const traceProvider = trace.getTracerProvider()
  if (traceProvider instanceof NodeTracerProvider) {
    traceProvider.shutdown().catch(console.error)
  }
  const meterProvider = metrics.getMeterProvider()
  if (meterProvider instanceof MeterProvider) {
    meterProvider.shutdown().catch(console.error)
  }
}

metrics.getMeter('processor').createGauge('up').record(1)

Error.stackTraceLimit = 20

const fullPath = path.resolve(options['chains-config'])
const chainsConfig = fs.readJsonSync(fullPath)

const concurrencyOverride = process.env['OVERRIDE_CONCURRENCY']
  ? parseInt(process.env['OVERRIDE_CONCURRENCY'])
  : undefined
const batchCountOverride = process.env['OVERRIDE_BATCH_COUNT']
  ? parseInt(process.env['OVERRIDE_BATCH_COUNT'])
  : undefined

Endpoints.INSTANCE.concurrency = concurrencyOverride ?? options.concurrency
Endpoints.INSTANCE.batchCount = batchCountOverride ?? options['batch-count']
Endpoints.INSTANCE.chainQueryAPI = options['chainquery-server']
Endpoints.INSTANCE.priceFeedAPI = options['pricefeed-server']

for (const [id, config] of Object.entries(chainsConfig)) {
  const chainConfig = config as ChainConfig
  if (chainConfig.ChainServer) {
    Endpoints.INSTANCE.chainServer.set(id, chainConfig.ChainServer)
  } else {
    const http = chainConfig.Https?.[0]
    if (http) {
      Endpoints.INSTANCE.chainServer.set(id, http)
    } else {
      console.error('not valid config for chain', id)
    }
  }
}

console.debug('Starting Server', options)

const server = createServer({
  'grpc.max_send_message_length': 384 * 1024 * 1024,
  'grpc.max_receive_message_length': 384 * 1024 * 1024,
  'grpc.default_compression_algorithm': compressionAlgorithms.gzip
})
  // .use(prometheusServerMiddleware())
  .use(openTelemetryServerMiddleware())
  .use(errorDetailsServerMiddleware)
const baseService = new ProcessorServiceImpl(async () => {
  const m = await import(options.target)
  console.debug('Module loaded', m)
  return m
}, server.shutdown)
const service = new FullProcessorServiceImpl(baseService)

server.add(ProcessorDefinition, service)

server.listen('0.0.0.0:' + options.port)

console.log('Processor Server Started at:', options.port)

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
    baseService.unhandled = err
    // shutdownServers(1)
  })
  .on('unhandledRejection', (reason, p) => {
    // @ts-ignore ignore invalid ens error
    if (reason?.message.startsWith('invalid ENS name (disallowed character: "*"')) {
      return
    }
    console.error('Unhandled Rejection, please checking if await is properly', reason)
    baseService.unhandled = reason as Error
    // shutdownServers(1)
  })

function shutdownServers(exitCode: number) {
  server.forceShutdown()
  console.log('RPC server shut down')

  httpServer.close(function () {
    console.log('Http server shut down')
    process.exit(exitCode)
  })
}
