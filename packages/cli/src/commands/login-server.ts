import express from 'express'
import { getAuthConfig, getFinalizedHost } from '../config.js'
import url from 'url'
import fetch from 'node-fetch'
import { getApiUrl, getCliVersion } from '../utils.js'
import { WriteKey, WriteAccessToken } from '../key.js'
import chalk from 'chalk'
import http from 'http'
import os from 'os'
import * as crypto from 'crypto'

interface AuthParams {
  serverPort: number
  sentioHost: string
  codeVerifier: string
  /** Called on successful login instead of process.exit() when provided. */
  onSuccess?: () => void
  /** Called on login failure instead of process.exit() when provided. */
  onFailure?: (err: Error) => void
}

const app = express()

let server: http.Server
let authParams: AuthParams

export function startServer(params: AuthParams) {
  authParams = params
  server = app.listen(params.serverPort)
}

app.get('/callback', async (req, res) => {
  const fail = function (message: string) {
    console.error(chalk.red(message))
    res.end(message)
    server.close()
    server.closeAllConnections()
    if (authParams.onFailure) {
      authParams.onFailure(new Error(message))
    } else {
      setTimeout(() => process.exit(), 1000)
    }
  }

  const host = getFinalizedHost(authParams.sentioHost)
  const code = req.query.code
  if (!code || (code as string).length == 0) {
    fail('Failed to get authorization code')
    return
  }

  try {
    const username = await exchangeCodeAndSave(host, code as string, authParams.codeVerifier)
    res.end('Login success, please go back to CLI to continue')
    console.log(chalk.green(`Login success with ${username}`))
  } catch (e) {
    fail((e as Error).message)
    return
  }

  server.close()
  server.closeAllConnections()
  if (authParams.onSuccess) {
    authParams.onSuccess()
  } else {
    setTimeout(() => process.exit(), 1000)
  }
})

/**
 * Exchanges an OAuth authorization code for an access token, verifies the account,
 * creates an API key, and saves everything to local config.
 * Returns the username on success, throws on failure.
 */
export async function exchangeCodeAndSave(host: string, code: string, codeVerifier: string): Promise<string> {
  // exchange token
  const tokenResRaw = await getToken(host, code, codeVerifier)
  if (!tokenResRaw.ok) {
    throw new Error(
      `Failed to get access token: ${tokenResRaw.status} ${tokenResRaw.statusText}, ${await tokenResRaw.text()}`
    )
  }
  const tokenRes = (await tokenResRaw.json()) as { access_token: string }
  const accessToken = tokenRes.access_token

  // check if the account is ready
  const userResRaw = await getUser(host, accessToken)
  if (!userResRaw.ok) {
    if (userResRaw.status == 401) {
      throw new Error('The account does not exist, please sign up on sentio first')
    }
    throw new Error(`Failed to get user info: ${userResRaw.status} ${userResRaw.statusText}`)
  }
  const userRes = (await userResRaw.json()) as { emailVerified: boolean }
  if (!userRes.emailVerified) {
    throw new Error('Your account is not verified, please verify your email first')
  }

  // create API key
  const apiKeyName = `${os.hostname()}-${crypto.randomBytes(4).toString('hex')}`
  const createApiKeyResRaw = await createApiKey(host, apiKeyName, 'sdk_generated', accessToken)
  if (!createApiKeyResRaw.ok) {
    throw new Error(`Failed to create API key: ${createApiKeyResRaw.status} ${createApiKeyResRaw.statusText}`)
  }
  const { key, username } = (await createApiKeyResRaw.json()) as { key: string; username: string }
  WriteKey(host, key)

  // store access token with expiry for commands that require admin permissions
  const expiresAt = decodeJwtExpiry(accessToken)
  if (expiresAt !== undefined) {
    WriteAccessToken(host, accessToken, expiresAt)
  }

  return username
}

async function getToken(host: string, code: string, codeVerifier: string) {
  const authConf = getAuthConfig(host)
  const params = new url.URLSearchParams({
    grant_type: 'authorization_code',
    client_id: authConf.clientId,
    code_verifier: codeVerifier,
    code: code,
    redirect_uri: authConf.redirectUri
  })
  return fetch(`${authConf.domain}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  })
}

async function createApiKey(host: string, name: string, source: string, accessToken: string) {
  const createApiKeyUrl = getApiUrl('/api/v1/keys', host)
  return fetch(createApiKeyUrl.href, {
    method: 'POST',
    headers: {
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

async function getUser(host: string, accessToken: string) {
  const getUserUrl = getApiUrl('/api/v1/users', host)
  return fetch(getUserUrl.href, {
    method: 'GET',
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
