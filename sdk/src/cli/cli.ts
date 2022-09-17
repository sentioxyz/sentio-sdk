#!/usr/bin/env node

import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import fs from 'fs'
import path from 'path'

import yaml from 'js-yaml'
import { EVM, finalizeHost, FinalizeProjectName, SentioProjectConfig } from './config'
import { uploadFile } from './upload'
import chalk from 'chalk'
import { buildProcessor } from './build'
import { runLogin } from './commands/run-login'
import { runCreate } from './commands/run-create'

const mainDefinitions = [{ name: 'command', defaultOption: true }]
const mainOptions = commandLineArgs(mainDefinitions, {
  stopAtFirstUnknown: true,
})
const argv = mainOptions._unknown || []

if (!mainOptions.command) {
  usage()
}

if (mainOptions.command === 'login') {
  runLogin(argv)
} else if (mainOptions.command === 'create') {
  runCreate(argv)
} else {
  // For all the commands that need read project configs
  // TODO move them to their own modules

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
          content: 'sentio upload',
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
      finalizeHost(processorConfig)
      FinalizeProjectName(processorConfig, options.owner)
      console.log(processorConfig)

      let apiOverride = undefined
      if (options['api-key']) {
        apiOverride = options['api-key']
      }
      uploadFile(processorConfig, apiOverride)
    }
  } else if (mainOptions.command === 'build') {
    buildProcessor(false, processorConfig.targets)
  } else if (mainOptions.command === 'gen') {
    buildProcessor(true, processorConfig.targets)
  } else {
    usage()
  }
}

function usage() {
  const usage = commandLineUsage([
    {
      header: 'Sentio',
      content: 'Login & Manage your project files to Sentio.',
    },
    {
      header: 'Usage',
      content: [
        'sentio $command --help\t\tshow detail usage of specific command',
        'sentio login --api-key=xx\t\tsave credential to local',
        'sentio create\t\t\t\tcreate a template project',
        'sentio upload\t\t\t\tbuild and upload processor to sentio',
        'sentio gen\t\t\t\tgenerate abi',
        'sentio build\t\t\t\tgenerate abi and build',
      ],
    },
  ])
  console.log(usage)
  process.exit(1)
}
