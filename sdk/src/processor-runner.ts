#!/usr/bin/env node

import commandLineArgs from 'command-line-args'
import { createServer } from 'nice-grpc'
import { ProcessorDefinition } from './gen'
import { ProcessorServiceImpl } from './service'
import { setProvider } from './provider'

import path from 'path'
import fs from 'fs-extra'
import { ProcessorState } from './processor-state'
import { load } from './loader'
import { CompressionAlgorithms } from '@grpc/grpc-js/build/src/compression-algorithms'

global.PROCESSOR_STATE = new ProcessorState()

const optionDefinitions = [
  { name: 'target', type: String, defaultOption: true },
  { name: 'port', alias: 'p', type: String, defaultValue: '4000' },
  { name: 'concurrency', type: Number, defaultValue: 4 },
  { name: 'use-chainserver', type: Boolean, defaultValue: false },
  {
    name: 'chains-config',
    alias: 'c',
    type: String,
    defaultValue: 'chains-config.json',
  },
]

const options = commandLineArgs(optionDefinitions, { partial: true })

console.log('loading', options.target)

const fullPath = path.resolve(options['chains-config'])
const chainsConfig = fs.readJsonSync(fullPath)

setProvider(chainsConfig, options.concurrency, options['use-chainserver'])

console.log('Start Server', options)

const server = createServer({
  'grpc.max_send_message_length': 64 * 1024 * 1024,
  'grpc.max_receive_message_length': 64 * 1024 * 1024,
  'grpc.default_compression_algorithm': CompressionAlgorithms.gzip,
})

const service = new ProcessorServiceImpl(() => load(options.target), server.shutdown)
server.add(ProcessorDefinition, service)

server.listen('0.0.0.0:' + options.port)
