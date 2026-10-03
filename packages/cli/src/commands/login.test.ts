import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getAuthConfig, validateAuthConfig, type AuthConfig } from '../config.js'
import { buildAuthURL } from './login.js'
import { startServer } from './login-server.js'

const origin = 'https://app.example.test'
const config: AuthConfig = {
  clientId: 'native-cli',
  audience: origin + '/api/v1',
  redirectUri: origin + '/redirect/sdk',
  authorizationEndpoint: origin + '/login',
  tokenEndpoint: 'https://login.example.test/oidc/token',
  resourceParameter: 'resource',
  scope: 'openid profile'
}

test('discovery follows server configuration across issuer changes and fails closed on outages', async () => {
  const originalFetch = globalThis.fetch
  try {
    for (const tokenEndpoint of [config.tokenEndpoint, 'https://auth.example.test/oidc/token']) {
      globalThis.fetch = async (input, init) => {
        assert.equal(String(input), origin + '/api/cli/auth')
        assert.equal(init?.redirect, 'error')
        return Response.json({ ...config, tokenEndpoint })
      }
      const actual = await getAuthConfig(origin)
      assert.equal(actual.tokenEndpoint, tokenEndpoint)
      const authorize = buildAuthURL(actual, 'challenge', 'state')
      assert.equal(authorize.searchParams.get('resource'), config.audience)
      assert.equal(authorize.searchParams.get('state'), 'state')
      assert.equal(authorize.searchParams.get('code_challenge_method'), 'S256')
    }
    globalThis.fetch = async () => new Response(null, { status: 404 })
    const legacy = await getAuthConfig('https://app.sentio.xyz')
    assert.equal(legacy.tokenEndpoint, 'https://auth.sentio.xyz/oauth/token')
    assert.equal(buildAuthURL(legacy, 'challenge', 'state').searchParams.get('audience'), legacy.audience)
    globalThis.fetch = async () => new Response(null, { status: 503 })
    await assert.rejects(getAuthConfig('https://app.sentio.xyz'), /503/)
    globalThis.fetch = async () => {
      throw new Error('offline')
    }
    await assert.rejects(getAuthConfig('https://app.sentio.xyz'), /offline/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('discovery rejects insecure endpoints and a callback owned by another origin', () => {
  assert.throws(() => validateAuthConfig({ ...config, tokenEndpoint: 'http://remote.example/token' }, origin))
  assert.throws(() => validateAuthConfig({ ...config, redirectUri: 'https://other.example/callback' }, origin))
  assert.throws(() => validateAuthConfig({ ...config, clientId: '' }, origin))
})

test('loopback callback rejects wrong state, handles cancellation, and releases its listener', async () => {
  let port = 0
  await assert.rejects(
    startServer({
      serverPort: 0,
      sentioHost: origin,
      state: 'expected',
      codeVerifier: 'verifier',
      authConfig: config,
      onReady: async (actualPort) => {
        port = actualPort
        const callback = `http://127.0.0.1:${port}/callback`
        assert.equal((await fetch(callback + '?state=wrong&code=unused')).status, 400)
        assert.equal((await fetch(callback + '?state=expected&error=access_denied')).status, 400)
      }
    }),
    /Authorization was not completed/
  )
  await assert.rejects(fetch(`http://127.0.0.1:${port}/callback`))
})
