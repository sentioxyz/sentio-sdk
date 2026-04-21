import { afterEach, beforeEach, describe, test } from 'node:test'
import { expect } from 'chai'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { createDashboardCommand } from './dashboard.js'

describe('dashboard command', () => {
  const originalFetch = globalThis.fetch
  const originalConsoleLog = console.log
  const originalReadFileSync = fs.readFileSync
  const originalStdinIsTTY = process.stdin.isTTY
  let logs: string[] = []
  let requests: Array<{ url: string; init?: RequestInit; body?: unknown }> = []

  beforeEach(() => {
    logs = []
    requests = []
    console.log = (...args: unknown[]) => {
      logs.push(args.map((arg) => String(arg)).join(' '))
    }
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    console.log = originalConsoleLog
    fs.readFileSync = originalReadFileSync
    Object.defineProperty(process.stdin, 'isTTY', { value: originalStdinIsTTY, configurable: true })
  })

  test('create posts an empty dashboard with the required title', async () => {
    globalThis.fetch = mockDashboardCreateFetch(requests)

    const command = createDashboardCommand()
    await command.parseAsync(['create', '--project', 'sentio/demo', '--title', 'Operations', '--api-key', 'test-key'], {
      from: 'user'
    })

    expect(requests).length(2)
    expect(requests[0].url).equals('https://api.sentio.xyz/v1/project/sentio/demo')
    expect(requests[1].url).equals('https://api.sentio.xyz/v1/dashboards')
    expect(requests[1].init?.method).equals('POST')
    expect(requests[1].body).deep.equals({
      name: 'Operations',
      projectId: 'project-demo-id',
      panels: {},
      layouts: {
        responsiveLayouts: {
          lg: { layouts: [] },
          md: { layouts: [] },
          sm: { layouts: [] },
          xs: { layouts: [] }
        }
      }
    })
    expect(logs.join('\n')).contains('Dashboard "Operations" created')
  })

  test('create initializes panels and layouts from file', async () => {
    globalThis.fetch = mockDashboardCreateFetch(requests)
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sentio-dashboard-'))
    const inputPath = path.join(tmpDir, 'dashboard.json')
    fs.writeFileSync(
      inputPath,
      JSON.stringify({
        panels: {
          panel_a: {
            id: 'panel_a',
            name: 'Volume',
            chart: { type: 'LINE' }
          }
        },
        layouts: {
          responsiveLayouts: {
            lg: {
              layouts: [{ i: 'panel_a', x: 0, y: 0, w: 12, h: 6 }]
            }
          }
        }
      })
    )

    const command = createDashboardCommand()
    await command.parseAsync(
      ['create', '--project', 'sentio/demo', '--title', 'Operations', '--file', inputPath, '--api-key', 'test-key'],
      { from: 'user' }
    )

    expect(requests[1].body).deep.equals({
      name: 'Operations',
      projectId: 'project-demo-id',
      panels: {
        panel_a: {
          id: 'panel_a',
          name: 'Volume',
          chart: { type: 'LINE' }
        }
      },
      layouts: {
        responsiveLayouts: {
          lg: {
            layouts: [{ i: 'panel_a', x: 0, y: 0, w: 12, h: 6 }]
          }
        }
      }
    })
  })

  test('create initializes panels and layouts from stdin', async () => {
    globalThis.fetch = mockDashboardCreateFetch(requests)
    Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true })
    fs.readFileSync = ((
      file: fs.PathOrFileDescriptor,
      options?: BufferEncoding | { encoding?: BufferEncoding } | null
    ) => {
      if (file === 0) {
        return JSON.stringify({
          panels: {
            panel_b: {
              id: 'panel_b',
              name: 'Users',
              chart: { type: 'BAR' }
            }
          },
          layouts: {
            responsiveLayouts: {
              lg: {
                layouts: [{ i: 'panel_b', x: 0, y: 0, w: 6, h: 4 }]
              }
            }
          }
        })
      }
      return originalReadFileSync(file, options as never)
    }) as typeof fs.readFileSync

    const command = createDashboardCommand()
    await command.parseAsync(
      ['create', '--project', 'sentio/demo', '--title', 'Operations', '--stdin', '--api-key', 'test-key'],
      { from: 'user' }
    )

    expect(requests[1].body).deep.equals({
      name: 'Operations',
      projectId: 'project-demo-id',
      panels: {
        panel_b: {
          id: 'panel_b',
          name: 'Users',
          chart: { type: 'BAR' }
        }
      },
      layouts: {
        responsiveLayouts: {
          lg: {
            layouts: [{ i: 'panel_b', x: 0, y: 0, w: 6, h: 4 }]
          }
        }
      }
    })
  })
})

function mockDashboardCreateFetch(requests: Array<{ url: string; init?: RequestInit; body?: unknown }>) {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' || input instanceof URL ? String(input) : input.url
    const body = init?.body ? JSON.parse(String(init.body)) : undefined
    requests.push({ url, init, body })

    if (url === 'https://api.sentio.xyz/v1/project/sentio/demo') {
      return jsonResponse({ project: { id: 'project-demo-id', owner: 'sentio', slug: 'demo' } })
    }

    if (url === 'https://api.sentio.xyz/v1/dashboards' && init?.method === 'POST') {
      return jsonResponse({
        dashboard: {
          id: 'dashboard-1',
          name: body.name,
          panels: body.panels,
          layouts: body.layouts
        }
      })
    }

    throw new Error(`Unexpected fetch URL: ${url}`)
  }) as typeof globalThis.fetch
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
