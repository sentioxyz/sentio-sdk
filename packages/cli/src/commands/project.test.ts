import { afterEach, beforeEach, describe, test } from 'node:test'
import { expect } from 'chai'
import { createProjectCommand } from './project.js'

describe('project command', () => {
  const originalFetch = globalThis.fetch
  const originalConsoleLog = console.log
  let logs: string[] = []

  beforeEach(() => {
    logs = []
    console.log = (...args: unknown[]) => {
      logs.push(args.map((arg) => String(arg)).join(' '))
    }
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    console.log = originalConsoleLog
  })

  test('project list --owner falls back to normalized project listing when org lookup has no embedded projects', async () => {
    globalThis.fetch = (async (input: string | URL) => {
      const url = String(input)

      if (url === 'https://api.sentio.xyz/v1/organizations?orgIdOrName=resolv') {
        return jsonResponse({
          organizations: [{ id: 'org-1', name: 'resolv', projects: [] }]
        })
      }

      if (url === 'https://api.sentio.xyz/v1/projects') {
        return jsonResponse({
          projects: [],
          sharedProjects: [],
          orgProjects: [
            {
              id: 'p-1',
              ownerName: 'resolv',
              slug: 'pendle-gho-usr-yt-base-sep25',
              type: 'SENTIO',
              visibility: 'PRIVATE',
              updatedAt: '2025-08-05T08:35:25.845Z'
            },
            {
              id: 'p-2',
              ownerName: 'other',
              slug: 'ignore-me',
              type: 'SENTIO',
              visibility: 'PRIVATE'
            }
          ]
        })
      }

      throw new Error(`Unexpected fetch URL: ${url}`)
    }) as typeof globalThis.fetch

    const command = createProjectCommand()
    await command.parseAsync(['list', '--owner', 'resolv', '--api-key', 'test-key'], { from: 'user' })

    expect(logs.join('\n')).contains('Projects (1)')
    expect(logs.join('\n')).contains(
      '- resolv/pendle-gho-usr-yt-base-sep25 [PRIVATE] updated 2025-08-05T08:35:25.845Z'
    )
  })

  test('project list keeps non-SENTIO project types in list output', async () => {
    globalThis.fetch = (async (input: string | URL) => {
      const url = String(input)

      if (url === 'https://api.sentio.xyz/v1/projects') {
        return jsonResponse({
          projects: [],
          sharedProjects: [],
          orgProjects: [
            {
              id: 'p-1',
              ownerName: 'resolv',
              slug: 'uniswap-v3-subgraph',
              type: 'SUBGRAPH',
              visibility: 'PRIVATE',
              updatedAt: '2025-08-05T08:35:25.845Z'
            }
          ]
        })
      }

      throw new Error(`Unexpected fetch URL: ${url}`)
    }) as typeof globalThis.fetch

    const command = createProjectCommand()
    await command.parseAsync(['list', '--api-key', 'test-key'], { from: 'user' })

    expect(logs.join('\n')).contains('resolv (1)')
    expect(logs.join('\n')).contains('- uniswap-v3-subgraph [SUBGRAPH, PRIVATE] updated 2025-08-05T08:35:25.845Z')
  })
})

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
