import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import { finalizeHost, FinalizeProjectName, SentioProjectConfig } from '../config.js'
import { URL } from 'url'
import fetch from 'node-fetch'
import { buildProcessor } from './build.js'
import chalk from 'chalk'
import path from 'path'
import { ReadKey } from '../key.js'
import fs from 'fs'
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { getSdkVersion } from '../utils.js'
import readline from 'readline'
import * as process from 'process'

export async function runUpload(processorConfig: SentioProjectConfig, argv: string[]) {
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
    {
      name: 'debug',
      description: '(Optional) Run driver in debug mode, default false',
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
    process.exit(0)
  }

  if (options.host) {
    processorConfig.host = options.host
  }
  if (options.nobuild) {
    processorConfig.build = false
  }
  if (options.debug) {
    processorConfig.debug = true
  }
  finalizeHost(processorConfig)
  FinalizeProjectName(processorConfig, options.owner)
  console.log(processorConfig)

  let apiOverride = undefined
  if (options['api-key']) {
    apiOverride = options['api-key']
  }
  return uploadFile(processorConfig, apiOverride, argv)
}

async function createProject(options: SentioProjectConfig, apiKey: string) {
  const url = new URL('/api/v1/projects', options.host)
  const [ownerName, slug] = options.project.includes('/') ? options.project.split('/') : [undefined, options.project]
  return fetch(url.href, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
    },
    body: JSON.stringify({ slug, ownerName, visibility: 'PRIVATE' }),
  })
}

export async function uploadFile(options: SentioProjectConfig, apiKeyOverride: string, argv: string[]) {
  if (options.build) {
    await buildProcessor(false, argv)
  }

  console.log(chalk.blue('Prepare to upload'))

  const PROCESSOR_FILE = path.join(process.cwd(), 'dist/lib.js')

  const apiKey = apiKeyOverride || ReadKey(options.host)

  const isProd = options.host === 'https://app.sentio.xyz'
  if (!apiKey) {
    const cmd = isProd ? 'sentio login' : 'sentio login --host=' + options.host
    console.error(chalk.red('No Credential found for', options.host, '. Please run `' + cmd + '`.'))
    process.exit(1)
  }

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

  let triedCount = 0
  const upload = async () => {
    let commitSha = ''
    let gitUrl = ''
    const sha256 = digest
    try {
      commitSha = execSync('git rev-parse HEAD').toString().trim()
    } catch (e) {
      chalk.yellow(e)
    }
    try {
      gitUrl = execSync('git remote get-url origin').toString().trim()
    } catch (e) {
      // skip errors
    }
    console.log(chalk.blue(triedCount > 1 ? 'Retry uploading' : 'Uploading'))

    // get gcs upload url
    const initUploadResRaw = await initUpload(options.host, apiKey, options.project, getSdkVersion())
    if (!initUploadResRaw.ok) {
      // console.error(chalk.red('Failed to get upload url'))
      console.error(chalk.red(((await initUploadResRaw.json()) as { message: string }).message))

      if (initUploadResRaw.status === 404) {
        // create project if not exist
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        })
        const prompt = async () => {
          const answer: string = await new Promise((resolve) =>
            rl.question(`Do you want to create it and continue the uploading process? (yes/no) `, resolve)
          )
          if (['y', 'yes'].includes(answer.toLowerCase())) {
            rl.close()
            const res = await createProject(options, apiKey)
            if (!res.ok) {
              console.error(chalk.red('Create Project Failed'))
              console.error(chalk.red(((await res.json()) as { message: string }).message))
              return
            }
            console.log(chalk.green('Project created'))
            await upload()
          } else if (['n', 'no'].includes(answer.toLowerCase())) {
            rl.close()
          } else {
            await prompt()
          }
        }
        await prompt()
      }
      return
    }
    const initUploadRes = (await initUploadResRaw.json()) as { url: string }
    const uploadUrl = initUploadRes.url

    // do actual uploading
    const file = fs.createReadStream(PROCESSOR_FILE)
    const uploadResRaw = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: file,
    })
    if (!uploadResRaw.ok) {
      console.error(chalk.red('Failed to upload'))
      console.error(chalk.red(await uploadResRaw.text()))
      return
    }

    // finish uploading
    const finishUploadResRaw = await finishUpload(
      options.host,
      apiKey,
      options.project,
      getSdkVersion(),
      sha256,
      commitSha,
      gitUrl,
      options.debug
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
    const { projectFullSlug, version } = (await finishUploadResRaw.json()) as {
      projectFullSlug: string
      version: string
    }
    console.log('\t', chalk.blue('Check status:'), `${options.host}/${projectFullSlug}/datasource`)
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

async function initUpload(host: string, apiKey: string, projectSlug: string, sdkVersion: string) {
  const initUploadUrl = new URL(`/api/v1/processors/init_upload`, host)
  return fetch(initUploadUrl.href, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
    },
    body: JSON.stringify({
      project_slug: projectSlug,
      sdk_version: sdkVersion,
    }),
  })
}

async function finishUpload(
  host: string,
  apiKey: string,
  projectSlug: string,
  sdkVersion: string,
  sha256: string,
  commitSha: string,
  gitUrl: string,
  debug: boolean
) {
  const finishUploadUrl = new URL(`/api/v1/processors/finish_upload`, host)
  return fetch(finishUploadUrl.href, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
    },
    body: JSON.stringify({
      project_slug: projectSlug,
      sdk_version: sdkVersion,
      sha256: sha256,
      commit_sha: commitSha,
      git_url: gitUrl,
      debug: debug,
    }),
  })
}
