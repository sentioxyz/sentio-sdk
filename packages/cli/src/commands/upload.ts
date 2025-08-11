import { Command } from 'commander'
import { loadProcessorConfig, overrideConfigWithOptions, YamlProjectConfig } from '../config.js'
import fs from 'fs'
import { URL } from 'url'
import fetch from 'node-fetch'
import { buildProcessor } from './build.js'
import chalk from 'chalk'
import path from 'path'
import { ReadKey } from '../key.js'
import { createHash } from 'crypto'
import { CommonExecOptions, execFileSync } from 'child_process'
import { getCliVersion, getSdkVersion } from '../utils.js'
import readline from 'readline'
import JSZip from 'jszip'
import { UserInfo } from '../../../protos/lib/service/common/protos/common.js'

export function createUploadCommand() {
  return new Command('upload')
    .description('Upload processor to Sentio')
    .option('--owner <owner>', '(Optional) Override Project owner')
    .option('--name <name>', '(Optional) Override Project name')
    .option<number>(
      '--continue-from <version>',
      '(Optional) Continue processing data from the specific processor version which will keeping the old data from previous version and will STOP that version IMMEDIATELY.',
      parseInt
    )
    .option('--debug', '(Optional) Run driver in debug mode')
    .option('-y --silent-overwrite', '(Optional) Create project or upload new version without confirmation')
    .option('--skip-build', 'Skip build & pack file before uploading')
    .option('--skip-gen', 'Skip code generation.')
    .option('--skip-deps', 'Skip dependency enforce.')
    .option('--example', 'Generate example usage of the processor.')
    .option('--api-key <key>', '(Optional) Manually provide API key rather than use saved credential')
    .option('--token <token>', '(Optional) Manually provide token rather than use saved credential')
    .option('--host <host>', '(Optional) Override Sentio Host name')
    .action(async (options, command) => {
      const processorConfig = loadProcessorConfig()
      overrideConfigWithOptions(processorConfig, options)
      await runUploadInternal(processorConfig, options)
    })
}

async function runUploadInternal(processorConfig: YamlProjectConfig, options: any) {
  console.log(processorConfig)

  const uploadAuth: Auth = {}

  let apiKey = ReadKey(processorConfig.host)
  if (options.apiKey) {
    apiKey = options.apiKey
  }
  if (apiKey) {
    uploadAuth['api-key'] = apiKey
  } else if (options.token) {
    uploadAuth.authorization = 'Bearer ' + options.token
  } else {
    const isProd = processorConfig.host === 'https://app.sentio.xyz'
    const cmd = isProd ? 'sentio login' : 'sentio login --host=' + processorConfig.host
    console.error(chalk.red('No Credential found for', processorConfig.host, '. Please run `' + cmd + '`.'))
    process.exit(1)
  }

  if (!options.skipBuild) {
    await buildProcessor(false, options)
  }

  if (!processorConfig.project.includes('/')) {
    const res = await getMe(processorConfig.host, uploadAuth)
    const me = (await res.json()) as UserInfo
    processorConfig.project = `${me.username}/${processorConfig.project}`
  }

  const continueFrom = options.continueFrom
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

async function updateVariables(projectId: string, options: YamlProjectConfig, auth: Auth) {
  const url = new URL(`/api/v1/projects/${projectId}/variables`, options.host)
  return fetch(url.href, {
    method: 'POST',
    headers: {
      ...auth
    },
    body: JSON.stringify({
      projectId,
      variables: options.variables
    })
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
    console.error(chalk.red('File not existed ', PROCESSOR_FILE, "don't use --skip-build"))
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
    const data = (await res.json()) as { processors: { version: number; versionState: string }[] }
    const found = data?.processors?.find(
      (x) => x.version == continueFrom && (x.versionState == 'ACTIVE' || x.versionState == 'PENDING')
    )
    if (found) {
      if (!options.silentOverwrite) {
        const confirmed = await confirm(`Continue from version ${continueFrom}?`)
        if (!confirmed) {
          process.exit(0)
        }
      }
    } else {
      const latest = Math.max(...data.processors?.map((x) => x?.version))
      console.error(
        chalk.red(
          `Failed to find existed version ${continueFrom} in ${options.project}` +
            (latest ? `, latest is ${latest}` : '')
        )
      )
      process.exit(0)
    }
  }

  let triedCount = 0
  const upload = async () => {
    options.variables = options.variables || []
    for (const v of options.variables) {
      if (v.key || '' == '') {
        console.error(chalk.red("Variable key can't be empty"))
        return
      }
      if (v.value || '' == '') {
        console.error(chalk.red("Variable value can't be empty"))
        return
      }
    }

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
      const res = await initUploadResRaw.json()
      console.error(chalk.red(initUploadResRaw.status, (res as { message: string }).message))
      if ([404, 500].includes(initUploadResRaw.status)) {
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
      projectId: string
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
    if (options.variables.length > 0) {
      const ret = await updateVariables(initUploadRes.projectId, options, auth)
      if (!ret.ok) {
        console.error(chalk.red('Update variables failed'))
        console.error(chalk.red(((await ret.json()) as { message: string }).message))
        return
      }
    }
    const uploadUrl = initUploadRes.url

    // do actual uploading
    const zip = new JSZip()
    zip.file('lib.js', fs.readFileSync(PROCESSOR_FILE))
    const data = await zip.generateAsync({ type: 'blob' })
    const uploadResRaw = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': data.size.toString()
      },
      body: data
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
  const url = new URL(`/api/v1/processors/${projectSlug}/status?version=ALL`, host)
  return fetch(url.href, {
    headers: {
      ...auth
    }
  })
}

async function getMe(host: string, auth: Auth) {
  const url = new URL(`/api/v1/users`, host)
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
  const data = await zip.generateAsync({ type: 'blob' })
  const uploadResRaw = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': data.size.toString()
    },
    body: data
  })
  if (!uploadResRaw.ok) {
    console.error(chalk.red('Failed to upload'))
    throw uploadResRaw.text()
  }
}
