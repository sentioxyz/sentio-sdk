import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import { getAuthConfig, getFinalizedHost } from '../config.js'
import { startServer } from './login-server.js'
import url, { URL } from 'url'
import * as crypto from 'crypto'
import chalk from 'chalk'
import { WriteKey } from '../key.js'
import fetch from 'node-fetch'
import open from 'open'

const port = 20000

export function runLogin(argv: string[]) {
  const optionDefinitions = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Display this usage guide.',
    },
    {
      name: 'host',
      description: '(Optional) Override Sentio Host name',
      type: String,
    },
    {
      name: 'api-key',
      type: String,
      description: '(Optional) Your API key',
    },
  ]
  const options = commandLineArgs(optionDefinitions, { argv })

  const host = getFinalizedHost(options.host)
  if (options.help) {
    const usage = commandLineUsage([
      {
        header: 'Login to Sentio',
        content: 'sentio login',
      },
      {
        header: 'Options',
        optionList: optionDefinitions,
      },
    ])
    console.log(usage)
  } else if (options['api-key']) {
    console.log(chalk.blue('login to ' + host))
    const apiKey = options['api-key']
    checkKey(host, apiKey).then((res) => {
      if (res.status == 200) {
        WriteKey(host, apiKey)
        console.log(chalk.green('login success'))
      } else {
        console.error(chalk.red('login failed, code:', res.status, res.statusText))
      }
    })
  } else {
    // https://auth0.com/docs/get-started/authentication-and-authorization-flow/call-your-api-using-the-authorization-code-flow-with-pkce
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
      prompt: 'login',
    })
    authURL.search = params.toString()

    console.log('Continue your authorization in the browser')
    open(authURL.toString()).catch((reason) => {
      console.error(chalk.red('Unable to open browser: ' + reason))
      console.error(chalk.red('Open this url in your browser: ' + authURL.toString()))
    })

    startServer({
      serverPort: port,
      sentioHost: options.host,
      codeVerifier: verifier,
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
      'api-key': apiKey,
    },
  })
}
