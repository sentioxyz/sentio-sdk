import { execSync } from 'child_process'
import { createHash } from 'crypto'
import fs from 'fs'
import readline from 'readline'
import { SentioProjectConfig } from './config'
import { ReadKey } from './key'
import path from 'path'
import chalk from 'chalk'
import { buildProcessor } from './build'
import fetch from 'node-fetch'
import { getSdkVersion } from './utils'
import { URL } from 'url'

async function createProject(options: SentioProjectConfig, apiKey: string) {
  const url = new URL('/api/v1/projects', options.host)
  const [ownerName, slug] = options.project.includes('/') ? options.project.split('/') : [undefined, options.project]
  return fetch(url, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
    },
    body: JSON.stringify({ slug, ownerName, visibility: 'PRIVATE' }),
  })
}

export async function uploadFile(options: SentioProjectConfig, apiKeyOverride: string) {
  if (options.build) {
    await buildProcessor(false)
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
      console.error(chalk.red('Failed to get upload url'))
      console.error(chalk.red((await initUploadResRaw.json()).message))

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
              console.error(chalk.red((await res.json()).message))
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
    const initUploadRes = await initUploadResRaw.json()
    const uploadUrl = initUploadRes['url'] as string

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
    const { projectFullSlug, version } = await finishUploadResRaw.json()
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
  return fetch(initUploadUrl, {
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
  return fetch(finishUploadUrl, {
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
