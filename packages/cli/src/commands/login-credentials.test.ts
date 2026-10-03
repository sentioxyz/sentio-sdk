import assert from 'node:assert/strict'
import { test } from 'node:test'
import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { setTimeout } from 'node:timers/promises'

test('failed reauthentication preserves credentials; success replaces only the selected host', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sentio-cli-login-'))
  const originalHome = os.homedir
  const originalFetch = globalThis.fetch
  os.homedir = () => directory
  try {
    const { exchangeCodeAndSave, startServer } = await import('./login-server.js')
    const host = 'https://app.example.test'
    const config = {
      clientId: 'native',
      audience: host + '/api/v1',
      redirectUri: host + '/redirect/sdk',
      authorizationEndpoint: host + '/login',
      tokenEndpoint: 'https://login.example.test/oidc/token',
      resourceParameter: 'resource' as const,
      scope: 'openid profile'
    }
    const file = path.join(directory, '.sentio/config.json')
    const previous = {
      [host]: { api_keys: 'existing-key', access_token: 'old-token', access_token_expires_at: 1 },
      'https://other.example.test': { api_keys: 'other-key' }
    }
    fs.mkdirSync(path.dirname(file))
    fs.writeFileSync(file, JSON.stringify(previous))
    const before = fs.readFileSync(file, 'utf8')
    globalThis.fetch = async () => Response.json({ error: 'invalid_grant' }, { status: 400 })
    await assert.rejects(exchangeCodeAndSave(host, 'invalid', 'verifier', config), /Failed to get access token/)
    assert.equal(fs.readFileSync(file, 'utf8'), before)

    const token = `header.${Buffer.from(JSON.stringify({ exp: 2000000000 })).toString('base64url')}.signature`
    const calls: string[] = []
    globalThis.fetch = async (input, init) => {
      const url = String(input)
      calls.push(url)
      if (url === config.tokenEndpoint) {
        const body = new URLSearchParams(String(init?.body))
        assert.equal(body.get('client_id'), config.clientId)
        assert.equal(body.get('resource'), config.audience)
        assert.equal(body.get('code_verifier'), 'verifier')
        return Response.json({ access_token: token })
      }
      if (url === host + '/api/v1/users') return Response.json({ email: '', emailVerified: false })
      assert.equal(url, host + '/api/v1/keys')
      return Response.json({ key: 'new-key', username: 'native-user' })
    }
    assert.equal(await exchangeCodeAndSave(host, 'valid', 'verifier', config), 'native-user')
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'))
    assert.deepEqual(saved[host], { api_keys: 'new-key', access_token: token, access_token_expires_at: 2000000000 })
    assert.deepEqual(saved['https://other.example.test'], previous['https://other.example.test'])
    assert.equal(calls.length, 3, 'must reuse this attempt config, not refetch it during code exchange')
    assert.equal(fs.statSync(file).mode & 0o777, 0o600)

    const exchangeFetch = globalThis.fetch
    let releaseToken!: () => void
    let tokenStarted!: () => void
    const pendingToken = new Promise<void>((resolve) => {
      releaseToken = resolve
    })
    const exchanging = new Promise<void>((resolve) => {
      tokenStarted = resolve
    })
    globalThis.fetch = async (input, init) => {
      if (String(input) === config.tokenEndpoint) {
        tokenStarted()
        await pendingToken
      }
      return exchangeFetch(input, init)
    }
    await startServer({
      serverPort: 0,
      sentioHost: host,
      state: 'expected',
      codeVerifier: 'verifier',
      authConfig: config,
      timeoutMs: 1000,
      onReady: async (port) => {
        const request = http.get(`http://127.0.0.1:${port}/callback?state=expected&code=valid`)
        request.on('error', () => {})
        await exchanging
        request.destroy()
        await setTimeout(20)
        releaseToken()
      }
    })
    assert.equal(JSON.parse(fs.readFileSync(file, 'utf8'))[host].api_keys, 'new-key')

    // Chrome can abort its first navigation and retry while token exchange is
    // pending. Every live callback must receive success from one redemption.
    let releaseRetryToken!: () => void
    let retryTokenStarted!: () => void
    const retryPending = new Promise<void>((resolve) => {
      releaseRetryToken = resolve
    })
    const retryExchanging = new Promise<void>((resolve) => {
      retryTokenStarted = resolve
    })
    const beforeRetry = calls.length
    globalThis.fetch = async (input, init) => {
      if (String(input) === config.tokenEndpoint) {
        retryTokenStarted()
        await retryPending
      }
      return exchangeFetch(input, init)
    }
    const responseBodies: Promise<string>[] = []
    await startServer({
      serverPort: 0,
      sentioHost: host,
      state: 'expected',
      codeVerifier: 'verifier',
      authConfig: config,
      timeoutMs: 1000,
      onReady: async (port) => {
        const callback = `http://127.0.0.1:${port}/callback?state=expected&code=valid`
        const first = http.get(callback)
        first.on('error', () => {})
        await retryExchanging
        first.destroy()
        for (let i = 0; i < 2; i++) {
          responseBodies.push(
            new Promise<string>((resolve, reject) => {
              http
                .get(callback, (res) => {
                  let body = ''
                  res.on('data', (chunk) => {
                    body += chunk
                  })
                  res.on('end', () => {
                    if (res.statusCode !== 200) reject(new Error(`Callback status ${res.statusCode}`))
                    else resolve(body)
                  })
                  res.on('error', reject)
                })
                .on('error', reject)
            })
          )
        }
        await setTimeout(20)
        releaseRetryToken()
      }
    })
    for (const body of await Promise.all(responseBodies)) {
      assert.equal(body, 'Login success, please go back to CLI to continue')
    }
    assert.equal(calls.length - beforeRetry, 3, 'retries must redeem one code and create one API key')
  } finally {
    os.homedir = originalHome
    globalThis.fetch = originalFetch
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
