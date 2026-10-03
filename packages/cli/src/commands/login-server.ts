import express from 'express'
import { getFinalizedHost, type AuthConfig } from '../config.js'
import url from 'url'
import { getApiUrl, getCliVersion } from '../utils.js'
import { WriteLoginCredentials } from '../key.js'
import chalk from 'chalk'
import http from 'http'
import os from 'os'
import * as crypto from 'crypto'

interface AuthParams {
  serverPort: number
  sentioHost: string
  codeVerifier: string
  state: string
  authConfig: AuthConfig
  onReady: (port: number) => Promise<void>
  timeoutMs?: number
}

export function startServer(params: AuthParams): Promise<void> {
  return new Promise((resolve, reject) => {
    const app = express()
    let server: http.Server
    let redeeming = false
    let settled = false
    const controller = new AbortController()
    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      controller.abort()
      clearTimeout(timeout)
      process.off('SIGINT', interrupted)
      server.close()
      server.closeAllConnections()
      if (error) reject(error)
      else resolve()
    }
    const interrupted = () => finish(new Error('Login cancelled'))
    const timeout = setTimeout(
      () => finish(new Error('Login timed out. Run login again.')),
      params.timeoutMs ?? 5 * 60_000
    )
    process.once('SIGINT', interrupted)
    app.get('/callback', async (req, res) => {
      res.setHeader('Cache-Control', 'no-store')
      if (typeof req.query.state !== 'string' || req.query.state !== params.state) {
        res.status(400).end('Invalid authorization state')
        return
      }
      if (redeeming) {
        res.status(409).end('Authorization already in progress')
        return
      }
      redeeming = true
      try {
        if (req.query.error) throw new Error('Authorization was not completed')
        if (typeof req.query.code !== 'string' || !req.query.code) throw new Error('Missing authorization code')
        const username = await exchangeCodeAndSave(
          getFinalizedHost(params.sentioHost),
          req.query.code,
          params.codeVerifier,
          params.authConfig,
          controller.signal
        )
        console.log(chalk.green(`Login success with ${username}`))
        res.end('Login success, please go back to CLI to continue', () => finish())
      } catch (error) {
        res.status(400).end('Login failed. Check the terminal and try again.', () => finish(error as Error))
      }
    })
    server = app.listen(params.serverPort, '127.0.0.1')
    server.once('error', finish)
    server.once('listening', () => {
      const address = server.address() as { port: number }
      params.onReady(address.port).catch(finish)
    })
  })
}

/**
 * Exchanges an OAuth authorization code for an access token, verifies the account,
 * creates an API key, and saves everything to local config.
 * Returns the username on success, throws on failure.
 */
export async function exchangeCodeAndSave(
  host: string,
  code: string,
  codeVerifier: string,
  authConfig: AuthConfig,
  signal?: AbortSignal
): Promise<string> {
  // exchange token
  const tokenResRaw = await getToken(authConfig, code, codeVerifier, signal)
  if (!tokenResRaw.ok) {
    throw new Error(
      `Failed to get access token: ${tokenResRaw.status} ${tokenResRaw.statusText}, ${await tokenResRaw.text()}`
    )
  }
  const tokenRes = (await tokenResRaw.json()) as { access_token: string }
  const accessToken = tokenRes.access_token
  if (typeof accessToken !== 'string' || !accessToken) throw new Error('Missing access token')

  // check if the account is ready
  const userResRaw = await getUser(host, accessToken, signal)
  if (!userResRaw.ok) {
    if (userResRaw.status == 401) {
      throw new Error('The account does not exist, please sign up on sentio first')
    }
    throw new Error(`Failed to get user info: ${userResRaw.status} ${userResRaw.statusText}`)
  }
  const userRes = (await userResRaw.json()) as { email?: string; emailVerified: boolean }
  if (userRes.email && !userRes.emailVerified) {
    throw new Error('Your account is not verified, please verify your email first')
  }

  // create API key
  const apiKeyName = `${os.hostname()}-${crypto.randomBytes(4).toString('hex')}`
  const createApiKeyResRaw = await createApiKey(host, apiKeyName, 'sdk_generated', accessToken, signal)
  if (!createApiKeyResRaw.ok) {
    throw new Error(`Failed to create API key: ${createApiKeyResRaw.status} ${createApiKeyResRaw.statusText}`)
  }
  const { key, username } = (await createApiKeyResRaw.json()) as { key: string; username: string }
  if (typeof key !== 'string' || !key) throw new Error('Missing API key')
  signal?.throwIfAborted()
  WriteLoginCredentials(host, key, accessToken, decodeJwtExpiry(accessToken))

  return username
}

async function getToken(authConf: AuthConfig, code: string, codeVerifier: string, signal?: AbortSignal) {
  const params = new url.URLSearchParams({
    grant_type: 'authorization_code',
    client_id: authConf.clientId,
    code_verifier: codeVerifier,
    code: code,
    redirect_uri: authConf.redirectUri,
    ...(authConf.resourceParameter === 'resource' ? { resource: authConf.audience } : {})
  })
  return fetch(authConf.tokenEndpoint, {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.any([AbortSignal.timeout(20_000), ...(signal ? [signal] : [])]),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  })
}

async function createApiKey(host: string, name: string, source: string, accessToken: string, signal?: AbortSignal) {
  const createApiKeyUrl = getApiUrl('/api/v1/keys', host)
  return fetch(createApiKeyUrl.href, {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.any([AbortSignal.timeout(20_000), ...(signal ? [signal] : [])]),
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken,
      version: getCliVersion()
    },
    body: JSON.stringify({
      name: name,
      scopes: ['write:project'],
      source: source
    })
  })
}

async function getUser(host: string, accessToken: string, signal?: AbortSignal) {
  const getUserUrl = getApiUrl('/api/v1/users', host)
  return fetch(getUserUrl.href, {
    method: 'GET',
    redirect: 'error',
    signal: AbortSignal.any([AbortSignal.timeout(20_000), ...(signal ? [signal] : [])]),
    headers: {
      Authorization: 'Bearer ' + accessToken,
      version: getCliVersion()
    }
  })
}

function decodeJwtExpiry(token: string): number | undefined {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(b64, 'base64').toString()) as { exp?: unknown }
    return typeof payload.exp === 'number' ? payload.exp : undefined
  } catch {
    return undefined
  }
}
