#!/usr/bin/env node

import path from 'path'
import fs from 'fs-extra'

import { compressionAlgorithms } from '@grpc/grpc-js'
import commandLineArgs from 'command-line-args'
import { createServer } from 'nice-grpc'
import { errorDetailsServerMiddleware } from 'nice-grpc-error-details'
import { registry as niceGrpcRegistry, prometheusServerMiddleware } from 'nice-grpc-prometheus'
import { openTelemetryServerMiddleware } from 'nice-grpc-opentelemetry'
import { register as globalRegistry, Registry } from 'prom-client'
import http from 'http'
// @ts-ignore inspector promises is not included in @type/node
import { Session } from 'node:inspector/promises'

import { ProcessorDefinition } from './gen/processor/protos/processor.js'
import { ProcessorServiceImpl } from './service.js'
import { Endpoints } from './endpoints.js'
import { FullProcessorServiceImpl } from './full-service.js'
import { ChainConfig } from './chain-config.js'
import { setupLogger } from './logger.js'

import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter()
  })
  // instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()

const mergedRegistry = Registry.merge([globalRegistry, niceGrpcRegistry])

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

setupLogger(options['log-format'] === 'json', options.debug)
console.debug('Starting with', options.target)

Error.stackTraceLimit = 20

const fullPath = path.resolve(options['chains-config'])
const chainsConfig = fs.readJsonSync(fullPath)

Endpoints.INSTANCE.concurrency = options.concurrency
Endpoints.INSTANCE.batchCount = options['batch-count']
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
  .use(prometheusServerMiddleware())
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
        case '/metrics':
          const metrics = await mergedRegistry.metrics()
          res.write(metrics)
          break
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
