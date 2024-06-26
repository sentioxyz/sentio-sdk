import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import path from 'path'
import { finalizeHost, FinalizeProjectName, YamlProjectConfig } from '../config.js'
import { getSdkVersion, getPackageRoot } from '../utils.js'
import { execStep } from '../execution.js'
import { ReadKey } from '../key.js'
import fs from 'fs'
import { readdir, readFile, writeFile } from 'fs/promises'
import JSZip from 'jszip'
import chalk from 'chalk'
import { Auth, initUpload, finishUpload, getGitAttributes } from './run-upload.js'
import fetch from 'node-fetch'

const optionDefinitions = [
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
  }
]

export async function runGraph(processorConfig: YamlProjectConfig, argv: string[]) {
  const options = commandLineArgs(optionDefinitions, { argv, partial: true })
  if (options.help || argv[0] != 'deploy') {
    const usage = commandLineUsage([
      {
        header: 'Sentio graph',
        content: 'sentio graph'
      },
      {
        header: 'Usage',
        content: ['sentio graph deploy\t\t\t\tDeploy subgraph processor to sentio']
      },
      {
        header: 'Options',
        optionList: optionDefinitions
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

  const graph = path.resolve(getPackageRoot('@sentio/graph-cli'), 'bin', 'run')
  await execStep(['node', graph, 'codegen'], 'Graph codegen')
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
      Date.now().toString(),
      '--deploy-key',
      apiKey,
      processorConfig.project
    ],
    'Graph deploy'
  )

  await bundleSourceMap()

  const zip = await await genZip()
  await uploadFile(zip, processorConfig, { 'api-key': apiKey })
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
  await writeFile(
    'build/sentio-graph.wasm.map',
    JSON.stringify({
      sources: [...fileMap.keys()],
      sourcesContent: [...fileMap.values()]
    })
  )
}

async function genZip() {
  const zip = new JSZip()
  ;[
    'package.json',
    'tsconfig.json',
    'sentio.yaml',
    'build/sentio-graph.wasm.map',
    'subgraph.yaml',
    'schema.graphql'
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
  const finishUploadResRaw = await finishUpload(
    options.host,
    auth,
    options.project,
    sdkVersion,
    sha256,
    commitSha,
    gitUrl,
    options.debug,
    continueFrom,
    sequence
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
