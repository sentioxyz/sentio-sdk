import { client } from '@sentio/api'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import process from 'process'
import yaml from 'yaml'
import { getFinalizedHost } from './config.js'
import { ReadKey } from './key.js'
import { getApiUrl, getCliVersion } from './utils.js'

export class CliError extends Error {}

let apiDebugEnabled = false
let originalFetch: typeof globalThis.fetch | undefined

export interface ApiAuthOptions {
  host?: string
  apiKey?: string
  token?: string
}

export interface ProjectLookupOptions {
  project?: string
  owner?: string
  name?: string
  projectId?: string
}

export interface JsonInputOptions {
  file?: string
  stdin?: boolean
}

export interface ApiContext {
  host: string
  headers: Record<string, string>
}

export interface ApiResult<T> {
  data?: T
  error?: unknown
  response?: {
    status?: number
    statusText?: string
  }
}

export interface ProjectRef {
  owner: string
  slug: string
  projectId?: string
}

interface ProjectInputRef {
  owner?: string
  slug: string
}

interface ProjectBySlugResponse {
  project?: {
    id?: string
    ownerName?: string
    slug?: string
  }
}

interface ProjectByIdResponse {
  id?: string
  owner?: string
  slug?: string
}

export function getApiBaseUrl(host: string) {
  let apiHost = host
  if (host.includes('sentio.xyz')) {
    apiHost = host.replace('test', 'api-test').replace('staging', 'api-staging').replace('app', 'api')
  }
  return apiHost.endsWith('/') ? apiHost.slice(0, -1) : apiHost
}

export function enableApiDebug() {
  if (apiDebugEnabled) {
    return
  }
  apiDebugEnabled = true

  if (!globalThis.fetch) {
    return
  }

  originalFetch = globalThis.fetch.bind(globalThis)
  globalThis.fetch = async (input: any, init?: RequestInit) => {
    const method = init?.method ?? (typeof Request !== 'undefined' && input instanceof Request ? input.method : 'GET')
    const url =
      typeof input === 'string' || input instanceof URL
        ? String(input)
        : typeof input?.url === 'string'
          ? input.url
          : String(input)
    const body = formatDebugBody(init?.body)

    console.error(`[sentio debug] ${method.toUpperCase()} ${url}`)
    if (body) {
      console.error(`[sentio debug] body: ${body}`)
    }

    try {
      const response = await originalFetch!(input, init)
      console.error(`[sentio debug] response: ${response.status} ${response.statusText}`)
      return response
    } catch (error) {
      console.error(`[sentio debug] request failed: ${String(error)}`)
      throw error
    }
  }
}

export function createApiContext(options: ApiAuthOptions): ApiContext {
  const host = getFinalizedHost(options.host)
  client.setConfig({
    baseUrl: getApiBaseUrl(host)
  } as never)

  let apiKey = ReadKey(host)
  if (options.apiKey) {
    apiKey = options.apiKey
  }

  if (apiKey) {
    return {
      host,
      headers: {
        'api-key': apiKey,
        version: getCliVersion()
      }
    }
  }

  if (options.token) {
    return {
      host,
      headers: {
        Authorization: `Bearer ${options.token}`,
        version: getCliVersion()
      }
    }
  }

  const loginCommand = host === 'https://app.sentio.xyz' ? 'sentio login' : `sentio login --host=${host}`
  throw new CliError(`No credential found for ${host}. Please run \`${loginCommand}\`.`)
}

export function loadJsonInput(options: JsonInputOptions): unknown | undefined {
  if (options.file && options.stdin) {
    throw new CliError('Use either --file or --stdin, not both.')
  }

  if (options.file) {
    return parseStructuredInput(fs.readFileSync(options.file, 'utf8'), `file ${options.file}`, options.file)
  }

  if (options.stdin) {
    if (process.stdin.isTTY) {
      throw new CliError('Expected JSON or YAML from stdin, but stdin is empty.')
    }
    return parseStructuredInput(fs.readFileSync(0, 'utf8'), 'stdin')
  }

  return undefined
}

export function parseProjectSlug(project: string): Pick<ProjectRef, 'owner' | 'slug'> {
  const [owner, slug, ...rest] = project.split('/')
  if (!owner || !slug || rest.length > 0) {
    throw new CliError(`Invalid project "${project}". Expected <owner>/<slug>.`)
  }
  return { owner, slug }
}

export function loadProjectFromConfig(cwd = process.cwd()): string | undefined {
  const yamlPath = path.join(cwd, 'sentio.yaml')
  if (!fs.existsSync(yamlPath)) {
    return undefined
  }

  try {
    const config = yaml.parse(fs.readFileSync(yamlPath, 'utf8')) as { project?: string } | null
    return config?.project
  } catch (error) {
    throw new CliError(`Failed to read ${yamlPath}: ${String(error)}`)
  }
}

export function resolveProjectSlugInput(
  options: ProjectLookupOptions,
  cwd = process.cwd()
): Pick<ProjectRef, 'owner' | 'slug'> {
  if (options.project) {
    return parseProjectSlug(options.project)
  }

  if (options.owner && options.name) {
    return { owner: options.owner, slug: options.name }
  }

  if (!options.owner && options.name?.includes('/')) {
    return parseProjectSlug(options.name)
  }

  const configProject = loadProjectFromConfig(cwd)
  if (configProject) {
    return parseProjectSlug(configProject)
  }

  throw new CliError(
    'Project is required. Use --project <owner/slug>, --owner with --name, or run inside a Sentio project.'
  )
}

function parseProjectInput(project: string): ProjectInputRef {
  const parts = project.split('/')
  if (parts.length === 1 && parts[0]) {
    return { slug: parts[0] }
  }
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { owner: parts[0], slug: parts[1] }
  }
  throw new CliError(`Invalid project "${project}". Expected <owner>/<slug> or <slug>.`)
}

function resolveProjectInput(options: ProjectLookupOptions, cwd = process.cwd()): ProjectInputRef {
  if (options.project) {
    return parseProjectInput(options.project)
  }

  if (options.owner && options.name) {
    return { owner: options.owner, slug: options.name }
  }

  if (!options.owner && options.name?.includes('/')) {
    return parseProjectInput(options.name)
  }

  if (!options.owner && options.name) {
    return { slug: options.name }
  }

  const configProject = loadProjectFromConfig(cwd)
  if (configProject) {
    return parseProjectInput(configProject)
  }

  throw new CliError(
    'Project is required. Use --project <owner/slug>, --owner with --name, --project-id, or run inside a Sentio project.'
  )
}

export async function resolveProjectRef(
  options: ProjectLookupOptions,
  context: ApiContext,
  requirements: { ownerSlug?: boolean; projectId?: boolean } = { ownerSlug: true }
): Promise<ProjectRef> {
  let owner: string | undefined
  let slug: string | undefined
  let projectId = options.projectId

  try {
    const parsed = resolveProjectInput(options)
    owner = parsed.owner
    slug = parsed.slug
  } catch (error) {
    if (!(error instanceof CliError) || !projectId) {
      throw error
    }
  }

  if ((!owner || !slug) && projectId) {
    const data = await getProjectById(projectId, context)
    owner = data?.owner
    slug = data?.slug
    if (!owner || !slug) {
      throw new CliError(`Unable to resolve project ${projectId}.`)
    }
  }

  if ((!owner || !slug) && requirements.ownerSlug) {
    if (!owner && slug) {
      owner = await getCurrentOwnerName(context)
    }
  }

  if ((!owner || !slug) && requirements.ownerSlug) {
    throw new CliError(
      'Project is required. Use --project <owner/slug>, --owner with --name, --project-id, or run inside a Sentio project.'
    )
  }

  if (!projectId && requirements.projectId) {
    if (!owner || !slug) {
      throw new CliError('Project id resolution requires a project slug.')
    }
    const data = await getProjectBySlug(owner, slug, context)
    projectId = data?.project?.id
    if (!projectId) {
      throw new CliError(`Unable to resolve project id for ${owner}/${slug}.`)
    }
  }

  return {
    owner: owner!,
    slug: slug!,
    projectId
  }
}

async function getCurrentOwnerName(context: ApiContext): Promise<string> {
  const user = await fetchApiJson<{ username?: string }>('/api/v1/users', context)
  if (!user.username) {
    throw new CliError('Unable to resolve project owner from current auth. Use --project <owner/slug> explicitly.')
  }
  return user.username
}

export function handleCommandError(error: unknown): never {
  if (error instanceof CliError) {
    console.error(chalk.red(error.message))
    process.exit(1)
  }

  const response = (error as { response?: { status?: number; statusText?: string } })?.response
  if (response) {
    const status = response.status ?? 'unknown'
    const statusText = response.statusText ?? ''
    console.error(chalk.red(`Sentio API request failed: ${status} ${statusText}`.trim()))
    process.exit(1)
  }

  const cause = (error as { cause?: { code?: string; hostname?: string } })?.cause
  if (error instanceof TypeError && String(error.message).includes('fetch failed')) {
    const detail =
      cause?.code && cause?.hostname ? `${cause.code} (${cause.hostname})` : cause?.code ? cause.code : error.message
    console.error(chalk.red(`Sentio API request failed: ${detail}`))
    process.exit(1)
  }

  console.error(error)
  process.exit(1)
}

export function unwrapApiResult<T>(result: ApiResult<T>): T {
  if (result.error) {
    const errorDetail = formatApiError(result.error)
    const statusDetail = result.response?.status
      ? `${result.response.status} ${result.response.statusText ?? ''}`.trim()
      : undefined
    throw new CliError(
      `Sentio API returned an error${statusDetail ? ` (${statusDetail})` : ''}: ${errorDetail || 'unknown error'}`
    )
  }
  if (result.data === undefined) {
    throw new CliError('Sentio API returned no data.')
  }
  return result.data
}

export async function fetchApiJson<T>(
  apiPath: string,
  context: ApiContext,
  query?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const url = getApiUrl(apiPath, context.host)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  const response = await fetch(url.href, {
    method: 'GET',
    headers: context.headers
  })
  if (!response.ok) {
    const text = await response.text()
    throw new CliError(
      `Sentio API request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`
    )
  }
  return (await response.json()) as T
}

export async function postApiJson<T>(
  apiPath: string,
  context: ApiContext,
  body: unknown,
  query?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const url = getApiUrl(apiPath, context.host)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  const response = await fetch(url.href, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...context.headers
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    const text = await response.text()
    throw new CliError(
      `Sentio API request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`
    )
  }
  return (await response.json()) as T
}

export async function putApiJson<T>(
  apiPath: string,
  context: ApiContext,
  body?: unknown,
  query?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const url = getApiUrl(apiPath, context.host)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  const response = await fetch(url.href, {
    method: 'PUT',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...context.headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
  if (!response.ok) {
    const text = await response.text()
    throw new CliError(
      `Sentio API request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`
    )
  }
  return (await response.json()) as T
}

function parseStructuredInput(content: string, source: string, filename?: string) {
  if (!content.trim()) {
    throw new CliError(`Expected JSON or YAML in ${source}, but it was empty.`)
  }

  const isYamlFile = filename ? /\.ya?ml$/i.test(filename) : false

  try {
    return isYamlFile ? yaml.parse(content) : JSON.parse(content)
  } catch (jsonError) {
    if (!isYamlFile) {
      try {
        return yaml.parse(content)
      } catch (yamlError) {
        throw new CliError(`Invalid JSON or YAML from ${source}: ${String(yamlError)}`)
      }
    }
    throw new CliError(`Invalid JSON or YAML from ${source}: ${String(jsonError)}`)
  }
}

export async function getProjectBySlug(
  owner: string,
  slug: string,
  context: ApiContext
): Promise<ProjectBySlugResponse> {
  const response = await fetch(getApiUrl(`/api/v1/project/${owner}/${slug}`, context.host).href, {
    method: 'GET',
    headers: context.headers
  })
  if (!response.ok) {
    throw new CliError(`Failed to resolve project ${owner}/${slug}: ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as ProjectBySlugResponse
}

export async function getProjectById(projectId: string, context: ApiContext): Promise<ProjectByIdResponse> {
  const response = await fetch(getApiUrl(`/api/v1/project/${projectId}`, context.host).href, {
    method: 'GET',
    headers: context.headers
  })
  if (!response.ok) {
    throw new CliError(`Failed to resolve project ${projectId}: ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as ProjectByIdResponse
}

function formatApiError(error: unknown) {
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: string }).message
    if (maybeMessage) {
      return maybeMessage
    }
    try {
      const serialized = JSON.stringify(error)
      return serialized === '{}' ? '' : serialized
    } catch {}
  }
  return String(error)
}

function formatDebugBody(body: any) {
  if (!body) {
    return ''
  }
  if (typeof body === 'string') {
    return body
  }
  if (body instanceof URLSearchParams) {
    return body.toString()
  }
  if (body instanceof Uint8Array || body instanceof ArrayBuffer) {
    return '<binary>'
  }
  return `<${body.constructor?.name ?? 'body'}>`
}
