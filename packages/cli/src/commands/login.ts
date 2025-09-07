import { Command } from '@commander-js/extra-typings'
import { getAuthConfig, getFinalizedHost } from '../config.js'
import { startServer } from './login-server.js'
import url, { URL } from 'url'
import * as crypto from 'crypto'
import chalk from 'chalk'
import { WriteKey } from '../key.js'
import fetch from 'node-fetch'
import open from 'open'
import { CommandOptionsType } from './types.js'

const port = 20000

export function createLoginCommand() {
  return new Command('login')
    .description('Login to Sentio')
    .option('--host <host>', '(Optional) Override Sentio Host name')
    .option('--api-key <key>', '(Optional) Your API key')
    .action((options) => {
      login(options)
    })
}

function login(options: CommandOptionsType<typeof createLoginCommand>) {
  const host = getFinalizedHost(options.host)

  if (options.apiKey) {
    console.log(chalk.blue('login to ' + host))
    const apiKey = options.apiKey
    checkKey(host, apiKey).then(async (res) => {
      if (res.status == 200) {
        WriteKey(host, apiKey)
        const { username } = (await res.json()) as { username: string }
        console.log(chalk.green(`login success with ${username}`))
      } else {
        console.error(chalk.red('login failed, code:', res.status, res.statusText))
      }
    })
  } else {
    const verifier = base64URLEncode(crypto.randomBytes(32))
    const challenge = base64URLEncode(sha256(verifier))

    const conf = getAuthConfig(host)
    if (conf.domain === '') {
      console.error(chalk.red('invalid host, try login with an API key if it is a dev env'))
      return
    }
    const authURL = new URL(conf.domain + `/authorize?`)
    const params = new url.URLSearchParams({
      response_type: 'code',
      code_challenge: challenge,
      code_challenge_method: 'S256',
      client_id: conf.clientId,
      redirect_uri: conf.redirectUri,
      audience: conf.audience,
      prompt: 'login'
    })
    authURL.search = params.toString()

    console.log('Continue your authorization in the browser')
    open(authURL.toString()).catch((reason) => {
      console.error(chalk.red('Unable to open browser: ' + reason))
      console.error(chalk.red('Open this url in your browser: ' + authURL.toString()))
    })

    startServer({
      serverPort: port,
      sentioHost: options.host || '',
      codeVerifier: verifier
    })
  }
}

function base64URLEncode(str: Buffer) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function sha256(str: string) {
  return crypto.createHash('sha256').update(str).digest()
}

async function checkKey(host: string, apiKey: string) {
  const checkApiKeyUrl = new URL('/api/v1/processors/check_key', host)
  return fetch(checkApiKeyUrl.href, {
    method: 'GET',
    headers: {
      'api-key': apiKey
    }
  })
}
