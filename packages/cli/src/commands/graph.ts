import { Command } from '@commander-js/extra-typings'
import path from 'path'
import { overrideConfigWithOptions, YamlProjectConfig } from '../config.js'
import { getSdkVersion, getPackageRoot, getApiUrl } from '../utils.js'
import { execStep, execPackageManager } from '../execution.js'
import { ReadKey } from '../key.js'
import fs from 'fs'
import { readdir, readFile, writeFile } from 'fs/promises'
import JSZip from 'jszip'
import chalk from 'chalk'
import { getGitAttributes, createProjectPrompt } from './upload.js'
import { Auth, initUpload, finishUpload } from '../uploader.js'
import fetch from 'node-fetch'
import process from 'process'
import { supportedChainMessage } from './create.js'
import { EthChainInfo } from '@sentio/chain'
import yaml from 'yaml'
import { CommandOptionsType } from './types.js'

function createGraphCreateCommand() {
  return new Command('create')
    .description('Create a new graph')
    .argument('<name>', 'Project name')
    .requiredOption(
      '--chain-id <id>',
      '(Optional) The chain id to use for eth. Supported: ' + supportedChainMessage.join('\n,'),
      '1'
    )
    .action(async (name, options) => {
      await runGraphCreateInternal(name, options)
    })
}

function createGraphDeployCommand() {
  return new Command('deploy')
    .description('Deploy the graph')
    .option('--owner <owner>', 'Sentio Project owner, omit if specified in sentio.yaml')
    .option('--name <name>', 'Sentio Project name, omit if specified in sentio.yaml')
    .option('--api-key <key>', '(Optional) Manually provide API key rather than use saved credential')
    .option('--host <host>', '(Optional) Override Sentio Host name')
    .option(
      '--continue-from <version>',
      '(Optional) Continue processing data from the specific processor version, which will keeping the old data from previous version and will STOP that version IMMEDIATELY.',
      parseInt
    )
    .option('--dir <dir>', '(Optional) The location of subgraph project, default to the current directory')
    .option('--skip-gen', '(Optional) Skip code generation.')
    .allowUnknownOption()
    .allowExcessArguments()
    .action(async (options, cmd) => {
      await runGraphDeployInternal(options, cmd.args)
    })
}

export function createGraphCommand() {
  const graphCommand = new Command('graph').description('Graph related commands')

  graphCommand.addCommand(createGraphCreateCommand())
  graphCommand.addCommand(createGraphDeployCommand())

  return graphCommand
}

async function runGraphCreateInternal(
  projectName: string,
  options: CommandOptionsType<typeof createGraphCreateCommand>
) {
  if (!projectName) {
    console.error('Project name is required')
    process.exit(1)
  }

  const chainId: string = options.chainId
  const chainInfo = EthChainInfo[chainId]

  const packageRoot = getPackageRoot('@sentio/cli')
  const templateFolder = path.join(packageRoot, 'templates', 'subgraph')
  const graph = path.resolve(getPackageRoot('@sentio/graph-cli'), 'bin', 'run')
  await execStep(
    [
      'node',
      graph,
      'init',
      projectName,
      projectName,
      '--protocol',
      'ethereum',
      '--network',
      `"${chainId}"`,
      '--from-contract',
      chainInfo.wrappedTokenAddress,
      '--abi',
      path.join(templateFolder, 'abis', 'eth', 'weth.json'),
      '--skip-git',
      '--skip-install'
    ],
    'Graph init'
  )

  const dstFolder = path.resolve(process.cwd(), projectName)
  const packageJsonPath = path.resolve(dstFolder, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const cliVersion = '^' + JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8')).version
  delete packageJson.dependencies['@graphprotocol/graph-cli']
  packageJson.devDependencies['@sentio/cli'] = cliVersion
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  await execPackageManager(['install'], 'install', { cwd: dstFolder })
}

async function createProjectIfMissing(options: YamlProjectConfig, apiKey: string) {
  const [ownerName, slug] = options.project.split('/')
  const getProjectRes = await fetch(getApiUrl(`/api/v1/project/${ownerName}/${slug}`, options.host), {
    headers: { 'api-key': apiKey }
  })
  const projectData = (await getProjectRes.json()) as any
  if (projectData.project) {
    return
  }
  const created = await createProjectPrompt(options, { 'api-key': apiKey }, 'SUBGRAPH')
  if (!created) {
    process.exit(1)
  }
}

async function runGraphDeployInternal(
  options: CommandOptionsType<typeof createGraphDeployCommand>,
  extraArgs: string[] = []
) {
  let processorConfig: YamlProjectConfig = { host: '', project: '', debug: false, contracts: [] }
  const yamlPath = path.join(process.cwd(), 'sentio.yaml')
  if (fs.existsSync(yamlPath)) {
    processorConfig = yaml.parse(fs.readFileSync('sentio.yaml', 'utf8')) as YamlProjectConfig
    if (!processorConfig.project) {
      console.error('Config yaml must contain a valid project identifier')
      process.exit(1)
    }
  }

  overrideConfigWithOptions(processorConfig, options)

  if (!/^[\w-]+\/[\w-]+$/.test(processorConfig.project)) {
    console.error('Must provide a valid project identifier: --owner <OWNER> --name <NAME> or specific in sentio.yaml')
    process.exit(1)
  }

  let apiKey = ReadKey(processorConfig.host) as string
  if (options.apiKey) {
    apiKey = options.apiKey
  }

  await createProjectIfMissing(processorConfig, apiKey)

  const continueFrom = options.continueFrom
  const versionLabel = continueFrom ? `continue-from:${continueFrom}` : Date.now().toString()

  const graph = path.resolve(getPackageRoot('@sentio/graph-cli'), 'bin', 'run')
  const execOptions = {
    cwd: options.dir
  }
  if (!options.skipGen) {
    await execStep(['node', graph, 'codegen'], 'Graph codegen', execOptions, '(can be skipped with --skip-deps)')
  }
  await execStep(
    [
      'node',
      graph,
      'deploy',
      '--node',
      getApiUrl('/api/v1/graph-node', processorConfig.host).toString(),
      '--ipfs',
      getApiUrl('/api/v1/ipfs', processorConfig.host).toString(),
      '--version-label',
      versionLabel,
      '--deploy-key',
      apiKey,
      processorConfig.project,
      ...extraArgs
    ],
    'Graph deploy',
    execOptions
  )

  const cwd = process.cwd()

  if (options.dir) {
    process.chdir(options.dir)
  }
  let zip
  try {
    await bundleSourceMap()
    zip = await genZip(extraArgs)
  } finally {
    if (options.dir) {
      process.chdir(cwd)
    }
  }

  await uploadFile(zip, processorConfig, { 'api-key': apiKey }, continueFrom)
}

async function bundleSourceMap() {
  const fileMap = new Map<string, string>()

  const files = await readdir('build', { recursive: true })
  for (const file of files) {
    if (!file.endsWith('.wasm.map')) {
      continue
    }
    const content = await readFile(path.join('build', file), 'utf8')
    const { sources, sourcesContent } = JSON.parse(content) as { sources: string[]; sourcesContent: string[] }
    sources.forEach((name, index) => fileMap.set(name, sourcesContent[index]))
  }
  const folder = 'src'
  fs.readdirSync(folder, { recursive: true, encoding: 'utf8' }).forEach((p) => {
    const filepath = path.join(folder, p)
    if (fs.lstatSync(filepath).isDirectory() || !['.ts', '.json', '.graphql'].includes(path.extname(p))) {
      return
    }
    fileMap.set(`${folder}/${p}`, fs.readFileSync(filepath, 'utf8'))
  })
  await writeFile(
    'build/sentio-graph.wasm.map',
    JSON.stringify({
      sources: [...fileMap.keys()],
      sourcesContent: [...fileMap.values()]
    })
  )
}

async function genZip(extra: string[] = []) {
  const zip = new JSZip()
  ;[
    'package.json',
    'tsconfig.json',
    'sentio.yaml',
    'build/sentio-graph.wasm.map',
    'subgraph.yaml',
    'schema.graphql',
    ...extra
  ].forEach((p) => {
    if (fs.existsSync(p)) {
      zip.file(p, fs.readFileSync(p))
    }
  })
  if (fs.existsSync('abis') && fs.lstatSync('abis').isDirectory()) {
    fs.readdirSync('abis').forEach((p) => {
      const item = path.join('abis', p)
      if (fs.lstatSync(item).isDirectory()) {
        fs.readdirSync(item).forEach((p) => {
          if (p.endsWith('.json')) {
            zip.file(`${item}/${p}`, fs.readFileSync(path.join(item, p)))
          }
        })
      } else if (p.endsWith('.json')) {
        zip.file(`abis/${p}`, fs.readFileSync(item))
      }
    })
  }

  return zip
}

async function uploadFile(
  zip: JSZip,
  options: YamlProjectConfig,
  auth: Auth,
  continueFrom?: number,
  numWorkers?: number
) {
  const sdkVersion = getSdkVersion()
  const sequence = 2
  const initUploadResRaw = await initUpload(options.host, auth, options.project, sdkVersion, sequence)
  if (!initUploadResRaw.ok) {
    console.error(chalk.red('Failed to init upload', initUploadResRaw.status, initUploadResRaw.statusText))
    return
  }
  const initUploadRes = (await initUploadResRaw.json()) as { url: string }
  const uploadUrl = initUploadRes.url

  const uploadResRaw = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    body: zip.generateNodeStream()
  })
  if (!uploadResRaw.ok) {
    console.error(chalk.red('Failed to upload', uploadResRaw.status, uploadResRaw.statusText))
    throw uploadResRaw.text()
  }

  const sha256 = ''
  const { commitSha, gitUrl } = getGitAttributes()
  // finish uploading
  const finishUploadResRaw = await finishUpload(
    options,
    auth,
    sha256,
    commitSha,
    gitUrl,
    continueFrom,
    sequence,
    numWorkers
  )
  if (!finishUploadResRaw.ok) {
    console.error(chalk.red('Failed to finish uploading'))
    console.error(chalk.red(await finishUploadResRaw.text()))
    return
  }

  console.log(chalk.green('Upload success: '))
  if (commitSha) {
    console.log('\t', chalk.blue('Git commit SHA:'), commitSha)
  }
  const { projectFullSlug, processorId, version } = (await finishUploadResRaw.json()) as {
    projectFullSlug: string
    processorId: string
    version: string
  }
  console.log('\t', chalk.blue('Check status:'), `${options.host}/${projectFullSlug}/datasource/${processorId}`)
  console.log('\t', chalk.blue('Version:'), version)
}
