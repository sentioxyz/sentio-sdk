import { Command, InvalidArgumentError } from '@commander-js/extra-typings'
import { loadProcessorConfig, overrideConfigWithOptions, YamlProjectConfig } from '../config.js'
import fs from 'fs'
import fetch from 'node-fetch'
import { buildProcessor } from './build.js'
import chalk from 'chalk'
import path from 'path'
import { ReadKey } from '../key.js'
import { createHash } from 'crypto'
import { CommonExecOptions, execFileSync } from 'child_process'
import { getApiUrl, getSdkVersion } from '../utils.js'
import readline from 'readline'
import JSZip from 'jszip'
import { UserInfo } from '../../../protos/lib/service/common/protos/common.js'
import { CommandOptionsType } from './types.js'
import { Auth, DefaultBatchUploader, WalrusBatchUploader } from '../uploader.js'
export { type Auth } from '../uploader.js'

function myParseInt(value: string, dummyPrevious: number): number {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10)
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.')
  }
  return parsedValue
}

export function createUploadCommand() {
  return new Command('upload')
    .description('Upload processor to Sentio')
    .option('--owner <owner>', '(Optional) Override Project owner')
    .option('--name <name>', '(Optional) Override Project name')
    .option(
      '--continue-from <version>',
      '(Optional) Continue processing data from the specific processor version which will keeping the old data from previous version and will STOP that version IMMEDIATELY.',
      myParseInt
    )
    .option(
      '--checkpoint <checkpoint...>',
      '(Optional) Checkpoint(s) to rollback to, only available with --continue-from. Format: "chain_id:block_number" or "block_number" (uses default chain). Can specify multiple checkpoints.'
    )
    .option('--debug', '(Optional) Run driver in debug mode')
    .option('-y --silent-overwrite', '(Optional) Create project or upload new version without confirmation')
    .option('--skip-build', 'Skip build & pack file before uploading')
    .option('--skip-gen', 'Skip code generation.')
    .option('--skip-deps', 'Skip dependency enforce.')
    .option('--example', 'Generate example usage of the processor.')
    .option('--walrus', 'Store file in walrus')
    .option('--path <path>', 'override project path, default to current directory')
    .option('--api-key <key>', '(Optional) Manually provide API key rather than use saved credential')
    .option('--token <token>', '(Optional) Manually provide token rather than use saved credential')
    .option('--host <host>', '(Optional) Override Sentio Host name')
    .action(async (options) => {
      const processorConfig = loadProcessorConfig(options.path)
      overrideConfigWithOptions(processorConfig, options)
      if (options.path) {
        process.chdir(options.path)
      }
      await runUploadInternal(processorConfig, options)
    })
}

function parseCheckpoints(
  checkpoints: string[] | undefined,
  continueFrom: number | undefined,
  defaultChainId?: string
): Record<string, number> | undefined {
  // Validate that checkpoint is only used with continue-from
  if (checkpoints && checkpoints.length > 0 && !continueFrom) {
    console.error(chalk.red('Error: --checkpoint can only be used with --continue-from'))
    process.exit(1)
  }

  if (!checkpoints || checkpoints.length === 0) {
    return undefined
  }

  const rollbackMap: Record<string, number> = {}

  for (const checkpoint of checkpoints) {
    const parts = checkpoint.split(':')

    if (parts.length === 1) {
      // Format: "block_number" - use default chain
      if (!defaultChainId) {
        console.error(
          chalk.red(
            `Error: Checkpoint "${checkpoint}" does not specify chain_id, and no default chain found in configuration`
          )
        )
        process.exit(1)
      }
      const blockNumber = parseInt(parts[0], 10)
      if (isNaN(blockNumber)) {
        console.error(chalk.red(`Error: Invalid block number in checkpoint "${checkpoint}"`))
        process.exit(1)
      }
      rollbackMap[defaultChainId] = blockNumber
    } else if (parts.length === 2) {
      // Format: "chain_id:block_number"
      const [chainId, blockStr] = parts
      const blockNumber = parseInt(blockStr, 10)
      if (isNaN(blockNumber)) {
        console.error(chalk.red(`Error: Invalid block number in checkpoint "${checkpoint}"`))
        process.exit(1)
      }
      rollbackMap[chainId] = blockNumber
    } else {
      console.error(
        chalk.red(
          `Error: Invalid checkpoint format "${checkpoint}". Expected "chain_id:block_number" or "block_number"`
        )
      )
      process.exit(1)
    }
  }

  return rollbackMap
}

async function runUploadInternal(
  processorConfig: YamlProjectConfig,
  options: CommandOptionsType<typeof createUploadCommand>
) {
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

  return uploadFile(processorConfig, uploadAuth, options)
}

async function createProject(options: YamlProjectConfig, auth: Auth, type?: string) {
  const url = getApiUrl('/api/v1/projects', options.host)
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
  const url = getApiUrl(`/api/v1/projects/${projectId}/variables`, options.host)
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

export async function createProjectPrompt(
  options: YamlProjectConfig,
  auth: Auth,
  type?: string
): Promise<string | undefined> {
  const create = async () => {
    const res = await createProject(options, auth, type)
    if (!res.ok) {
      console.error(chalk.red('Create Project Failed'))
      console.error(chalk.red(((await res.json()) as { message: string }).message))
      return undefined
    }
    console.log(chalk.green('Project created'))
    return ((await res.json()) as any).id
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
    return undefined
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

async function checkOrCreateProject(options: YamlProjectConfig, auth: Auth) {
  const [owner, slug] = options.project.split('/')
  const url = getApiUrl(`/api/v1/project/${owner}/${slug}`, options.host)

  const response = await fetch(url.href, {
    method: 'GET',
    headers: {
      ...auth
    }
  })

  if (response.status === 404) {
    const projectId = await createProjectPrompt(options, auth, options.type)
    if (!projectId) {
      console.error(chalk.red('Project creation cancelled'))
      process.exit(1)
    }
    return projectId
  } else if (!response.ok) {
    console.error(chalk.red(`Failed to check project: ${response.status} ${response.statusText}`))
    process.exit(1)
  }

  return ((await response.json()) as any)?.project?.id
}

export async function uploadFile(
  config: YamlProjectConfig,
  auth: Auth,
  options: CommandOptionsType<typeof createUploadCommand>
) {
  console.log(chalk.blue('Prepare to upload'))
  const continueFrom = options.continueFrom

  // Get default chain ID from the first contract if available
  const defaultChainId = config.contracts && config.contracts.length > 0 ? String(config.contracts[0].chain) : undefined

  // Parse checkpoint arguments into rollback map
  const rollbackMap = parseCheckpoints(options.checkpoint, continueFrom, defaultChainId)

  const processorFile = path.join(process.cwd(), 'dist/lib.js')

  if (!fs.existsSync(processorFile)) {
    console.error(chalk.red('File not existed ', processorFile, "don't use --skip-build"))
    process.exit(1)
  }

  const projectId = await checkOrCreateProject(config, auth)

  const stat = fs.statSync(processorFile)
  console.log('Packed processor file size', Math.floor(stat.size / 1024) + 'K, last modified', stat.mtime)

  if (continueFrom) {
    const res = await getProcessorStatus(config.host, auth, config.project)
    const data = (await res.json()) as {
      processors: {
        version: number
        versionState: string
        sdkVersion: string
      }[]
    }
    const found = data?.processors?.find(
      (x) => x.version == continueFrom && (x.versionState == 'ACTIVE' || x.versionState == 'PENDING')
    )
    if (found) {
      const currentSdkVersion = getSdkVersion()
      if (found.sdkVersion.split('.')[0] != currentSdkVersion.split('.')[0]) {
        console.error(
          chalk.red(
            `Failed to continue from version ${continueFrom}, because it is running on SDK v${found.sdkVersion}, but current SDK is v${currentSdkVersion}`
          )
        )
        process.exit(0)
      }

      if (!config.silentOverwrite) {
        const confirmed = await confirm(`Continue from version ${continueFrom}?`)
        if (!confirmed) {
          process.exit(0)
        }
      }
    } else {
      const latest = Math.max(...data.processors?.map((x) => x?.version))
      console.error(
        chalk.red(
          `Failed to find existed version ${continueFrom} in ${config.project}` +
            (latest ? `, latest is ${latest}` : '')
        )
      )
      process.exit(0)
    }
  }

  let triedCount = 0
  const upload = async () => {
    config.variables = config.variables || []
    for (const v of config.variables) {
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
    console.log(chalk.blue(triedCount > 1 ? 'Retry uploading' : 'Uploading'))

    try {
      const sourceBuffer = await createSourceZip()
      // Read processor file
      const codeBuffer = fs.readFileSync(processorFile)

      // Create uploader
      const uploader = options.walrus ? new WalrusBatchUploader(config, auth) : new DefaultBatchUploader(config, auth)

      // Handle variables update if needed
      if (config.variables && config.variables.length > 0) {
        const ret = await updateVariables(projectId, config, auth)
        if (!ret.ok) {
          console.error(chalk.red('Update variables failed'))
          console.error(chalk.red(((await ret.json()) as { message: string }).message))
          return
        }
      }

      // Upload files
      const result = await uploader.upload(
        { source: sourceBuffer, code: codeBuffer },
        commitSha,
        gitUrl,
        config.debug || options.debug,
        continueFrom,
        config.networkOverrides,
        rollbackMap
      )

      console.log(chalk.green('Upload success: '))
      const codeHash = createHash('sha256').update(codeBuffer).digest('hex')
      console.log('\t', chalk.blue('sha256:'), codeHash)
      if (commitSha) {
        console.log('\t', chalk.blue('Git commit SHA:'), commitSha)
      }
      console.log(
        '\t',
        chalk.blue('Check status:'),
        `${config.host}/${result.projectFullSlug}/datasource/${result.processorId}`
      )
      console.log('\t', chalk.blue('Version:'), result.version)
    } catch (e) {
      throw e
    }
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
  const url = getApiUrl(`/api/v1/processors/${projectSlug}/status?version=ALL`, host)
  return fetch(url.href, {
    headers: {
      ...auth
    }
  })
}

async function getMe(host: string, auth: Auth) {
  const url = getApiUrl(`/api/v1/users`, host)
  return fetch(url.href, {
    headers: {
      ...auth
    }
  })
}

async function createSourceZip() {
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
  return await zip.generateAsync({ type: 'nodebuffer' })
}
