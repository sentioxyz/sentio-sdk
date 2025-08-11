#!/usr/bin/env node

import { Command } from 'commander'
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
import { printVersions } from './utils.js'

const program = new Command()

program.name('sentio').description('Login & Manage your project files to Sentio.').version('2.0.0')

await printVersions()

program
  .command('login')
  .description('login to sentio')
  .option('-h, --help', 'Display this usage guide.')
  .option('--host <host>', '(Optional) Override Sentio Host name')
  .option('--api-key <key>', '(Optional) Your API key')
  .action((options) => {
    runLogin(process.argv.slice(3))
  })

program
  .command('create')
  .description('create a template project')
  .argument('<name>', 'Project name')
  .option('-h, --help', 'Display this usage guide.')
  .option(
    '-p, --subproject',
    'If this is a subproject in mono-repo setup, in this case sdk version is controlled in parent package.json.'
  )
  .option('-s, --sdk-version <version>', '(Optional) The version of @sentio/sdk to use, default latest')
  .option(
    '-d, --directory <dir>',
    '(Optional) The root direct new project will be created, default current working dir'
  )
  .option(
    '-c, --chain-type <type>',
    'The type of project you want to create, can be eth, aptos, fuel, solana, sui, iota, starknet, raw',
    'eth'
  )
  .option('--chain-id <id>', '(Optional) The chain id to use for eth', '1')
  .action(async (name, options) => {
    await runCreate(process.argv.slice(3))
  })

program
  .command('version')
  .description('current cli version')
  .option('-h, --help', 'Display this usage guide.')
  .action((options) => {
    runVersion(process.argv.slice(3))
  })

program
  .command('test')
  .description('run tests')
  .option('-h, --help', 'Display this usage guide.')
  .option('--test-only', "run tests with 'only' option set")
  .option('--test-name-pattern <pattern>', 'run tests whose name matches this regular expression')
  .option('--test-skip-pattern <pattern>', 'run tests whose name do not match this regular expression')
  .action((options) => {
    runTest(process.argv.slice(3))
  })

program
  .command('add')
  .description('add contract ABI to the project')
  .argument('<address>', 'Address of the contract')
  .option('-h, --help', 'Display this usage guide.')
  .option('-n, --name <name>', 'File name for the downloaded contract, if empty, use address as file name')
  .option('-c, --chain <chain>', 'Chain ID', '1')
  .option('--folder <folder>', '(Optional) The folder to save the downloaded ABI file')
  .action(async (address, options) => {
    await runAdd(process.argv.slice(3))
  })

program
  .command('compile')
  .description('compile and upload local contract')
  .option('-h, --help', 'Display this usage guide.')
  .option('--upload', '(Optional) Upload to sentio if compiled successfully')
  .option('--project <project>', '(Optional) Project full name, required in uploading')
  .option('--api-key <key>', '(Optional) Manually provide API key rather than use saved credential')
  .option('--token <token>', '(Optional) Manually provide token rather than use saved credential')
  .option('--host <host>', '(Optional) Sentio Host name')
  .action(async (options) => {
    await runCompile(process.argv.slice(3))
  })

const graphCommand = program.command('graph').description('build and upload subgraph processor to sentio')

graphCommand
  .command('create')
  .description('Create a subgraph processor')
  .argument('<name>', 'Project name')
  .option('-h, --help', 'Display this usage guide.')
  .option('--chain-id <id>', '(Optional) The chain id to use for eth', '1')
  .action(async (name, options) => {
    await runGraph(['create', ...process.argv.slice(4)])
  })

graphCommand
  .command('deploy')
  .description('Deploy subgraph processor to sentio')
  .option('-h, --help', 'Display this usage guide.')
  .option('--api-key <key>', '(Optional) Manually provide API key rather than use saved credential')
  .option('--host <host>', '(Optional) Override Sentio Host name')
  .option('--owner <owner>', '(Optional) Override Project owner')
  .option('--name <name>', '(Optional) Override Project name')
  .option(
    '--continue-from <version>',
    '(Optional) Continue processing data from the specific processor version',
    parseInt
  )
  .option('--dir <dir>', '(Optional) The location of subgraph project, default to the current directory')
  .option('--skip-gen', 'Skip code generation.')
  .action(async (options) => {
    await runGraph(['deploy', ...process.argv.slice(4)])
  })

async function loadProcessorConfig(): Promise<YamlProjectConfig> {
  let processorConfig: YamlProjectConfig = { host: '', project: '', build: true, debug: false, contracts: [] }

  try {
    console.log(chalk.blue('Loading Process config'))
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
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  return processorConfig
}

program
  .command('upload')
  .description('build and upload processor to sentio')
  .option('-h, --help', 'Display this usage guide.')
  .option('--api-key <key>', '(Optional) Manually provide API key rather than use saved credential')
  .option('--token <token>', '(Optional) Manually provide token rather than use saved credential')
  .option('--host <host>', '(Optional) Override Sentio Host name')
  .option('--owner <owner>', '(Optional) Override Project owner')
  .option('--name <name>', '(Optional) Override Project name')
  .option(
    '--continue-from <version>',
    '(Optional) Continue processing data from the specific processor version',
    parseInt
  )
  .option('--nobuild', '(Optional) Skip build & pack file before uploading, default false')
  .option('--debug', '(Optional) Run driver in debug mode, default false')
  .option('--silent-overwrite', '(Optional) Overwrite exiting processor version without confirmation, default false')
  .option('--skip-gen', 'Skip code generation.')
  .option('--skip-deps', 'Skip dependency enforce.')
  .option('--example', 'Generate example usage of the processor.')
  .action(async (options) => {
    const processorConfig = await loadProcessorConfig()
    await runUpload(processorConfig, process.argv.slice(3))
  })

program
  .command('build')
  .description('generate abi and build')
  .option('-h, --help', 'Display this usage guide.')
  .option('--skip-gen', 'Skip code generation.')
  .option('--skip-deps', 'Skip dependency enforce.')
  .option('--example', 'Generate example usage of the processor.')
  .action(async (options) => {
    await buildProcessorWithArgs(process.argv.slice(3))
  })

program
  .command('gen')
  .description('generate abi')
  .option('-h, --help', 'Display this usage guide.')
  .option('--example', 'Generate example usage of the processor.')
  .action(async (options) => {
    await generate(process.argv.slice(3))
  })

program.parse()
