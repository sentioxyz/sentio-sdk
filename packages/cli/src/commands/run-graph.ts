import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import path from 'path'
import { finalizeHost, FinalizeProjectName, YamlProjectConfig } from '../config.js'
import { getSdkVersion, getPackageRoot, errorOnUnknownOption } from '../utils.js'
import { execStep, execPackageManager } from '../execution.js'
import { ReadKey } from '../key.js'
import fs from 'fs'
import { readdir, readFile, writeFile } from 'fs/promises'
import JSZip from 'jszip'
import chalk from 'chalk'
import { Auth, initUpload, finishUpload, getGitAttributes, createProjectPrompt } from './run-upload.js'
import fetch from 'node-fetch'
import process from 'process'
import { supportedChainMessage } from './run-create.js'
import { EthChainInfo } from '@sentio/chain'
import yaml from 'yaml'

export async function runGraph(argv: string[]) {
  const [command, ...rest] = argv
  if (!['create', 'deploy'].includes(command)) {
    const usage = commandLineUsage([
      {
        header: 'Sentio graph',
        content: 'Create and deploy sentio subgraph processor'
      },
      {
        header: 'Usage',
        content: [
          'sentio graph <subcommand> --help\t\tshow detail usage of specific subcommand',
          'sentio graph create\t\t\t\tCreate a subgraph processor',
          'sentio graph deploy\t\t\t\tDeploy subgraph processor to sentio'
        ]
      }
    ])
    console.log(usage)
    process.exit(0)
  }

  switch (command) {
    case 'create':
      return runGraphCreate(rest)
    case 'deploy':
      return runGraphDeploy(rest)
  }
}

const createOptionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.'
  },
  {
    name: 'name',
    alias: 'n',
    defaultOption: true,
    type: String,
    description: 'Project name'
  },
  // {
  //   name: 'chain-type',
  //   alias: 'c',
  //   description:
  //     'The type of project you want to create, can be \n,  eth \n,  aptos \n,  fuel\n,  solana\n,  sui\n,  raw (if you want to start from scratch and support multiple types of chains)',
  //   type: String,
  //   defaultValue: 'eth'
  // },
  {
    name: 'chain-id',
    type: String,
    description: '(Optional) The chain id to use for eth. Supported: ' + supportedChainMessage.join('\n,'),
    defaultValue: '1'
  }
]

async function runGraphCreate(argv: string[]) {
  const options = commandLineArgs(createOptionDefinitions, { argv, partial: true })
  if (options.help || !options.name) {
    const usage = commandLineUsage([
      {
        header: 'Create a subgraph template project',
        content: 'sentio graph create <name>'
      },
      {
        header: 'Options',
        optionList: createOptionDefinitions
      }
    ])
    console.log(usage)
    process.exit(0)
  }

  errorOnUnknownOption(options)

  const projectName = options.name
  const chainId: string = options['chain-id']
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

const deployOptionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.'
  },
  {
    name: 'api-key',
    type: String,
    description:
      '(Optional) Manually provide API key rather than use saved credential, if both api-key and jwt-token is provided, use api-key.'
  },
  {
    name: 'host',
    description: '(Optional) Override Sentio Host name',
    type: String
  },
  {
    name: 'owner',
    description: '(Optional) Override Project owner',
    type: String
  },
  {
    name: 'name',
    description: '(Optional) Override Project name',
    type: String
  },
  {
    name: 'continue-from',
    description:
      '(Optional) Continue processing data from the specific processor version which will keeping the old data from previous version and will STOP that version IMMEDIATELY.',
    type: Number
  },
  {
    name: 'dir',
    description: '(Optional) The location of subgraph project, default to the current directory',
    type: String
  },
  {
    name: 'skip-gen',
    type: Boolean,
    description: 'Skip code generation.'
  }
]

async function createProjectIfMissing(options: YamlProjectConfig, apiKey: string) {
  const [ownerName, slug] = options.project.split('/')
  const getProjectRes = await fetch(new URL(`/api/v1/project/${ownerName}/${slug}`, options.host), {
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

async function runGraphDeploy(argv: string[]) {
  let processorConfig: YamlProjectConfig = { host: '', project: '', build: true, debug: false, contracts: [] }
  const yamlPath = path.join(process.cwd(), 'sentio.yaml')
  if (fs.existsSync(yamlPath)) {
    processorConfig = yaml.parse(fs.readFileSync('sentio.yaml', 'utf8')) as YamlProjectConfig
    if (!processorConfig.project) {
      console.error('Config yaml must contain a valid project identifier')
      process.exit(1)
    }
  }

  const options = commandLineArgs(deployOptionDefinitions, { argv, partial: true })
  if (options.help) {
    const usage = commandLineUsage([
      {
        header: 'Create a subgraph template project',
        content: 'sentio graph create <name>'
      },
      {
        header: 'Options',
        optionList: deployOptionDefinitions
      }
    ])
    console.log(usage)
    process.exit(0)
  }

  finalizeHost(processorConfig, options.host)
  FinalizeProjectName(processorConfig, options.owner, options.name)
  if (!/^[\w-]+\/[\w-]+$/.test(processorConfig.project)) {
    console.error('Must provide a valid project identifier: --owner OWNER --name NAME')
    process.exit(1)
  }

  let apiKey = ReadKey(processorConfig.host) as string
  if (options['api-key']) {
    apiKey = options['api-key']
  }

  await createProjectIfMissing(processorConfig, apiKey)

  const continueFrom = options['continue-from']
  const versionLabel = continueFrom ? `continue-from:${continueFrom}` : Date.now().toString()

  const graph = path.resolve(getPackageRoot('@sentio/graph-cli'), 'bin', 'run')
  const execOptions = {
    cwd: options.dir
  }
  if (!options['skip-gen']) {
    await execStep(['node', graph, 'codegen'], 'Graph codegen', execOptions)
  }
  await execStep(
    [
      'node',
      graph,
      'deploy',
      '--node',
      new URL('/api/v1/graph-node', processorConfig.host).toString(),
      '--ipfs',
      new URL('/api/v1/ipfs', processorConfig.host).toString(),
      '--version-label',
      versionLabel,
      '--deploy-key',
      apiKey,
      processorConfig.project,
      ...(options._unknown || [])
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
    zip = await genZip(options._unknown)
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

async function uploadFile(zip: JSZip, options: YamlProjectConfig, auth: Auth, continueFrom?: number) {
  const sdkVersion = getSdkVersion()
  const sequence = 2
  const initUploadResRaw = await initUpload(options.host, auth, options.project, sdkVersion, sequence)
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
    console.error(chalk.red('Failed to upload'))
    throw uploadResRaw.text()
  }

  const sha256 = ''
  const { commitSha, gitUrl } = getGitAttributes()
  // finish uploading
  const finishUploadResRaw = await finishUpload(options, auth, sha256, commitSha, gitUrl, continueFrom, sequence)
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
