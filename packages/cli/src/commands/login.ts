import { Command } from '@commander-js/extra-typings'
import { getAuthConfig, getFinalizedHost, type AuthConfig } from '../config.js'
import { startServer, exchangeCodeAndSave } from './login-server.js'
import readline from 'node:readline/promises'
import url, { URL } from 'url'
import * as crypto from 'crypto'
import chalk from 'chalk'
import { WriteKey, ReadKey, ReadAccessToken, isAccessTokenExpired } from '../key.js'
import open from 'open'
import { CommandOptionsType } from './types.js'
import { getApiUrl } from '../utils.js'

const port = 20000

export function createLoginCommand() {
  return new Command('login')
    .description('Login to Sentio')
    .option('--host <host>', '(Optional) Override Sentio Host name')
    .option('--api-key <key>', '(Optional) Your API key')
    .option('--status', 'Show current login status')
    .option('--no-browser', 'Print the auth URL and accept the authorization code manually (for headless environments)')
    .action(async (options) => {
      try {
        if (options.status) await loginStatus(options)
        else await login(options)
      } catch (error) {
        console.error(chalk.red('Login failed: ' + (error as Error).message))
        process.exitCode = 1
      }
    })
}

async function loginStatus(options: CommandOptionsType<typeof createLoginCommand>) {
  const host = getFinalizedHost(options.host)
  console.log(chalk.blue('Host: ') + host)

  const apiKey = ReadKey(host)
  if (!apiKey) {
    console.log(chalk.red('Not logged in') + ' (no API key stored for this host)')
    return
  }

  console.log(chalk.green('API key: ') + apiKey.slice(0, 8) + '...')

  const tokenInfo = ReadAccessToken(host)
  if (tokenInfo) {
    const expired = isAccessTokenExpired(tokenInfo.expiresAt)
    const expiresDate = new Date(tokenInfo.expiresAt * 1000).toLocaleString()
    if (expired) {
      console.log(chalk.yellow('Access token: ') + `expired (${expiresDate})`)
    } else {
      console.log(chalk.green('Access token: ') + `valid until ${expiresDate}`)
    }
  } else {
    console.log(chalk.yellow('Access token: ') + 'none stored')
  }

  const res = await checkKey(host, apiKey)
  if (res.status === 200) {
    const { username } = (await res.json()) as { username: string }
    console.log(chalk.green('Logged in as: ') + username)
  } else {
    console.log(chalk.red('API key validation failed: ') + `${res.status} ${res.statusText}`)
  }
}

async function login(options: CommandOptionsType<typeof createLoginCommand>) {
  const host = getFinalizedHost(options.host)
  if (options.apiKey) {
    const response = await checkKey(host, options.apiKey)
    if (!response.ok) throw new Error(`API key validation failed: ${response.status}`)
    const { username } = (await response.json()) as { username: string }
    WriteKey(host, options.apiKey)
    console.log(chalk.green(`Login success with ${username}`))
    return
  }
  const attempt = await createLoginAttempt(host)
  if (options.browser === false) {
    await loginNoBrowser(host, attempt)
  } else {
    await loginInBrowser(host, attempt)
  }
}

/** Reauthenticate when a command needs an expired privileged access token. */
export async function loginInteractiveAndWait(host: string): Promise<void> {
  await loginInBrowser(host, await createLoginAttempt(host))
}

async function createLoginAttempt(host: string) {
  const conf = await getAuthConfig(host)
  const verifier = base64URLEncode(crypto.randomBytes(32))
  const state = base64URLEncode(crypto.randomBytes(32))
  return { conf, verifier, state, authURL: buildAuthURL(conf, base64URLEncode(sha256(verifier)), state) }
}

async function loginInBrowser(host: string, attempt: Awaited<ReturnType<typeof createLoginAttempt>>) {
  // Bind before opening the browser, and own the listener until success,
  // cancellation, an OAuth error or timeout. Nothing listens on external interfaces.
  await startServer({
    serverPort: port,
    sentioHost: host,
    codeVerifier: attempt.verifier,
    state: attempt.state,
    authConfig: attempt.conf,
    onReady: async () => {
      console.log('Continue your authorization in the browser')
      try {
        await open(attempt.authURL.toString())
      } catch {
        console.log('Open this URL in your browser: ' + attempt.authURL.toString())
      }
    }
  })
}

async function loginNoBrowser(host: string, attempt: Awaited<ReturnType<typeof createLoginAttempt>>) {
  console.log(chalk.blue('Open this URL in a browser to complete login:'))
  console.log(chalk.cyan(attempt.authURL.toString()))
  console.log('After signing in, paste the callback URL or its code parameter below.')
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    const input = (await rl.question('Authorization code or callback URL: ')).trim()
    if (!input) throw new Error('No code provided, login aborted.')
    let code = input
    if (/^https?:\/\//.test(input)) {
      const callback = new URL(input)
      const expected = attempt.conf.redirectUri
      if (
        ![expected, `http://localhost:${port}/callback`].includes(callback.origin + callback.pathname) ||
        callback.searchParams.get('state') !== attempt.state
      )
        throw new Error('Invalid authorization callback state or URL')
      if (callback.searchParams.has('error')) throw new Error('Authorization was not completed')
      code = callback.searchParams.get('code') ?? ''
    }
    if (!code) throw new Error('Missing authorization code')
    const username = await exchangeCodeAndSave(host, code, attempt.verifier, attempt.conf)
    console.log(chalk.green(`Login success with ${username}`))
  } finally {
    rl.close()
  }
}

export function buildAuthURL(conf: AuthConfig, challenge: string, state: string): URL {
  const authURL = new URL(conf.authorizationEndpoint)
  authURL.search = new url.URLSearchParams({
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    client_id: conf.clientId,
    redirect_uri: conf.redirectUri,
    [conf.resourceParameter]: conf.audience,
    scope: conf.scope,
    prompt: 'login',
    state
  }).toString()
  return authURL
}

function base64URLEncode(str: Buffer) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function sha256(str: string) {
  return crypto.createHash('sha256').update(str).digest()
}

async function checkKey(host: string, apiKey: string) {
  const checkApiKeyUrl = getApiUrl('/api/v1/processors/check_key', host)
  return fetch(checkApiKeyUrl.href, {
    method: 'GET',
    headers: {
      'api-key': apiKey
    }
  })
}
