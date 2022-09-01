#!/usr/bin/env node

import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import fs from 'fs'
import https from 'https'
import http from 'http'
import path from 'path'

import yaml from 'js-yaml'
import { EVM, FinalizeHost, FinalizeProjectName, SentioProjectConfig } from './config'
import { WriteKey } from './key'
import { uploadFile } from './upload'
import chalk from 'chalk'
import { buildProcessor } from './build'

const mainDefinitions = [{ name: 'command', defaultOption: true }]
const mainOptions = commandLineArgs(mainDefinitions, {
  stopAtFirstUnknown: true,
})
const argv = mainOptions._unknown || []

// Process configs
let processorConfig: SentioProjectConfig = { host: '', project: '', source: '', build: true, targets: [] }
// Fist step, read from project yaml file
try {
  console.log(chalk.blue('Loading Process config'))
  // TODO correctly located sentio.yaml
  const pwd = process.cwd()
  const packageJson = path.join(pwd, 'package.json')
  if (!fs.existsSync(packageJson)) {
    console.error('package.json not found, please run this command in the root of your project')
    process.exit(1)
  }

  const yamlPath = path.join(pwd, 'sentio.yaml')
  if (!fs.existsSync(yamlPath)) {
    console.error('sentio.yaml not found, please create one according to: TODO docs')
    process.exit(1)
  }

  processorConfig = yaml.load(fs.readFileSync('sentio.yaml', 'utf8')) as SentioProjectConfig
  if (!processorConfig.project === undefined) {
    console.error('Config yaml must have contain a valid project identifier')
    process.exit(1)
  }
  if (processorConfig.build === undefined) {
    processorConfig.build = true
  }
  if (!processorConfig.host) {
    processorConfig.host = 'prod'
  }

  if (!processorConfig.source) {
    processorConfig.source = 'src/processor.ts'
  }
  if (!processorConfig.targets) {
    console.warn('targets is not defined, use EVM as the default target')
    processorConfig.targets = []
  }
  if (processorConfig.targets.length === 0) {
    // By default evm
    processorConfig.targets.push({ chain: EVM })
  }
} catch (e) {
  console.error(e)
  process.exit(1)
}

if (mainOptions.command === 'upload') {
  const optionDefinitions = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Display this usage guide.',
    },
    {
      name: 'api-key',
      type: String,
      description: '(Optional) Manually provide API key rather than use saved credential',
    },
    {
      name: 'host',
      description: '(Optional) Override Sentio Host name',
      type: String,
    },
    {
      name: 'owner',
      description: '(Optional) Override Project owner',
      type: String,
    },
    {
      name: 'nobuild',
      description: '(Optional) Skip build & pack file before uploading, default false',
      type: Boolean,
    },
  ]
  const options = commandLineArgs(optionDefinitions, { argv })
  if (options.help) {
    const usage = commandLineUsage([
      {
        header: 'Sentio upload',
        content: 'Upload your project files to Sentio.',
      },
      {
        header: 'Options',
        optionList: optionDefinitions,
      },
    ])
    console.log(usage)
  } else {
    if (options.host) {
      processorConfig.host = options.host
    }
    if (options.nobuild) {
      processorConfig.build = false
    }
    FinalizeHost(processorConfig)
    FinalizeProjectName(processorConfig, options.owner)
    console.log(processorConfig)

    let apiOverride = undefined
    if (options['api-key']) {
      apiOverride = options['api-key']
    }
    uploadFile(processorConfig, apiOverride)
  }
} else if (mainOptions.command === 'login') {
  const optionDefinitions = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Display this usage guide.',
    },
    {
      name: 'api-key',
      type: String,
      description: '(Required) Your API key',
    },
    {
      name: 'host',
      description: '(Optional) Override Sentio Host name',
      type: String,
    },
  ]
  const options = commandLineArgs(optionDefinitions, { argv })

  if (options.help || !options['api-key']) {
    const usage = commandLineUsage([
      {
        header: 'Sentio login',
        content: 'Try login to Sentio with your apikey.',
      },
      {
        header: 'Options',
        optionList: optionDefinitions,
      },
    ])
    console.log(usage)
  } else {
    if (options.host) {
      processorConfig.host = options.host
    }
    FinalizeHost(processorConfig)
    console.log(processorConfig)

    const url = new URL(processorConfig.host)
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: '/api/v1/processors/check_key',
      method: 'HEAD',
      headers: {
        'api-key': options['api-key'],
      },
    }
    const h = url.protocol == 'https:' ? https : http
    const req = h.request(reqOptions, (res) => {
      if (res.statusCode == 200) {
        WriteKey(processorConfig.host, options['api-key'])
        console.log(chalk.green('login success'))
      } else {
        console.error(chalk.red('login failed, code:', res.statusCode, res.statusMessage))
      }
    })

    req.on('error', (error) => {
      console.error(error)
    })

    req.end()
  }
} else if (mainOptions.command === 'build') {
  buildProcessor(false, processorConfig.targets)
} else if (mainOptions.command === 'gen') {
  buildProcessor(true, processorConfig.targets)
} else {
  const usage = commandLineUsage([
    {
      header: 'Sentio',
      content: 'Login & Upload your project files to Sentio.',
    },
    {
      header: 'Usage',
      content: [
        'sentio $command --help\t\tshow detail usage of specific command',
        'sentio login --api-key=xx\t\tsave credential to local',
        'sentio upload\t\t\t\tbuild and upload processor to sentio',
        'sentio gen\t\t\t\tgenerate abi',
        'sentio build\t\t\t\tgenerate abi and build',
      ],
    },
  ])
  console.log(usage)
}
