import { execSync } from 'child_process'
import { createHash } from 'crypto'
import FormData from 'form-data'
import fs from 'fs'
import { SentioProjectConfig } from './config'
import { ReadKey } from './key'
import path from 'path'
import chalk from 'chalk'
import { buildProcessor } from './build'
import fetch from 'node-fetch'
import { getCliVersion } from './utils'

export async function uploadFile(options: SentioProjectConfig, apiKeyOverride: string) {
  if (options.build) {
    await buildProcessor(false, options.targets)
  }

  console.log(chalk.blue('Uploading'))

  const PROCESSOR_FILE = path.join(process.cwd(), 'dist/lib.js')

  const url = new URL(options.host)
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

  const data = new FormData()
  data.append('attachment', fs.createReadStream(PROCESSOR_FILE))
  data.append('sha256', digest)

  let commitSha
  try {
    commitSha = execSync('git rev-parse HEAD').toString().trim()
    data.append('commitSha', commitSha)
  } catch (e) {
    chalk.yellow(e)
  }
  try {
    const gitUrl = execSync('git remote get-url origin').toString().trim()
    data.append('gitUrl', gitUrl)
  } catch (e) {
    chalk.yellow(e)
  }

  url.pathname = '/api/v1/processors'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      project: options.project,
      version: getCliVersion(),
    },
    body: data,
  })

  if (res.ok) {
    console.log(chalk.green('Upload success: '))
    console.log('\t', chalk.blue('sha256:'), digest)
    if (commitSha) {
      console.log('\t', chalk.blue('Git commit SHA:'), commitSha)
    }
    const { ProjectSlug } = await res.json()
    console.log('\t', chalk.blue('Check status:'), `${options.host}/${ProjectSlug}/datasource`)
  } else {
    console.error(chalk.red('Upload Failed'))
    console.error(chalk.red(await res.text()))
  }
}
