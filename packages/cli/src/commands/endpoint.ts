import { Command, InvalidArgumentError } from '@commander-js/extra-typings'
import process from 'process'
import yaml from 'yaml'
import { CliError, createApiContext, fetchApiJson, handleCommandError, postApiJson, resolveProjectRef } from '../api.js'
import { getApiUrl } from '../utils.js'

interface EndpointOptions {
  host?: string
  apiKey?: string
  token?: string
  project?: string
  owner?: string
  name?: string
  projectId?: string
  json?: boolean
  yaml?: boolean
}

interface EndpointCreateOptions extends EndpointOptions {
  query?: string
  args?: string
  endpointName?: string
  slug?: string
  private?: boolean
  version?: number
}

interface EndpointLookupOptions extends EndpointOptions {
  id?: string
  version?: number
}

interface EndpointTestOptions extends EndpointLookupOptions {
  args?: string
}

interface EndpointRecord {
  id?: string
  name?: string
  slug?: string
  owner?: string
  projectId?: string
  projectSlug?: string
  isPublic?: boolean
  enabled?: boolean
  sqlQueryId?: string
  totalCalls?: string
}

interface EndpointDocResponse {
  endpointUrl?: string
  pathParameters?: EndpointParameter[]
  bodyParameters?: EndpointParameter[]
  queryParameters?: EndpointParameter[]
  method?: string
}

interface EndpointParameter {
  name?: string
  type?: string
  description?: string
  required?: boolean
}

interface SqlSaveResponse {
  queryId?: string
}

interface SqlGetResponse {
  queryId?: string
  sqlQuery?: {
    sql?: string
    parameters?: {
      fields?: Record<string, unknown>
    }
    name?: string
  }
}

export function createEndpointCommand() {
  const endpointCommand = new Command('endpoint').description('Manage Sentio SQL endpoints')
  endpointCommand.addCommand(createEndpointCreateCommand())
  endpointCommand.addCommand(createEndpointGetCommand())
  endpointCommand.addCommand(createEndpointListCommand())
  endpointCommand.addCommand(createEndpointDeleteCommand())
  endpointCommand.addCommand(createEndpointTestCommand())
  return endpointCommand
}

function createEndpointCreateCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('create').description('Create a SQL endpoint')))
  )
    .showHelpAfterError()
    .option('--query <sql>', 'SQL query text')
    .option('--args <json>', 'JSON object of SQL parameter types, for example {"a":"string","b":"int"}')
    .option('--endpoint-name <name>', 'Endpoint name')
    .option('--slug <slug>', 'Endpoint slug')
    .option('--private', 'Create a private endpoint')
    .option('--version <version>', 'Processor version', parseInteger)
    .addHelpText(
      'after',
      `

Examples:
  $ sentio endpoint create --project sentio/coinbase --query "select * from transfer where amount > \${min_amount}" --args '{"min_amount":"int"}'
  $ sentio endpoint create --project sentio/coinbase --query "select now()" --endpoint-name "Now" --slug now
`
    )
    .action(async (options, command) => {
      try {
        await runEndpointCreate(options)
      } catch (error) {
        handleEndpointCommandError(error, command)
      }
    })
}

function createEndpointGetCommand() {
  return withOutputOptions(withSharedProjectOptions(withAuthOptions(new Command('get').description('Get an endpoint'))))
    .showHelpAfterError()
    .requiredOption('--id <id>', 'Endpoint id')
    .option('--version <version>', 'Processor version', parseInteger)
    .action(async (options, command) => {
      try {
        await runEndpointGet(options)
      } catch (error) {
        handleEndpointCommandError(error, command)
      }
    })
}

function createEndpointListCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('list').description('List endpoints in a project')))
  )
    .showHelpAfterError()
    .option('--version <version>', 'Processor version', parseInteger)
    .action(async (options, command) => {
      try {
        await runEndpointList(options)
      } catch (error) {
        handleEndpointCommandError(error, command)
      }
    })
}

function createEndpointDeleteCommand() {
  return withOutputOptions(withAuthOptions(new Command('delete').description('Delete an endpoint')))
    .showHelpAfterError()
    .requiredOption('--id <id>', 'Endpoint id')
    .action(async (options, command) => {
      try {
        await runEndpointDelete(options)
      } catch (error) {
        handleEndpointCommandError(error, command)
      }
    })
}

function createEndpointTestCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('test').description('Call an endpoint')))
  )
    .showHelpAfterError()
    .requiredOption('--id <id>', 'Endpoint id')
    .option('--args <json>', 'JSON object of argument values')
    .option('--version <version>', 'Processor version', parseInteger)
    .addHelpText(
      'after',
      `

Examples:
  $ sentio endpoint test --project sentio/coinbase --id <endpoint-id> --args '{"min_amount":1000}'
`
    )
    .action(async (options, command) => {
      try {
        await runEndpointTest(options)
      } catch (error) {
        handleEndpointCommandError(error, command)
      }
    })
}

async function runEndpointCreate(options: EndpointCreateOptions) {
  if (!options.query) {
    throw new CliError('SQL query is required. Use --query <sql>.')
  }
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true, projectId: true })
  const argSchema = parseEndpointArgSchema(options.args)

  const sqlSave = await postApiJson<SqlSaveResponse>(
    `/api/v1/analytics/${project.owner}/${project.slug}/sql/save`,
    context,
    {
      projectOwner: project.owner,
      projectSlug: project.slug,
      projectId: project.projectId,
      version: options.version,
      source: 'ENDPOINT',
      runImmediately: false,
      sqlQuery: {
        sql: options.query,
        name: options.endpointName,
        parameters: Object.keys(argSchema).length > 0 ? { fields: argSchema } : undefined
      }
    }
  )

  const sqlQueryId = sqlSave.queryId
  if (!sqlQueryId) {
    throw new CliError('Failed to create endpoint SQL query.')
  }

  const slug = options.slug ?? sqlQueryId
  const endpointName = options.endpointName ?? slug

  const endpoint = await postApiJson<{ endpoints?: EndpointRecord[] }>('/api/v1/endpoint', context, {
    projectId: project.projectId,
    owner: project.owner,
    projectSlug: project.slug,
    name: endpointName,
    slug,
    sqlQueryId,
    isPublic: options.private ? false : true,
    enabled: true
  })

  const created = endpoint.endpoints?.[0] ?? {
    name: endpointName,
    slug,
    projectId: project.projectId,
    owner: project.owner,
    projectSlug: project.slug,
    sqlQueryId,
    isPublic: options.private ? false : true,
    enabled: true
  }

  printOutput(options, {
    message: 'Endpoint created',
    endpoint: created
  })
}

async function runEndpointGet(options: EndpointLookupOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const endpoint = await fetchApiJson<EndpointRecord>(
    `/api/v1/endpoint/${project.owner}/${project.slug}/${options.id}`,
    context,
    {
      projectOwner: project.owner,
      projectSlug: project.slug,
      endpointId: options.id,
      version: options.version
    }
  )
  const docs = await fetchApiJson<EndpointDocResponse>(`/api/v1/endpoint/${options.id}/docs`, context, {
    endpointId: options.id,
    projectOwner: project.owner,
    projectSlug: project.slug,
    version: options.version
  })
  const sqlQuery = endpoint.sqlQueryId
    ? await fetchApiJson<SqlGetResponse>(
        `/api/v1/analytics/${project.owner}/${project.slug}/sql/get_query/${endpoint.sqlQueryId}`,
        context,
        {
          projectOwner: project.owner,
          projectSlug: project.slug,
          projectId: endpoint.projectId,
          version: options.version,
          queryId: endpoint.sqlQueryId
        }
      )
    : undefined

  printOutput(options, {
    endpoint,
    docs,
    sqlQuery
  })
}

async function runEndpointList(options: EndpointLookupOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { projectId: true })
  const data = await fetchApiJson<{ endpoints?: EndpointRecord[] }>(
    `/api/v1/endpoint/${project.projectId}/endpoints`,
    context,
    {
      projectId: project.projectId,
      version: options.version
    }
  )
  printOutput(options, data)
}

async function runEndpointDelete(options: EndpointLookupOptions) {
  const context = createApiContext(options)
  const response = await fetch(getApiUrl(`/api/v1/endpoint/${options.id}`, context.host).href, {
    method: 'DELETE',
    headers: context.headers
  })
  if (!response.ok) {
    throw new CliError(`Failed to delete endpoint ${options.id}: ${response.status} ${response.statusText}`)
  }
  printOutput(options, { message: `Endpoint deleted: ${options.id}` })
}

async function runEndpointTest(options: EndpointTestOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const endpoint = await fetchApiJson<EndpointRecord>(
    `/api/v1/endpoint/${project.owner}/${project.slug}/${options.id}`,
    context,
    {
      projectOwner: project.owner,
      projectSlug: project.slug,
      endpointId: options.id,
      version: options.version
    }
  )
  const docs = await fetchApiJson<EndpointDocResponse>(`/api/v1/endpoint/${options.id}/docs`, context, {
    endpointId: options.id,
    projectOwner: project.owner,
    projectSlug: project.slug,
    version: options.version
  })

  const inputArgs = parseEndpointArgValues(options.args)
  const request = buildEndpointInvocation(docs, inputArgs)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (context.headers['api-key']) {
    headers['Api-Key'] = context.headers['api-key']
  } else if (context.headers.Authorization) {
    headers.Authorization = context.headers.Authorization
  }

  const response = await fetch(request.url, {
    method: request.method,
    headers,
    body: request.method === 'GET' ? undefined : JSON.stringify(request.body)
  })
  const text = await response.text()
  let payload: unknown = text
  try {
    payload = text ? JSON.parse(text) : {}
  } catch {}

  printOutput(options, {
    endpoint,
    request: {
      method: request.method,
      url: request.url,
      body: request.body
    },
    response: {
      status: response.status,
      statusText: response.statusText,
      body: payload
    }
  })
}

function withAuthOptions<T extends Command<any, any, any>>(command: T) {
  return command
    .option('--host <host>', 'Override Sentio host')
    .option('--api-key <key>', 'Use an explicit API key instead of saved credentials')
    .option('--token <token>', 'Use an explicit bearer token instead of saved credentials')
}

function withSharedProjectOptions<T extends Command<any, any, any>>(command: T) {
  return command
    .option('--project <project>', 'Sentio project as <owner>/<slug> or <slug>')
    .option('--owner <owner>', 'Sentio project owner')
    .option('--name <name>', 'Sentio project name')
    .option('--project-id <id>', 'Sentio project id')
}

function withOutputOptions<T extends Command<any, any, any>>(command: T) {
  return command.option('--json', 'Print raw JSON response').option('--yaml', 'Print raw YAML response')
}

function handleEndpointCommandError(error: unknown, command?: Command) {
  if (
    error instanceof CliError &&
    (error.message.startsWith('Project is required.') ||
      error.message.startsWith('Invalid project ') ||
      error.message.startsWith('SQL query is required.') ||
      error.message.startsWith('Invalid --args JSON') ||
      error.message.startsWith('Unsupported argument type ') ||
      error.message.startsWith('Failed to create endpoint SQL query.') ||
      error.message.startsWith('Failed to delete endpoint '))
  ) {
    console.error(error.message)
    if (command) {
      console.error()
      command.outputHelp()
    }
    process.exit(1)
  }
  handleCommandError(error)
}

function printOutput(options: EndpointOptions, data: unknown) {
  if (options.json && options.yaml) {
    throw new CliError('Choose only one structured output format: --json or --yaml.')
  }
  if (options.json) {
    console.log(JSON.stringify(data, null, 2))
    return
  }
  if (options.yaml) {
    console.log(yaml.stringify(data).trimEnd())
    return
  }
  console.log(formatOutput(data))
}

function formatOutput(data: unknown) {
  if (data && typeof data === 'object' && Array.isArray((data as { endpoints?: unknown[] }).endpoints)) {
    const endpoints = (data as { endpoints: EndpointRecord[] }).endpoints
    const lines = [`Endpoints (${endpoints.length})`]
    for (const endpoint of endpoints) {
      lines.push(`- ${endpoint.name ?? endpoint.slug ?? '<endpoint>'}`)
      lines.push(
        `  id=${endpoint.id ?? '?'} slug=${endpoint.slug ?? '?'} ${endpoint.isPublic ? 'public' : 'private'} ${endpoint.enabled === false ? 'disabled' : 'enabled'}`
      )
    }
    return lines.join('\n')
  }

  if (
    data &&
    typeof data === 'object' &&
    'endpoint' in (data as Record<string, unknown>) &&
    'docs' in (data as Record<string, unknown>)
  ) {
    const objectData = data as { endpoint?: EndpointRecord; docs?: EndpointDocResponse; sqlQuery?: SqlGetResponse }
    const endpoint = objectData.endpoint ?? {}
    const docs = objectData.docs ?? {}
    const lines = [`Endpoint: ${endpoint.name ?? endpoint.slug ?? '<endpoint>'}`]
    lines.push(`ID: ${endpoint.id ?? '?'}`)
    if (endpoint.slug) {
      lines.push(`Slug: ${endpoint.slug}`)
    }
    lines.push(`Visibility: ${endpoint.isPublic ? 'public' : 'private'}`)
    lines.push(`Enabled: ${endpoint.enabled === false ? 'false' : 'true'}`)
    if (docs.endpointUrl) {
      lines.push(`URL: ${docs.endpointUrl}`)
    }
    if (endpoint.sqlQueryId) {
      lines.push(`SQL Query ID: ${endpoint.sqlQueryId}`)
    }
    const sql = objectData.sqlQuery?.sqlQuery?.sql
    if (sql) {
      lines.push('')
      lines.push('SQL')
      lines.push(sql)
    }
    lines.push('')
    lines.push('Arguments')
    lines.push(...formatEndpointParameters('Path', docs.pathParameters))
    lines.push(...formatEndpointParameters('Query', docs.queryParameters))
    lines.push(...formatEndpointParameters('Body', docs.bodyParameters))
    lines.push('')
    lines.push('curl')
    lines.push(buildCurlCommand(docs))
    return lines.join('\n')
  }

  if (
    data &&
    typeof data === 'object' &&
    'message' in (data as Record<string, unknown>) &&
    'endpoint' in (data as Record<string, unknown>)
  ) {
    const objectData = data as { message?: string; endpoint?: EndpointRecord }
    const endpoint = objectData.endpoint ?? {}
    const lines = [objectData.message ?? 'Endpoint updated']
    lines.push(`- ${endpoint.name ?? endpoint.slug ?? '<endpoint>'}`)
    lines.push(`  id=${endpoint.id ?? '?'} slug=${endpoint.slug ?? '?'}`)
    return lines.join('\n')
  }

  if (
    data &&
    typeof data === 'object' &&
    'request' in (data as Record<string, unknown>) &&
    'response' in (data as Record<string, unknown>)
  ) {
    const objectData = data as {
      endpoint?: EndpointRecord
      request?: { method?: string; url?: string; body?: unknown }
      response?: { status?: number; statusText?: string; body?: unknown }
    }
    const lines = [`Endpoint test: ${objectData.endpoint?.name ?? objectData.endpoint?.slug ?? '<endpoint>'}`]
    lines.push(`Request: ${objectData.request?.method ?? 'POST'} ${objectData.request?.url ?? ''}`)
    if (objectData.request?.body && Object.keys(objectData.request.body as Record<string, unknown>).length > 0) {
      lines.push(`Body: ${JSON.stringify(objectData.request.body)}`)
    }
    lines.push(`Response: ${objectData.response?.status ?? '?'} ${objectData.response?.statusText ?? ''}`.trim())
    if (objectData.response?.body !== undefined) {
      lines.push(
        typeof objectData.response.body === 'string'
          ? objectData.response.body
          : JSON.stringify(objectData.response.body, null, 2)
      )
    }
    return lines.join('\n')
  }

  if (data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)) {
    return String((data as { message?: string }).message ?? '')
  }

  return JSON.stringify(data, null, 2)
}

function formatEndpointParameters(label: string, params?: EndpointParameter[]) {
  const entries = Array.isArray(params) ? params : []
  if (entries.length === 0) {
    return [`${label}: none`]
  }
  return [
    `${label}:`,
    ...entries.map(
      (param) =>
        `- ${param.name ?? '?'}${param.type ? ` (${String(param.type).toLowerCase()})` : ''}${param.required ? ' required' : ''}${param.description ? ` - ${param.description}` : ''}`
    )
  ]
}

export function buildCurlCommand(docs: EndpointDocResponse) {
  const rawUrl = docs.endpointUrl ?? '<endpoint-url>'
  const pathUrl = rawUrl
    .split('/')
    .map((part) => (part.startsWith(':') ? `<${part.slice(1)}>` : part))
    .join('/')
  const query = (docs.queryParameters ?? [])
    .filter((param) => shouldIncludeCurlParameter(param))
    .map((param) => `${encodeURIComponent(param.name ?? 'param')}=${encodeURIComponent(`<${param.name ?? 'value'}>`)}`)
    .join('&')
  const url = query ? `${pathUrl}?${query}` : pathUrl
  const body = Object.fromEntries(
    (docs.bodyParameters ?? []).map((param) => [param.name ?? 'param', `<${param.name ?? 'value'}>`])
  )
  const method = normalizeEndpointMethod(docs.method)
  const parts = [`curl '${url}'`, `-X ${method}`, `-H 'Api-Key: <API_KEY>'`, `-H 'Content-Type: application/json'`]
  if (Object.keys(body).length > 0 && method !== 'GET') {
    parts.push(`-d '${JSON.stringify(body)}'`)
  }
  return parts.join(' \\\n  ')
}

export function parseEndpointArgSchema(raw?: string) {
  if (!raw) {
    return {}
  }
  const parsed = parseJsonObject(raw)
  return Object.fromEntries(Object.entries(parsed).map(([key, type]) => [key, toRichValueTemplate(String(type))]))
}

export function parseEndpointArgValues(raw?: string) {
  if (!raw) {
    return {}
  }
  return parseJsonObject(raw)
}

function parseJsonObject(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Expected an object')
    }
    return parsed
  } catch (error) {
    throw new CliError(`Invalid --args JSON: ${String(error)}`)
  }
}

export function toRichValueTemplate(type: string) {
  switch (type.toLowerCase()) {
    case 'string':
    case 'text':
      return { stringValue: '' }
    case 'int':
    case 'integer':
    case 'number':
    case 'float':
      return { floatValue: 0 }
    case 'datetime':
    case 'time':
    case 'timestamp':
      return { timestampValue: '' }
    case 'bool':
    case 'boolean':
      return { boolValue: false }
    default:
      throw new CliError(`Unsupported argument type "${type}". Use string, int, number, datetime, or bool.`)
  }
}

export function buildEndpointInvocation(docs: EndpointDocResponse, args: Record<string, unknown>) {
  let url = docs.endpointUrl ?? ''
  for (const param of docs.pathParameters ?? []) {
    const name = param.name ?? ''
    if (name && args[name] !== undefined) {
      url = url.replace(`:${name}`, encodeURIComponent(String(args[name])))
    }
  }

  const queryEntries = (docs.queryParameters ?? [])
    .filter((param) => param.name && args[param.name] !== undefined)
    .map((param) => [param.name!, String(args[param.name!])] as [string, string])

  if (queryEntries.length > 0) {
    const query = new URLSearchParams(queryEntries)
    url += (url.includes('?') ? '&' : '?') + query.toString()
  }

  const body = Object.fromEntries(
    (docs.bodyParameters ?? [])
      .filter((param) => param.name && args[param.name] !== undefined)
      .map((param) => [param.name!, args[param.name!]])
  )

  return {
    method: normalizeEndpointMethod(docs.method),
    url,
    body
  }
}

function normalizeEndpointMethod(method?: string) {
  const normalized = method?.trim().toUpperCase()
  return normalized || 'POST'
}

function shouldIncludeCurlParameter(param: EndpointParameter) {
  return param.required === true
}

function parseInteger(value: string) {
  const parsedValue = Number.parseInt(value, 10)
  if (Number.isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.')
  }
  return parsedValue
}
