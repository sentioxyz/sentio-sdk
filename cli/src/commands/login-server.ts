import express from 'express'
import { getAuthConfig, getFinalizedHost } from '../config'
import url, { URL } from 'url'
import fetch from 'node-fetch'
import { getCliVersion } from '../utils'
import { WriteKey } from '../key'
import chalk from 'chalk'
import http from 'http'
import os from 'os'
import * as crypto from 'crypto'

interface AuthParams {
  serverPort: number
  sentioHost: string
  codeVerifier: string
}

const app = express()

let server: http.Server
let authParams: AuthParams

export function startServer(params: AuthParams) {
  authParams = params
  server = app.listen(params.serverPort)
}

app.get('/callback', async (req, res) => {
  res.end('login success, please go back to CLI to continue')
  const host = getFinalizedHost(authParams.sentioHost)
  const code = req.query.code
  if (!code || (code as string).length == 0) {
    return
  }

  // exchange token
  const tokenResRaw = await getToken(host, code as string)
  if (!tokenResRaw.ok) {
    console.error(chalk.red('request token error, code:', tokenResRaw.status, tokenResRaw.statusText))
    return
  }
  const tokenRes = await tokenResRaw.json()
  const accessToken = tokenRes['access_token']

  // check if the account is ready
  const userResRaw = await getUser(host, accessToken)
  if (!userResRaw.ok) {
    if (userResRaw.status == 401) {
      console.error(chalk.red('please sign up on sentio first'))
    } else {
      console.error(chalk.red('get user error, code:', userResRaw.status, userResRaw.statusText))
    }
    return
  }
  const userRes = await userResRaw.json()
  if (!userRes.emailVerified) {
    console.error(chalk.red('please verify your email first'))
    return
  }

  // create API key
  const apiKeyName = `${os.hostname()}-${crypto.randomBytes(4).toString('hex')}`
  const createApiKeyResRaw = await createApiKey(host, apiKeyName, 'sdk_generated', accessToken)
  if (!createApiKeyResRaw.ok) {
    console.error(chalk.red('create api key error, code:', createApiKeyResRaw.status, createApiKeyResRaw.statusText))
    return
  }
  const createApiKeyRes = await createApiKeyResRaw.json()
  const apiKey = createApiKeyRes['key']
  WriteKey(host, apiKey)
  console.log(chalk.green('login success, new API key: ' + apiKey))

  server.close()
})

async function getToken(host: string, code: string) {
  const authConf = getAuthConfig(host)
  const params = new url.URLSearchParams({
    grant_type: 'authorization_code',
    client_id: authConf.clientId,
    code_verifier: authParams.codeVerifier,
    code: code,
    redirect_uri: `http://localhost:${authParams.serverPort}/callback`,
  })
  return fetch(`${authConf.domain}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
}

async function createApiKey(host: string, name: string, source: string, accessToken: string) {
  const createApiKeyUrl = new URL('/api/v1/keys', host)
  return fetch(createApiKeyUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      version: getCliVersion(),
    },
    body: JSON.stringify({
      name: name,
      scopes: ['write:project'],
      source: source,
    }),
  })
}

async function getUser(host: string, accessToken: string) {
  const getUserUrl = new URL('/api/v1/users', host)
  return fetch(getUserUrl, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      version: getCliVersion(),
    },
  })
}
