#!/usr/bin/env node

import path from 'path'
import fs from 'fs-extra'
import * as util from 'util'

import commandLineArgs from 'command-line-args'
import { createServer } from 'nice-grpc'
import { createLogger, transports, format } from 'winston'
import { compressionAlgorithms } from '@grpc/grpc-js'

import { ProcessorDefinition } from '@sentio/protos'
import { ProcessorServiceImpl } from './service.js'
import { State } from './state.js'
import { Endpoints } from './endpoints.js'

import { FullProcessorServiceImpl } from './full-service.js'
import { ChainConfig } from './chain-config.js'

State.reset()
// Endpoints.reset()

const optionDefinitions = [
  { name: 'target', type: String, defaultOption: true },
  { name: 'port', alias: 'p', type: String, defaultValue: '4000' },
  { name: 'concurrency', type: Number, defaultValue: 4 },
  // { name: 'use-chainserver', type: Boolean, defaultValue: false },
  {
    name: 'chains-config',
    alias: 'c',
    type: String,
    defaultValue: 'chains-config.json',
  },
  { name: 'chainquery-server', type: String, defaultValue: '' },
  { name: 'pricefeed-server', type: String, defaultValue: '' },
  { name: 'log-format', type: String, defaultValue: 'console' },
  { name: 'debug', type: Boolean, defaultValue: false },
]

const options = commandLineArgs(optionDefinitions, { partial: true })

if (options['log-format'] === 'json') {
  const utilFormatter = {
    transform: (info: any) => {
      const args = info[Symbol.for('splat')]
      if (args) {
        info.message = util.format(info.message, ...args)
      }
      return info
    },
  }
  const logger = createLogger({
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
      utilFormatter,
      format.errors({ stack: true }),
      format.json()
    ),
    transports: [new transports.Console()],
  })

  console.log = (...args) => logger.info.call(logger, ...args)
  console.info = (...args) => logger.info.call(logger, ...args)
  console.warn = (...args) => logger.warn.call(logger, ...args)
  console.error = (...args) => logger.error.call(logger, ...args)
  console.debug = (...args) => logger.debug.call(logger, ...args)
}
if (options.debug) {
  console.log('Starting with', options.target)
}

const fullPath = path.resolve(options['chains-config'])
const chainsConfig = fs.readJsonSync(fullPath)

// setProvider(chainsConfig, options.concurrency, options['use-chainserver'])
Endpoints.INSTANCE.concurrency = options.concurrency
Endpoints.INSTANCE.chainQueryAPI = options['chainquery-server']
Endpoints.INSTANCE.priceFeedAPI = options['pricefeed-server']

for (const [id, config] of Object.entries(chainsConfig)) {
  const chainConfig = config as ChainConfig
  if (chainConfig.ChainServer) {
    Endpoints.INSTANCE.chainServer.set(id, chainConfig.ChainServer)
  }
}

if (options.debug) {
  console.log('Starting Server', options)
}

const server = createServer({
  'grpc.max_send_message_length': 128 * 1024 * 1024,
  'grpc.max_receive_message_length': 128 * 1024 * 1024,
  'grpc.default_compression_algorithm': compressionAlgorithms.gzip,
})

// const m = await import(options.target)
// console.log(m)

const baseService = new ProcessorServiceImpl(async () => {
  const m = await import(options.target)
  console.log('module loaded')
  return m
}, server.shutdown)
const service = new FullProcessorServiceImpl(baseService)

server.add(ProcessorDefinition, service)

console.log('Listen on', options.port)
server.listen('0.0.0.0:' + options.port)

console.log('Processor Server Started')
