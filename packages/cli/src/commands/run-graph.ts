import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import path from 'path'
import { finalizeHost, FinalizeProjectName, YamlProjectConfig } from '../config.js'
import { getPackageRoot, getSdkVersion } from '../utils.js'
import { execStep, execYarn } from '../execution.js'
import { ReadKey } from '../key.js'
import fs from 'fs'
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

  let apiKey = ReadKey(processorConfig.host) as string
  if (options['api-key']) {
    apiKey = options['api-key']
  }

  await execStep(
    [
      'npx',
      'graph',
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

  await uploadFile(processorConfig, { 'api-key': apiKey })
}

const IGNORE_LIST = ['build', 'node_modules']

async function uploadFile(options: YamlProjectConfig, auth: Auth, continueFrom?: number) {
  const zip = new JSZip()
  fs.readdirSync('.').forEach((item) => {
    if (item.startsWith('.') || item.includes('lock') || IGNORE_LIST.includes(item)) {
      return
    }
    if (fs.lstatSync(item).isDirectory()) {
      fs.readdirSync(item, { recursive: true }).forEach((p) => {
        const filepath = path.join(item, p as string)
        if (fs.lstatSync(filepath).isDirectory()) {
          return
        }
        zip.file(`${item}/${p}`, fs.readFileSync(filepath))
      })
    } else {
      zip.file(item, fs.readFileSync(item))
    }
  })

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
