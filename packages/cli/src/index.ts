#!/usr/bin/env node

import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import fs from 'fs'
import path from 'path'

import yaml from 'yaml'
import { YamlProjectConfig } from './config.js'
import chalk from 'chalk'
import { buildProcessorWithArgs, generate } from './commands/build.js'
import { runCreate } from './commands/run-create.js'
import { runVersion } from './commands/run-version.js'
import { runLogin } from './commands/run-login.js'
import { runUpload } from './commands/run-upload.js'
import { runTest } from './commands/run-test.js'
import { runAdd } from './commands/run-add.js'
import { runCompile } from './commands/run-compile.js'
import { runGraph } from './commands/run-graph.js'

const mainDefinitions = [{ name: 'command', defaultOption: true }]
const mainOptions = commandLineArgs(mainDefinitions, {
  stopAtFirstUnknown: true
})
const argv = mainOptions._unknown || []

if (!mainOptions.command) {
  usage()
  process.exit(0)
}

if (mainOptions.command === 'login') {
  runLogin(argv)
} else if (mainOptions.command === 'create') {
  await runCreate(argv)
} else if (mainOptions.command === 'version') {
  runVersion(argv)
} else if (mainOptions.command === 'test') {
  runTest(argv)
} else if (mainOptions.command === 'add') {
  await runAdd(argv)
} else if (mainOptions.command === 'compile') {
  await runCompile(argv)
} else if (mainOptions.command === 'graph') {
  await runGraph(argv)
} else {
  // For all the commands that need read project configs
  // TODO move them to their own modules

  // Process configs
  let processorConfig: YamlProjectConfig = { host: '', project: '', build: true, debug: false, contracts: [] }
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
    const yamlExists = fs.existsSync(yamlPath)
    if (!yamlExists) {
      console.error('sentio.yaml not found, please create one according to: TODO docs')
      process.exit(1)
    }

    if (yamlExists) {
      processorConfig = yaml.parse(fs.readFileSync('sentio.yaml', 'utf8')) as YamlProjectConfig
      if (!processorConfig.project) {
        console.error('Config yaml must contain a valid project identifier')
        process.exit(1)
      }
    }
    if (processorConfig.build === undefined) {
      processorConfig.build = true
    }
    if (!processorConfig.host) {
      processorConfig.host = 'prod'
    }
    if (processorConfig.debug === undefined) {
      processorConfig.debug = false
    }

    // if (!processorConfig.source) {
    //   processorConfig.source = 'src/processor.ts'
    // }
    // if (!processorConfig.targets) {
    //   console.warn('targets is not defined, use EVM as the default target')
    //   processorConfig.targets = []
    // }
    // if (processorConfig.targets.length === 0) {
    //   // By default evm
    //   processorConfig.targets.push({ chain: EVM })
    // }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  if (mainOptions.command === 'upload') {
    await runUpload(processorConfig, argv)
  } else if (mainOptions.command === 'build') {
    await buildProcessorWithArgs(argv)
  } else if (mainOptions.command === 'gen') {
    await generate(argv)
  } else {
    usage()
  }
}

function usage() {
  const usage = commandLineUsage([
    {
      header: 'Sentio',
      content: 'Login & Manage your project files to Sentio.'
    },
    {
      header: 'Usage',
      content: [
        'sentio <command> --help\t\tshow detail usage of specific command',
        'sentio login\t\t\t\tlogin to sentio',
        'sentio create\t\t\t\tcreate a template project',
        'sentio add\t\t\t\tadd contract ABI to the project',
        'sentio upload\t\t\t\tbuild and upload processor to sentio',
        'sentio graph\t\t\t\tbuild and upload subgraph processor to sentio',
        'sentio gen\t\t\t\tgenerate abi',
        'sentio build\t\t\t\tgenerate abi and build',
        'sentio test\t\t\t\trun tests',
        'sentio compile\t\t\tcompile and upload local contract',
        'sentio version\t\t\tcurrent cli version'
      ]
    }
  ])
  console.log(usage)
  process.exit(0)
}
