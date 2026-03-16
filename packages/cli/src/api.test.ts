import { afterEach, beforeEach, describe, test } from 'node:test'
import { expect } from 'chai'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { resolveProjectRef } from './api.js'

describe('api project resolution', () => {
  const originalCwd = process.cwd()
  const originalFetch = globalThis.fetch
  let tempDir = ''

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sentio-cli-project-'))
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    globalThis.fetch = originalFetch
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  test('resolveProjectRef infers owner from current auth when sentio.yaml only contains slug', async () => {
    fs.writeFileSync(path.join(tempDir, 'sentio.yaml'), 'project: coinbase\n')

    globalThis.fetch = (async (input: string | URL) => {
      const url = String(input)
      if (url === 'https://api.sentio.xyz/v1/users') {
        return new Response(JSON.stringify({ username: 'sentio' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      if (url === 'https://api.sentio.xyz/v1/project/sentio/coinbase') {
        return new Response(JSON.stringify({ project: { id: 'R2QKMeul' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      throw new Error(`Unexpected fetch URL: ${url}`)
    }) as typeof globalThis.fetch

    const project = await resolveProjectRef(
      {},
      {
        host: 'https://app.sentio.xyz',
        headers: {}
      },
      { ownerSlug: true, projectId: true }
    )

    expect(project).deep.equal({
      owner: 'sentio',
      slug: 'coinbase',
      projectId: 'R2QKMeul'
    })
  })
})
