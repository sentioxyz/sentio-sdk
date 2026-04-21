import { describe, test } from 'node:test'
import { expect } from 'chai'
import { execFile } from 'node:child_process'
import http from 'node:http'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

describe('sentio cli entrypoint', () => {
  test('treats top-level --version as an alias for the version command', async () => {
    const execOptions = {
      cwd: new URL('..', import.meta.url),
      env: {
        ...process.env,
        NO_COLOR: '1'
      }
    }
    const [{ stdout: flagOutput }, { stdout: commandOutput }] = await Promise.all([
      execFileAsync('pnpm', ['exec', 'tsx', 'src/index.ts', '--version'], execOptions),
      execFileAsync('pnpm', ['exec', 'tsx', 'src/index.ts', 'version'], execOptions)
    ])

    expect(flagOutput).equal(commandOutput)
  })

  test('does not treat subcommand --version values as the top-level version flag', async () => {
    const requests: string[] = []
    const server = http.createServer((req, res) => {
      requests.push(req.url ?? '')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ processors: [] }))
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))

    try {
      const address = server.address()
      if (!address || typeof address === 'string') {
        throw new Error('Expected local test server address')
      }

      await execFileAsync(
        'pnpm',
        [
          'exec',
          'tsx',
          'src/index.ts',
          'processor',
          'status',
          '--host',
          `http://127.0.0.1:${address.port}`,
          '--api-key',
          'test-key',
          '--project',
          'sentio/coinbase',
          '--version',
          'all',
          '--json'
        ],
        {
          cwd: new URL('..', import.meta.url),
          env: {
            ...process.env,
            NO_COLOR: '1'
          }
        }
      )

      expect(requests).deep.equal(['/v1/processors/sentio/coinbase/status?version=ALL'])
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })
    }
  })

  test('processor status --version <number> fetches all versions and filters client-side', async () => {
    const requests: string[] = []
    const server = http.createServer((req, res) => {
      requests.push(req.url ?? '')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          processors: [
            { version: 42, versionState: 'OBSOLETE', processorStatus: { state: 'STOPPED' } },
            { version: 43, versionState: 'ACTIVE', processorStatus: { state: 'RUNNING' } }
          ]
        })
      )
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))

    try {
      const address = server.address()
      if (!address || typeof address === 'string') {
        throw new Error('Expected local test server address')
      }

      const { stdout } = await execFileAsync(
        'pnpm',
        [
          'exec',
          'tsx',
          'src/index.ts',
          'processor',
          'status',
          '--host',
          `http://127.0.0.1:${address.port}`,
          '--api-key',
          'test-key',
          '--project',
          'sentio/coinbase',
          '--version',
          '42',
          '--json'
        ],
        {
          cwd: new URL('..', import.meta.url),
          env: {
            ...process.env,
            NO_COLOR: '1'
          }
        }
      )

      expect(requests).deep.equal(['/v1/processors/sentio/coinbase/status?version=ALL'])
      const jsonStart = stdout.indexOf('{')
      const result = JSON.parse(stdout.slice(jsonStart))
      expect(result.processors).to.have.lengthOf(1)
      expect(result.processors[0].version).equal(42)
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })
    }
  })

  test('preserves numeric subcommand --version values', async () => {
    const requests: string[] = []
    const server = http.createServer((req, res) => {
      requests.push(req.url ?? '')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ sourceFiles: [] }))
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))

    try {
      const address = server.address()
      if (!address || typeof address === 'string') {
        throw new Error('Expected local test server address')
      }

      await execFileAsync(
        'pnpm',
        [
          'exec',
          'tsx',
          'src/index.ts',
          'processor',
          'source',
          '--host',
          `http://127.0.0.1:${address.port}`,
          '--api-key',
          'test-key',
          '--project',
          'sentio/coinbase',
          '--version',
          '67'
        ],
        {
          cwd: new URL('..', import.meta.url),
          env: {
            ...process.env,
            NO_COLOR: '1'
          }
        }
      )

      expect(requests).deep.equal(['/v1/processors/sentio/coinbase/source_files?version=67'])
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })
    }
  })
})
