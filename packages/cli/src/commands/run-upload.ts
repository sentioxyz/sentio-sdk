import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import { finalizeHost, FinalizeProjectName, YamlProjectConfig } from '../config.js'
import { URL } from 'url'
import fetch from 'node-fetch'
import { buildOptionDefinitions, buildProcessor } from './build.js'
import chalk from 'chalk'
import path from 'path'
import { ReadKey } from '../key.js'
import fs from 'fs'
import { createHash } from 'crypto'
import { CommonExecOptions, execFileSync } from 'child_process'
import { errorOnUnknownOption, getCliVersion, getSdkVersion } from '../utils.js'
import readline from 'readline'
import JSZip from 'jszip'

const uploadOptionDefinitions = [
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
    name: 'token',
    type: String,
    description:
      '(Optional) Manually provide token rather than use saved credential, if both api-key and token is provided, use api-key.'
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
    name: 'nobuild',
    description: '(Optional) Skip build & pack file before uploading, default false',
    type: Boolean
  },
  {
    name: 'debug',
    description: '(Optional) Run driver in debug mode, default false',
    type: Boolean
  },
  {
    name: 'silent-overwrite',
    description: '(Optional) Overwrite exiting processor version without confirmation, default false',
    type: Boolean
  }
]

function mergeOptions(options1: commandLineArgs.OptionDefinition[], options2: commandLineArgs.OptionDefinition[]) {
  const res = Object.assign([], options1)
  const added = new Set<string>()
  for (const opt of options1) {
    added.add(opt.name)
  }
  for (const opt of options2) {
    if (!added.has(opt.name)) {
      res.push(opt)
    }
  }
  return res
}

export async function runUpload(processorConfig: YamlProjectConfig, argv: string[]) {
  const optionDefinitions = mergeOptions(uploadOptionDefinitions, buildOptionDefinitions)

  const options = commandLineArgs(optionDefinitions, { argv, partial: true })
  if (options.help) {
    const usage = commandLineUsage([
      {
        header: 'Sentio upload',
        content: 'sentio upload'
      },
      {
        header: 'Options',
        optionList: optionDefinitions
      }
    ])
    console.log(usage)
    process.exit(0)
  }

  errorOnUnknownOption(options)

  if (options.nobuild) {
    processorConfig.build = false
  }
  if (options.debug) {
    processorConfig.debug = true
  }
  if (options['silent-overwrite']) {
    processorConfig.silentOverwrite = true
  }
  finalizeHost(processorConfig, options.host)
  FinalizeProjectName(processorConfig, options.owner, options.name)
  console.log(processorConfig)

  const uploadAuth: Auth = {}

  let apiKey = ReadKey(processorConfig.host)
  if (options['api-key']) {
    apiKey = options['api-key']
  }
  if (apiKey) {
    uploadAuth['api-key'] = apiKey
  } else if (options['token']) {
    uploadAuth.authorization = 'Bearer ' + options['token']
  } else {
    const isProd = processorConfig.host === 'https://app.sentio.xyz'
    const cmd = isProd ? 'sentio login' : 'sentio login --host=' + processorConfig.host
    console.error(chalk.red('No Credential found for', processorConfig.host, '. Please run `' + cmd + '`.'))
    process.exit(1)
  }

  if (processorConfig.build) {
    await buildProcessor(false, options)
  }
  const continueFrom = options['continue-from']
  return uploadFile(processorConfig, uploadAuth, continueFrom)
}

async function createProject(options: YamlProjectConfig, auth: Auth, type?: string) {
  const url = new URL('/api/v1/projects', options.host)
  const [ownerName, slug] = options.project.includes('/') ? options.project.split('/') : [undefined, options.project]
  return fetch(url.href, {
    method: 'POST',
    headers: {
      ...auth
    },
    body: JSON.stringify({ slug, ownerName, visibility: 'PRIVATE', type })
  })
}

export async function createProjectPrompt(options: YamlProjectConfig, auth: Auth, type?: string): Promise<boolean> {
  const create = async () => {
    const res = await createProject(options, auth, type)
    if (!res.ok) {
      console.error(chalk.red('Create Project Failed'))
      console.error(chalk.red(((await res.json()) as { message: string }).message))
      return false
    }
    console.log(chalk.green('Project created'))
    return true
  }

  if (options.silentOverwrite) {
    return await create()
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  const answer: string = await new Promise((resolve) =>
    rl.question(`Project not found, do you want to create it and continue the uploading process? (yes/no) `, resolve)
  )
  if (['y', 'yes'].includes(answer.toLowerCase())) {
    if (!type && options.type == 'action') {
      type = 'ACTION'
    }

    rl.close()
    return await create()
  } else if (['n', 'no'].includes(answer.toLowerCase())) {
    rl.close()
    return false
  } else {
    rl.close()
    return createProjectPrompt(options, auth, type)
  }
}

export async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  const answer: string = await new Promise((resolve) => rl.question(`${question} (yes/no) `, resolve))
  if (['y', 'yes'].includes(answer.toLowerCase())) {
    rl.close()
    return true
  } else if (['n', 'no'].includes(answer.toLowerCase())) {
    rl.close()
    return false
  } else {
    rl.close()
    return confirm(question)
  }
}

export interface Auth {
  'api-key'?: string
  authorization?: string
}

export function getGitAttributes() {
  let commitSha = ''
  let gitUrl = ''
  try {
    const options: CommonExecOptions = {
      stdio: [undefined, undefined, 'ignore']
    }
    commitSha = execFileSync('git', ['rev-parse', 'HEAD'], options).toString().trim()
    gitUrl = execFileSync('git', ['remote', 'get-url', 'origin'], options).toString().trim()
  } catch (e) {}
  return { commitSha, gitUrl }
}

export async function uploadFile(options: YamlProjectConfig, auth: Auth, continueFrom: number | undefined) {
  console.log(chalk.blue('Prepare to upload'))

  const PROCESSOR_FILE = path.join(process.cwd(), 'dist/lib.js')

  if (!fs.existsSync(PROCESSOR_FILE)) {
    console.error(chalk.red('File not existed ', PROCESSOR_FILE, "don't use --nobuild"))
    process.exit(1)
  }

  const stat = fs.statSync(PROCESSOR_FILE)
  console.log('Packed processor file size', Math.floor(stat.size / 1024) + 'K, last modified', stat.mtime)
  const content = fs.readFileSync(PROCESSOR_FILE)
  const hash = createHash('sha256')
  hash.update(content)
  const digest = hash.digest('hex')

  if (continueFrom) {
    const res = await getProcessorStatus(options.host, auth, options.project)
    const data = (await res.json()) as { processors: { version: number }[] }
    const found = data?.processors?.find((x) => x.version == continueFrom)
    if (found) {
      if (!options.silentOverwrite) {
        const confirmed = await confirm(`Continue from version ${continueFrom}?`)
        if (!confirmed) {
          process.exit(0)
        }
      }
    } else {
      const latest = data.processors?.[0]?.version
      console.error(
        chalk.red(`Failed to find existed version ${continueFrom}` + (latest ? `, latest is ${latest}` : ''))
      )
      process.exit(0)
    }
  }

  let triedCount = 0
  const upload = async () => {
    const { commitSha, gitUrl } = getGitAttributes()
    const sha256 = digest
    console.log(chalk.blue(triedCount > 1 ? 'Retry uploading' : 'Uploading'))

    // get gcs upload url
    const initUploadResRaw = await initUpload(
      options.host,
      auth,
      options.project,
      getSdkVersion(),
      0,
      'application/zip'
    )
    if (!initUploadResRaw.ok) {
      // console.error(chalk.red('Failed to get upload url'))
      console.error(chalk.red(((await initUploadResRaw.json()) as { message: string }).message))
      if (initUploadResRaw.status === 404) {
        const created = await createProjectPrompt(options, auth, options.type)
        if (created) {
          await upload()
        }
      }
      return
    }
    const initUploadRes = (await initUploadResRaw.json()) as {
      url: string
      warning?: string
      replacingVersion: number
      multiVersion: boolean
    }
    if (!continueFrom && initUploadRes.replacingVersion && !options.silentOverwrite) {
      const confirmed = await confirm(
        `Create new version and deactivate ${initUploadRes.multiVersion ? 'pending' : 'active'} version ${initUploadRes.replacingVersion}?`
      )
      if (!confirmed) {
        process.exit(0)
      }
    }
    if (initUploadRes.warning) {
      console.warn(chalk.yellow('Warning:', initUploadRes.warning))
    }
    const uploadUrl = initUploadRes.url

    // do actual uploading
    const zip = new JSZip()
    zip.file('lib.js', fs.readFileSync(PROCESSOR_FILE))
    const uploadResRaw = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/zip'
      },
      body: zip.generateNodeStream()
    })
    if (!uploadResRaw.ok) {
      console.error(chalk.red('Failed to upload'))
      console.error(chalk.red(await uploadResRaw.text()))
      return
    }

    await uploadZip(options.host, auth, options.project, getSdkVersion(), continueFrom)

    // finish uploading
    const finishUploadResRaw = await finishUpload(
      options,
      auth,
      sha256,
      commitSha,
      gitUrl,
      continueFrom,
      1,
      initUploadRes.warning ? [initUploadRes.warning] : undefined
    )
    if (!finishUploadResRaw.ok) {
      console.error(chalk.red('Failed to finish uploading'))
      console.error(chalk.red(await finishUploadResRaw.text()))
      return
    }

    console.log(chalk.green('Upload success: '))
    console.log('\t', chalk.blue('sha256:'), digest)
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

  let error: Error
  const tryUploading = async () => {
    if (triedCount++ >= 5) {
      console.error(error)
      return
    }
    try {
      await upload()
    } catch (e) {
      if (e.constructor.name === 'FetchError' && e.type === 'system' && e.code === 'EPIPE') {
        error = e
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await tryUploading()
      } else {
        console.error(e)
      }
    }
  }

  await tryUploading()
}

async function getProcessorStatus(host: string, auth: Auth, projectSlug: string) {
  const url = new URL(`/api/v1/processors/${projectSlug}/status`, host)
  return fetch(url.href, {
    headers: {
      ...auth
    }
  })
}

export async function initUpload(
  host: string,
  auth: Auth,
  projectSlug: string,
  sdkVersion: string,
  sequence: number,
  contentType?: string
) {
  const initUploadUrl = new URL(`/api/v1/processors/init_upload`, host)
  return fetch(initUploadUrl.href, {
    method: 'POST',
    headers: {
      ...auth
    },
    body: JSON.stringify({
      project_slug: projectSlug,
      sdk_version: sdkVersion,
      sequence,
      contentType
    })
  })
}

export async function finishUpload(
  options: YamlProjectConfig,
  auth: Auth,
  sha256: string,
  commitSha: string,
  gitUrl: string,
  continueFrom: number | undefined,
  sequence = 1,
  warnings?: string[]
) {
  const finishUploadUrl = new URL(`/api/v1/processors/finish_upload`, options.host)
  return fetch(finishUploadUrl.href, {
    method: 'POST',
    headers: {
      ...auth
    },
    body: JSON.stringify({
      project_slug: options.project,
      cli_version: getCliVersion(),
      sdk_version: getSdkVersion(),
      sha256: sha256,
      commit_sha: commitSha,
      git_url: gitUrl,
      debug: options.debug,
      sequence,
      continueFrom,
      networkOverrides: options.networkOverrides,
      warnings
    })
  })
}

async function uploadZip(
  host: string,
  auth: Auth,
  projectSlug: string,
  sdkVersion: string,
  continueFrom: number | undefined
) {
  const initUploadResRaw = await initUpload(host, auth, projectSlug, sdkVersion, 1)
  const initUploadRes = (await initUploadResRaw.json()) as { url: string }
  const uploadUrl = initUploadRes.url

  const zip = new JSZip()
  fs.readdirSync('.').forEach((p) => {
    if (
      fs.lstatSync(p).isFile() &&
      (['package.json', 'tsconfig.json', 'sentio.yaml'].includes(p) || p.endsWith('.graphql'))
    ) {
      zip.file(p, fs.readFileSync(p))
    }
  })
  if (fs.existsSync('abis') && fs.lstatSync('abis').isDirectory()) {
    fs.readdirSync('abis').forEach((p) => {
      const item = path.join('abis', p)
      if (fs.lstatSync(item).isDirectory()) {
        fs.readdirSync(item).forEach((pp) => {
          if (pp.endsWith('.json')) {
            zip.file(`abis/${p}/${pp}`, fs.readFileSync(path.join(item, pp)))
          }
        })
      } else if (p.endsWith('.json')) {
        zip.file(`abis/${p}`, fs.readFileSync(item))
      }
    })
  }

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
}
