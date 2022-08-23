#!/usr/bin/env node

import commandLineArgs from 'command-line-args'
import { createServer } from 'nice-grpc'
import { ProcessorDefinition } from './gen/processor/protos/processor'
import { ProcessorServiceImpl } from './service'
import { setProvider } from './provider'

import path from 'path'
import fs from 'fs-extra'
import { ProcessorState } from './processor-state'

// import 'log-timestamp'

global.sentio_sdk = require('.')
global.PROCESSOR_STATE = new ProcessorState()

function tryRequire(name: string): { module: any; name: string; path: string } | undefined {
  const req = eval('require')

  try {
    let path: string
    try {
      path = req.resolve(name, { paths: [process.cwd()] })
    } catch {
      path = req.resolve(name)
    }

    const module = { module: req(path), name, path }
    console.log('Load successfully: ', name)
    return module
  } catch (err) {
    if (err instanceof Error && err.message.startsWith(`Cannot find module '${name}'`)) {
      // this error is expected
      console.log("Couldn't load (expected): ", name)
      return undefined
    } else {
      throw err
    }
  }
}

const optionDefinitions = [
  { name: 'target', type: String, defaultOption: true },
  { name: 'port', alias: 'p', type: String, defaultValue: '4000' },
  { name: 'concurrency', type: Number, defaultValue: 4 },
  {
    name: 'chains-config',
    alias: 'c',
    type: String,
    defaultValue: 'chains-config.json',
  },
]

const options = commandLineArgs(optionDefinitions)

console.log('loading', options.target)

const fullPath = path.resolve(options['chains-config'])
const chainsConfig = fs.readJsonSync(fullPath)

setProvider(chainsConfig, options.concurrency)

tryRequire(options.target)

console.log('Start Server', options)

console.log(global.PROCESSOR_STATE.processors.length, ' processors loaded')
console.log(global.PROCESSOR_STATE.solanaProcessors.length, ' solana processors loaded')

const processor = createServer()

const service = new ProcessorServiceImpl(processor.shutdown)
processor.add(ProcessorDefinition, service)

processor.listen('0.0.0.0:' + options.port)
