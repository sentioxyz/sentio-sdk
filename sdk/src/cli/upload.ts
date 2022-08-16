import FormData from 'form-data'
import fs from 'fs'
import { SentioProjectConfig } from './config'
import { ReadKey } from './key'
import path from 'path'
import chalk from 'chalk'
import { buildProcessor } from './build'
import fetch from 'node-fetch'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../../package.json')

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
  } else {
    const stat = fs.statSync(PROCESSOR_FILE)
    console.log('Packed processor file size', Math.floor(stat.size / 1024) + 'K, last modified', stat.mtime)
  }
  const data = new FormData()
  data.append('attachment', fs.createReadStream(PROCESSOR_FILE))

  url.pathname = '/api/v1/processors'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      project: options.project,
      version: packageJson.version,
    },
    body: data,
  })

  if (res.ok) {
    console.log(chalk.green('Upload success'))
  } else {
    console.error(chalk.red('Upload Failed'))
    console.error(chalk.red(await res.text()))
  }
}
