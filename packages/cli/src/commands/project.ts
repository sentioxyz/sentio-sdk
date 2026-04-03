import { Command } from '@commander-js/extra-typings'
import process from 'process'
import readline from 'readline'
import yaml from 'yaml'
import chalk from 'chalk'
import {
  CliError,
  createApiContext,
  fetchApiJson,
  handleCommandError,
  postApiJson,
  resolveProjectRef,
  resolveProjectSlugInput
} from '../api.js'
import { getApiUrl, getCliVersion } from '../utils.js'
import { ReadAccessToken, isAccessTokenExpired } from '../key.js'
import { loginInteractiveAndWait } from './login.js'

interface ProjectAuthOptions {
  host?: string
  apiKey?: string
  token?: string
  json?: boolean
  yaml?: boolean
}

interface ProjectListOptions extends ProjectAuthOptions {
  owner?: string
}

interface ProjectListOutput {
  projects: ProjectSummary[]
  grouped: boolean
}

interface ProjectLookupOptions extends ProjectAuthOptions {
  project?: string
  owner?: string
  name?: string
  projectId?: string
}

interface ProjectCreateOptions extends ProjectLookupOptions {
  type?: string
  visibility?: string
  sentioNetwork?: boolean
}

interface ProjectDeleteOptions extends ProjectLookupOptions {
  yes?: boolean
}

interface ProjectSummary {
  id?: string
  slug?: string
  owner?: string | { organization?: { name?: string }; user?: { username?: string } }
  ownerName?: string
  displayName?: string
  description?: string
  updatedAt?: string
  createdAt?: string
  visibility?: string
  type?: string
  sentioNetwork?: boolean
}

export function createProjectCommand() {
  const projectCommand = new Command('project').description('Manage Sentio projects')
  projectCommand.addCommand(createProjectListCommand())
  projectCommand.addCommand(createProjectGetCommand())
  projectCommand.addCommand(createProjectCreateCommand())
  projectCommand.addCommand(createProjectDeleteCommand())
  return projectCommand
}

function createProjectListCommand() {
  return withOutputOptions(withAuthOptions(new Command('list').description('List projects')))
    .showHelpAfterError()
    .option('--owner <name>', 'Filter projects by owner')
    .action(async (options, command) => {
      try {
        await runProjectList(options)
      } catch (error) {
        handleProjectCommandError(error, command)
      }
    })
}

function createProjectGetCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('get').description('Get a project').argument('[project]')))
  )
    .showHelpAfterError()
    .action(async (projectArg, options, command) => {
      try {
        if (projectArg) {
          options.project = projectArg
        }
        await runProjectGet(options)
      } catch (error) {
        handleProjectCommandError(error, command)
      }
    })
}

function createProjectCreateCommand() {
  return withOutputOptions(
    withSharedProjectOptions(
      withAuthOptions(new Command('create').description('Create a project').argument('[project]'))
    )
  )
    .showHelpAfterError()
    .option('--type <type>', 'Project type: sentio, subgraph, or action')
    .option('--visibility <visibility>', 'Project visibility: private or public')
    .option('--sentio-network', 'Create a Sentio Network project')
    .action(async (projectArg, options, command) => {
      try {
        if (projectArg) {
          options.project = projectArg
        }
        await runProjectCreate(options)
      } catch (error) {
        handleProjectCommandError(error, command)
      }
    })
}

function createProjectDeleteCommand() {
  return withOutputOptions(
    withSharedProjectOptions(
      withAuthOptions(new Command('delete').description('Delete a project').argument('[project]'))
    )
  )
    .showHelpAfterError()
    .option('-y, --yes', 'Skip confirmation prompt (requires a valid login session — will not open browser)')
    .action(async (projectArg, options, command) => {
      try {
        if (projectArg) {
          options.project = projectArg
        }
        await runProjectDelete(options)
      } catch (error) {
        handleProjectCommandError(error, command)
      }
    })
}

async function runProjectList(options: ProjectListOptions) {
  const context = createApiContext(options)
  const ownerFilter = options.owner
  if (ownerFilter) {
    const projects = await getProjectsByOwner(ownerFilter, context)
    printOutput(options, { projects, grouped: false })
    return
  }

  const data = await fetchApiJson<unknown>('/api/v1/projects', context)
  printOutput(options, { projects: normalizeProjectList(data), grouped: true })
}

async function runProjectGet(options: ProjectLookupOptions) {
  const context = createApiContext(options)
  const data = options.projectId
    ? await fetchApiJson<{ project?: ProjectSummary }>(`/api/v1/project/${options.projectId}`, context)
    : await fetchProjectBySlug(options, context)
  printOutput(options, data)
}

async function runProjectCreate(options: ProjectCreateOptions) {
  const context = createApiContext(options)
  const project = resolveProjectSlugInput(options)
  const data = await postApiJson<Record<string, unknown>>('/api/v1/projects', context, {
    slug: project.slug,
    ownerName: project.owner,
    type: normalizeProjectType(options.type),
    visibility: normalizeProjectVisibility(options.visibility),
    sentioNetwork: options.sentioNetwork ?? false
  })
  printOutput(options, {
    id: asString(data.id),
    slug: project.slug,
    ownerName: project.owner,
    type: normalizeProjectType(options.type),
    visibility: normalizeProjectVisibility(options.visibility),
    sentioNetwork: options.sentioNetwork ?? false
  })
}

async function runProjectDelete(options: ProjectDeleteOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true, projectId: true })

  // Project deletion requires admin permission — must use access token (Bearer), not api-key.
  // With -y: error if token missing/expired (no browser). Without -y: open browser if needed.
  const accessToken = await requireAccessToken(context.host, { strict: options.yes ?? false })

  if (!options.yes) {
    const confirmed = await confirmDelete(`${project.owner}/${project.slug}`)
    if (!confirmed) {
      console.log('Delete cancelled.')
      return
    }
  }

  const url = getApiUrl(`/api/v1/projects/${project.projectId}`, context.host)
  const response = await fetch(url.href, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      version: getCliVersion()
    }
  })
  if (!response.ok) {
    const text = await response.text()
    throw new CliError(
      `Failed to delete project ${project.owner}/${project.slug}: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`
    )
  }
  printOutput(options, { message: `Project deleted: ${project.owner}/${project.slug}` })
}

async function requireAccessToken(host: string, { strict }: { strict: boolean }): Promise<string> {
  const stored = ReadAccessToken(host)
  if (stored && !isAccessTokenExpired(stored.expiresAt)) {
    return stored.token
  }

  if (strict) {
    // -y was passed: do not open browser, just fail fast
    throw new CliError(
      'Deleting a project requires admin permission, but your login session is missing or expired.\n' +
        'Run `sentio login` to refresh your session, then retry.'
    )
  }

  // Interactive: launch browser login to obtain a fresh token
  console.log(
    chalk.yellow(
      'Deleting a project requires admin permission, but your login session is missing or expired.\n' +
        'Opening the browser to log you in...'
    )
  )
  await loginInteractiveAndWait(host)

  const refreshed = ReadAccessToken(host)
  if (!refreshed) {
    throw new CliError('Login succeeded but no access token was saved. Please try again.')
  }
  return refreshed.token
}

async function confirmDelete(projectSlug: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(
      chalk.yellow(`Are you sure you want to delete project "${projectSlug}"? This cannot be undone. [y/N] `),
      (answer) => {
        rl.close()
        resolve(answer.trim().toLowerCase() === 'y')
      }
    )
  })
}

async function fetchProjectBySlug(options: ProjectLookupOptions, context: ReturnType<typeof createApiContext>) {
  const project = resolveProjectSlugInput(options)
  return fetchApiJson<{ project?: ProjectSummary }>(`/api/v1/project/${project.owner}/${project.slug}`, context)
}

function withAuthOptions<T extends Command<any, any, any>>(command: T) {
  return command
    .option('--host <host>', 'Override Sentio host')
    .option('--api-key <key>', 'Use an explicit API key instead of saved credentials')
    .option('--token <token>', 'Use an explicit bearer token instead of saved credentials')
}

function withSharedProjectOptions<T extends Command<any, any, any>>(command: T) {
  return command
    .option('--project <owner/slug>', 'Sentio project in <owner>/<slug> format')
    .option('--owner <owner>', 'Sentio project owner')
    .option('--name <name>', 'Sentio project name')
    .option('--project-id <id>', 'Sentio project id')
}

function withOutputOptions<T extends Command<any, any, any>>(command: T) {
  return command.option('--json', 'Print raw JSON response').option('--yaml', 'Print raw YAML response')
}

function handleProjectCommandError(error: unknown, command?: Command) {
  if (
    error instanceof CliError &&
    (error.message.startsWith('Project is required.') ||
      error.message.startsWith('Invalid project ') ||
      error.message.startsWith('Owner not found:') ||
      error.message.startsWith('Failed to delete project '))
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

function printOutput(options: ProjectAuthOptions, data: unknown) {
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
  if (isProjectListOutput(data)) {
    const projects = data.projects
    if (!data.grouped) {
      const lines = [`Projects (${projects.length})`]
      for (const project of [...projects].sort((left, right) => (left.slug ?? '').localeCompare(right.slug ?? ''))) {
        const owner = getOwnerName(project) ?? '<owner>'
        const slug = project.slug ?? '<slug>'
        const attrs = formatProjectListAttrs(project)
        const updatedAt = formatTimestamp(project.updatedAt)
        lines.push(`- ${owner}/${slug}${attrs ? ` [${attrs}]` : ''}${updatedAt ? ` updated ${updatedAt}` : ''}`)
      }
      return lines.join('\n')
    }

    const groupedProjects = groupProjectsByOwner(projects)
    const lines = [`Projects (${projects.length})`]
    for (const group of groupedProjects) {
      lines.push(`${group.owner} (${group.projects.length})`)
      for (const project of group.projects) {
        const slug = project.slug ?? '<slug>'
        const attrs = formatProjectListAttrs(project)
        const updatedAt = formatTimestamp(project.updatedAt)
        lines.push(`- ${slug}${attrs ? ` [${attrs}]` : ''}${updatedAt ? ` updated ${updatedAt}` : ''}`)
      }
    }
    return lines.join('\n')
  }

  if (data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)) {
    return String((data as { message?: string }).message ?? '')
  }

  const project = ((data as { project?: ProjectSummary })?.project ?? data) as ProjectSummary
  const owner = getOwnerName(project) ?? '<owner>'
  const slug = project.slug ?? '<slug>'
  const lines = [`Project: ${owner}/${slug}`]
  if (project.id) {
    lines.push(`ID: ${project.id}`)
  }
  if (project.type) {
    lines.push(`Type: ${project.type}`)
  }
  if (project.visibility) {
    lines.push(`Visibility: ${project.visibility}`)
  }
  if (project.sentioNetwork !== undefined) {
    lines.push(`Sentio Network: ${project.sentioNetwork ? 'enabled' : 'disabled'}`)
  }
  if (project.displayName) {
    lines.push(`Display name: ${project.displayName}`)
  }
  if (project.description) {
    lines.push(`Description: ${project.description}`)
  }
  if (project.createdAt) {
    lines.push(`Created: ${formatTimestamp(project.createdAt)}`)
  }
  if (project.updatedAt) {
    lines.push(`Updated: ${formatTimestamp(project.updatedAt)}`)
  }
  return lines.join('\n')
}

function formatProjectListAttrs(project: ProjectSummary) {
  const attrs = [project.type === 'SENTIO' ? undefined : project.type, project.visibility].filter(Boolean)
  return attrs.join(', ')
}

function normalizeProjectList(data: unknown): ProjectSummary[] {
  if (Array.isArray(data)) {
    return data as ProjectSummary[]
  }
  if (data && typeof data === 'object') {
    const objectData = data as {
      projects?: ProjectSummary[]
      sharedProjects?: ProjectSummary[]
      orgProjects?: ProjectSummary[]
    }
    const combined = [
      ...(objectData.projects ?? []),
      ...(objectData.sharedProjects ?? []),
      ...(objectData.orgProjects ?? [])
    ]
    const deduped = new Map<string, ProjectSummary>()

    for (const project of combined) {
      const key = project.id ?? `${getOwnerName(project) ?? ''}/${project.slug ?? ''}`
      if (!deduped.has(key)) {
        deduped.set(key, project)
      }
    }

    return Array.from(deduped.values())
  }
  return []
}

function groupProjectsByOwner(projects: ProjectSummary[]) {
  const grouped = new Map<string, ProjectSummary[]>()
  for (const project of projects) {
    const owner = getOwnerName(project) ?? '<owner>'
    const existing = grouped.get(owner)
    if (existing) {
      existing.push(project)
      continue
    }
    grouped.set(owner, [project])
  }

  return Array.from(grouped.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([owner, ownerProjects]) => ({
      owner,
      projects: [...ownerProjects].sort((left, right) => (left.slug ?? '').localeCompare(right.slug ?? ''))
    }))
}

function normalizeProjectType(value?: string) {
  if (!value) {
    return 'SENTIO'
  }
  const normalized = value.toUpperCase()
  if (normalized === 'SENTIO' || normalized === 'SUBGRAPH' || normalized === 'ACTION') {
    return normalized
  }
  throw new CliError(`Invalid project type "${value}". Use sentio, subgraph, or action.`)
}

function normalizeProjectVisibility(value?: string) {
  if (!value) {
    return 'PRIVATE'
  }
  const normalized = value.toUpperCase()
  if (normalized === 'PRIVATE' || normalized === 'PUBLIC') {
    return normalized
  }
  throw new CliError(`Invalid visibility "${value}". Use private or public.`)
}

function formatTimestamp(value?: string) {
  if (!value) {
    return ''
  }
  if (/^\d{13}$/.test(value)) {
    return new Date(Number.parseInt(value, 10)).toISOString()
  }
  return value
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function getOwnerName(project: ProjectSummary) {
  if (typeof project.owner === 'string') {
    return project.owner
  }
  return project.ownerName ?? project.owner?.organization?.name ?? project.owner?.user?.username
}

function isProjectListOutput(data: unknown): data is ProjectListOutput {
  return !!data && typeof data === 'object' && Array.isArray((data as ProjectListOutput).projects)
}

async function getProjectsByOwner(ownerName: string, context: ReturnType<typeof createApiContext>) {
  try {
    const organizationResponse = await fetchApiJson<{
      organizations?: Array<{ id?: string; name?: string; projects?: ProjectSummary[] }>
    }>('/api/v1/organizations', context, { orgIdOrName: ownerName })
    const organization = organizationResponse.organizations?.find((entry) => entry.name === ownerName)
    if (organization) {
      const data = await fetchApiJson<unknown>('/api/v1/projects', context, { owner: ownerName })
      return normalizeProjectList(data)
    }
  } catch {}
  try {
    const userInfo = await fetchApiJson<{ id?: string; username?: string }>('/api/v1/users/info', context, {
      userName: ownerName
    })
    if (userInfo.id) {
      const data = await fetchApiJson<unknown>('/api/v1/projects', context, { owner: ownerName })
      return normalizeProjectList(data)
    }
  } catch {}

  throw new CliError(`Owner not found: ${ownerName}`)
}
