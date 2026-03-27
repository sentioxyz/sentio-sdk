import { ProcessorExtService, ProcessorService } from '@sentio/api'
import { Command, InvalidArgumentError } from '@commander-js/extra-typings'
import chalk from 'chalk'
import process from 'process'
import yaml from 'yaml'
import {
  CliError,
  createApiContext,
  handleCommandError,
  resolveProjectRef,
  unwrapApiResult,
  postApiJson,
  putApiJson
} from '../api.js'
import { confirm } from './upload.js'

interface ProcessorOptions {
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

interface ProcessorStatusOptions extends ProcessorOptions {
  version?: string
}

interface ProcessorSourceOptions extends ProcessorOptions {
  version?: number
  path?: string
}

interface ProcessorLogsOptions extends ProcessorOptions {
  limit?: number
  follow?: boolean
  logType?: string
  level?: string
  query?: string
}

export function createProcessorCommand() {
  const processorCommand = new Command('processor').description('Manage Sentio processor versions')
  processorCommand.addCommand(createProcessorStatusCommand())
  processorCommand.addCommand(createProcessorSourceCommand())
  processorCommand.addCommand(createProcessorActivatePendingCommand())
  processorCommand.addCommand(createProcessorPauseCommand())
  processorCommand.addCommand(createProcessorResumeCommand())
  processorCommand.addCommand(createProcessorStopCommand())
  processorCommand.addCommand(createProcessorLogsCommand())
  return processorCommand
}

function createProcessorStatusCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('status').description('Get processor status')))
  )
    .showHelpAfterError()
    .option('--version <selector>', 'Version selector: active, pending, or all')
    .action(async (options, command) => {
      try {
        await runProcessorStatus(options)
      } catch (error) {
        handleProcessorCommandError(error, command)
      }
    })
}

function createProcessorSourceCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('source').description('Get processor source files')))
  )
    .showHelpAfterError()
    .option('--version <version>', 'Processor version', parseInteger)
    .option('--path <path>', 'Show only one source file by path')
    .action(async (options, command) => {
      try {
        await runProcessorSource(options)
      } catch (error) {
        handleProcessorCommandError(error, command)
      }
    })
}

function createProcessorActivatePendingCommand() {
  return withOutputOptions(
    withSharedProjectOptions(
      withAuthOptions(new Command('activate-pending').description('Activate the pending version'))
    )
  )
    .showHelpAfterError()
    .option('-y, --yes', 'Bypass confirmation')
    .action(async (options, command) => {
      try {
        await runActivatePending(options)
      } catch (error) {
        handleProcessorCommandError(error, command)
      }
    })
}

function createProcessorPauseCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('pause').description('Pause a processor')))
  )
    .showHelpAfterError()
    .argument('[processorId]', 'ID of the processor')
    .option('--reason <reason>', 'Reason for pausing')
    .option('-y, --yes', 'Bypass confirmation')
    .action(async (processorId, options, command) => {
      try {
        await runProcessorPause(processorId, options)
      } catch (error) {
        handleProcessorCommandError(error, command)
      }
    })
}

function createProcessorResumeCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('resume').description('Resume a processor')))
  )
    .showHelpAfterError()
    .argument('[processorId]', 'ID of the processor')
    .option('-y, --yes', 'Bypass confirmation')
    .action(async (processorId, options, command) => {
      try {
        await runProcessorResume(processorId, options)
      } catch (error) {
        handleProcessorCommandError(error, command)
      }
    })
}

function createProcessorStopCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('stop').description('Stop a processor')))
  )
    .showHelpAfterError()
    .argument('[processorId]', 'ID of the processor')
    .option('-y, --yes', 'Bypass confirmation')
    .action(async (processorId, options, command) => {
      try {
        await runProcessorStop(processorId, options)
      } catch (error) {
        handleProcessorCommandError(error, command)
      }
    })
}

function createProcessorLogsCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('logs').description('View processor logs')))
  )
    .showHelpAfterError()
    .argument('[processorId]', 'ID of the processor (defaults to active processor)')
    .option('--limit <count>', 'Maximum number of log entries to fetch', parseInteger, 100)
    .option('-f, --follow', 'Poll for new log entries continuously')
    .option('--log-type <type>', 'Filter by log type (e.g. execution, system)')
    .option('--level <level>', 'Filter by log level: DEBUG, INFO, WARNING, ERROR')
    .option('--query <query>', 'Free-text filter query')
    .action(async (processorId, options, command) => {
      try {
        await runProcessorLogs(processorId, options)
      } catch (error) {
        handleProcessorCommandError(error, command)
      }
    })
}

async function runProcessorStatus(options: ProcessorStatusOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const requestedVersion = normalizeVersionSelector(options.version)
  const response = await ProcessorService.getProcessorStatusV2({
    path: {
      owner: project.owner,
      slug: project.slug
    },
    query: {
      version: requestedVersion ?? 'ALL'
    },
    headers: context.headers
  })
  const data = unwrapApiResult(response)
  if (!options.json) {
    printOutput(options, shapeProcessorStatusOutput(data, requestedVersion))
    return
  }
  printOutput(options, data)
}

async function runProcessorSource(options: ProcessorSourceOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const response = await ProcessorExtService.getProcessorSourceFiles({
    path: {
      owner: project.owner,
      slug: project.slug
    },
    query: {
      version: options.version
    },
    headers: context.headers
  })
  const data = unwrapApiResult(response)
  if (options.path && Array.isArray(data.sourceFiles)) {
    const sourceFile = data.sourceFiles.find((entry) => entry.path === options.path)
    if (!sourceFile) {
      throw new CliError(`Source file not found: ${options.path}`)
    }
    printOutput(options, sourceFile)
    return
  }
  printOutput(options, data)
}

async function runActivatePending(options: ProcessorOptions & { yes?: boolean }) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })

  const statusResponse = await ProcessorService.getProcessorStatusV2({
    path: {
      owner: project.owner,
      slug: project.slug
    },
    query: { version: 'ALL' },
    headers: context.headers
  })
  const data = unwrapApiResult(statusResponse)
  const processors = Array.isArray(data.processors) ? data.processors : []

  const activeProcessor = processors.find((p) => asString(p.versionState) === 'ACTIVE')
  const pendingProcessor = processors.find((p) => asString(p.versionState) === 'PENDING')

  if (!pendingProcessor) {
    throw new CliError(`No pending version found for project ${project.owner}/${project.slug}.`)
  }

  if (!options.yes) {
    let message = `Activate the pending version ${asNumber(pendingProcessor.version)}. Are you sure you want to proceed?`
    if (activeProcessor) {
      message = `Activate the pending version ${asNumber(pendingProcessor.version)} may obsolete the active version ${asNumber(activeProcessor.version)}. Are you sure you want to proceed?`
    }

    const isConfirmed = await confirm(message)
    if (!isConfirmed) {
      console.log('Activation cancelled.')
      return
    }
  }

  const response = await ProcessorService.activatePendingVersion({
    path: {
      owner: project.owner,
      slug: project.slug
    },
    headers: context.headers
  })
  printOutput(options, {
    project: `${project.owner}/${project.slug}`,
    ...(unwrapApiResult(response) as Record<string, unknown>)
  })
}

async function resolveAndConfirmProcessor(
  actionName: string,
  processorId: string | undefined,
  options: ProcessorOptions & { yes?: boolean }
): Promise<string | undefined> {
  const context = createApiContext(options)
  let resolvedProcessorId = processorId
  let versionToConfirm = ''

  if (!resolvedProcessorId) {
    const project = await resolveProjectRef(options, context, { ownerSlug: true })
    const statusResponse = await ProcessorService.getProcessorStatusV2({
      path: {
        owner: project.owner,
        slug: project.slug
      },
      query: { version: 'ACTIVE' },
      headers: context.headers
    })
    const data = unwrapApiResult(statusResponse)
    const processors = Array.isArray(data.processors) ? data.processors : []
    const activeProcessor = processors.find((p) => asString(p.versionState) === 'ACTIVE')

    if (!activeProcessor || !activeProcessor.processorId) {
      throw new CliError(
        `No active processor found for project ${project.owner}/${project.slug}. Please specify a processorId.`
      )
    }
    resolvedProcessorId = asString(activeProcessor.processorId)!
    versionToConfirm = `version ${asNumber(activeProcessor.version)} of project ${project.owner}/${project.slug}`
  } else {
    versionToConfirm = `processor ${resolvedProcessorId}`
  }

  if (!options.yes) {
    const isConfirmed = await confirm(`Are you sure you want to ${actionName} ${versionToConfirm}?`)
    if (!isConfirmed) {
      console.log(`${actionName.charAt(0).toUpperCase() + actionName.slice(1)} cancelled.`)
      return undefined
    }
  }

  return resolvedProcessorId
}

async function runProcessorPause(
  processorId: string | undefined,
  options: ProcessorOptions & { reason?: string; yes?: boolean }
) {
  const resolvedProcessorId = await resolveAndConfirmProcessor('pause', processorId, options)
  if (!resolvedProcessorId) return
  const context = createApiContext(options)
  const response = await putApiJson(`/api/v1/processors/${resolvedProcessorId}/pause`, context, {
    reason: options.reason
  })
  printOutput(options, { processorId: resolvedProcessorId, action: 'paused', ...(response as Record<string, unknown>) })
}

async function runProcessorResume(processorId: string | undefined, options: ProcessorOptions & { yes?: boolean }) {
  const resolvedProcessorId = await resolveAndConfirmProcessor('resume', processorId, options)
  if (!resolvedProcessorId) return
  const context = createApiContext(options)
  const response = await putApiJson(`/api/v1/processors/${resolvedProcessorId}/resume`, context)
  printOutput(options, {
    processorId: resolvedProcessorId,
    action: 'resumed',
    ...(response as Record<string, unknown>)
  })
}

async function runProcessorStop(processorId: string | undefined, options: ProcessorOptions & { yes?: boolean }) {
  const resolvedProcessorId = await resolveAndConfirmProcessor('stop', processorId, options)
  if (!resolvedProcessorId) return
  const context = createApiContext(options)
  const response = await postApiJson(`/api/v1/processors/stop`, context, { processorId: resolvedProcessorId })
  printOutput(options, {
    processorId: resolvedProcessorId,
    action: 'stopped',
    ...(response as Record<string, unknown>)
  })
}

async function resolveProcessorId(processorId: string | undefined, options: ProcessorOptions): Promise<string> {
  if (processorId) return processorId
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const statusResponse = await ProcessorService.getProcessorStatusV2({
    path: { owner: project.owner, slug: project.slug },
    query: { version: 'ACTIVE' },
    headers: context.headers
  })
  const data = unwrapApiResult(statusResponse)
  const processors = Array.isArray(data.processors) ? data.processors : []
  const activeProcessor = processors.find((p) => asString(p.versionState) === 'ACTIVE')
  if (!activeProcessor || !activeProcessor.processorId) {
    throw new CliError(
      `No active processor found for project ${project.owner}/${project.slug}. Please specify a processorId.`
    )
  }
  return asString(activeProcessor.processorId)!
}

async function runProcessorLogs(processorId: string | undefined, options: ProcessorLogsOptions) {
  const resolvedProcessorId = await resolveProcessorId(processorId, options)
  const context = createApiContext(options)

  if (options.follow && !options.json && !options.yaml) {
    await followProcessorLogs(resolvedProcessorId, context, options)
    return
  }

  const response = await postApiJson<ProcessorLogsResponse>(
    `/api/v1/processors/${resolvedProcessorId}/logs`,
    context,
    buildLogsRequestBody(resolvedProcessorId, options)
  )
  printOutput(options, response)
}

async function followProcessorLogs(
  processorId: string,
  context: ReturnType<typeof createApiContext>,
  options: ProcessorLogsOptions
) {
  let until: unknown[] | undefined
  let running = true
  const seenIds = new Set<string>()

  process.on('SIGINT', () => {
    running = false
  })

  while (running) {
    try {
      const body = { ...buildLogsRequestBody(processorId, options), until }
      const response = await postApiJson<ProcessorLogsResponse>(`/api/v1/processors/${processorId}/logs`, context, body)
      const entries = Array.isArray(response.logs) ? response.logs : []
      for (const entry of entries) {
        const e = entry as ProcessorLog
        const id = e.id ?? ''
        if (id && seenIds.has(id)) continue
        if (id) seenIds.add(id)
        process.stdout.write(formatLogEntry(e) + '\n')
      }
      if (response.until) {
        until = response.until
      }
    } catch {
      // Ignore transient fetch errors during follow mode
    }
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
}

function buildLogsRequestBody(processorId: string, options: ProcessorLogsOptions): Record<string, unknown> {
  const body: Record<string, unknown> = { processorId, limit: options.limit }
  if (options.logType) {
    body.logTypeFilters = [options.logType]
  }
  if (options.level || options.query) {
    const parts: string[] = []
    if (options.level) parts.push(options.level.toUpperCase())
    if (options.query) parts.push(options.query)
    body.query = parts.join(' ')
  }
  return body
}

interface ProcessorLog {
  id?: string
  message?: string
  timestamp?: string
  attributes?: Record<string, unknown>
  logType?: string
  level?: string
  highlightedMessage?: string
  chainId?: string
}

interface ProcessorLogsResponse {
  logs?: ProcessorLog[]
  until?: unknown[]
  total?: string
}

function formatLogEntry(entry: ProcessorLog): string {
  const formattedTime = entry.timestamp ? chalk.gray(entry.timestamp.replace('T', ' ').replace('Z', '')) : ''
  const level = (entry.level ?? 'INFO').toUpperCase()
  const logType = entry.logType ? chalk.gray(`[${entry.logType}]`) : ''
  const coloredLevel = colorSeverity(level)
  const message = entry.message ?? ''
  const chain = entry.chainId ? chalk.gray(`(chain=${entry.chainId})`) : ''

  return [formattedTime, coloredLevel, logType, message, chain].filter(Boolean).join(' ')
}

function colorSeverity(severity: string): string {
  switch (severity) {
    case 'ERROR':
      return chalk.red(`[${severity}]`)
    case 'WARNING':
    case 'WARN':
      return chalk.yellow(`[${severity}]`)
    case 'DEBUG':
      return chalk.gray(`[${severity}]`)
    default:
      return chalk.cyan(`[${severity}]`)
  }
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

function handleProcessorCommandError(error: unknown, command?: Command) {
  if (
    error instanceof CliError &&
    (error.message.startsWith('Project is required.') ||
      error.message.startsWith('Invalid project ') ||
      error.message.startsWith('Invalid version selector ') ||
      error.message.startsWith('Source file not found:'))
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

function printOutput(options: ProcessorOptions, data: unknown) {
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
  if (data && typeof data === 'object' && Array.isArray((data as { processors?: unknown[] }).processors)) {
    const processors = (data as { processors: Array<Record<string, unknown>> }).processors
    const lines = [`Processor versions (${processors.length})`]
    const groupedProcessors = groupProcessorsByVersionState(processors)
    for (const group of groupedProcessors) {
      lines.push(`${group.versionState} (${group.processors.length})`)
      for (const processor of group.processors) {
        const version = asNumber(processor.version)
        const processorStatus = processor.processorStatus as Record<string, unknown> | undefined
        const statusState = asString(processorStatus?.state) ?? 'UNKNOWN'
        const uploadedAt = asString(processor.uploadedAt)
        lines.push(`- v${version ?? '?'} status=${statusState}${uploadedAt ? ` uploaded=${uploadedAt}` : ''}`)
        if (asString(processor.processorId)) {
          lines.push(`  processorId: ${asString(processor.processorId)}`)
        }
        const states = Array.isArray(processor.states) ? processor.states : []
        for (const stateEntry of states.slice(0, 5)) {
          const state = stateEntry as Record<string, unknown>
          const chainId = asString(state.chainId) ?? '?'
          const stateStatus = state.status as Record<string, unknown> | undefined
          const chainState = asString(stateStatus?.state) ?? 'UNKNOWN'
          const block = asString(state.processedBlockNumber) ?? '?'
          lines.push(`  chain ${chainId}: ${chainState} block=${block}`)
          const errorRecord = stateStatus?.errorRecord as Record<string, unknown> | undefined
          const chainError = asString(errorRecord?.message)
          if (chainError) {
            const createdAt = asString(errorRecord?.createdAt)
            const prefix = createdAt ? `[${createdAt}] ` : ''
            lines.push(`  error: ${prefix}${chainError}`)
          }
        }
        if (states.length > 5) {
          lines.push(`  ... ${states.length - 5} more chains`)
        }
      }
    }
    return lines.join('\n')
  }

  if (data && typeof data === 'object' && Array.isArray((data as { sourceFiles?: unknown[] }).sourceFiles)) {
    const sourceFiles = (data as { sourceFiles: Array<Record<string, unknown>> }).sourceFiles
    const lines = [`Source files (${sourceFiles.length})`]
    for (const file of sourceFiles) {
      lines.push(`- ${asString(file.path) ?? '<unknown>'}`)
    }
    return lines.join('\n')
  }

  if (data && typeof data === 'object' && 'path' in (data as Record<string, unknown>)) {
    const file = data as Record<string, unknown>
    return [`File: ${asString(file.path) ?? '<unknown>'}`, '', asString(file.content) ?? ''].join('\n')
  }

  if (data && typeof data === 'object' && 'project' in (data as Record<string, unknown>)) {
    const objectData = data as Record<string, unknown>
    return `Pending processor version activated for ${asString(objectData.project) ?? '<project>'}.`
  }

  if (
    data &&
    typeof data === 'object' &&
    'action' in (data as Record<string, unknown>) &&
    'processorId' in (data as Record<string, unknown>)
  ) {
    const objectData = data as Record<string, unknown>
    return `Processor ${asString(objectData.processorId)} successfully ${asString(objectData.action)}.`
  }

  if (data && typeof data === 'object' && 'logs' in (data as Record<string, unknown>)) {
    const logsData = data as ProcessorLogsResponse
    const entries = Array.isArray(logsData.logs) ? logsData.logs : []
    if (entries.length === 0) {
      return 'No logs found.'
    }
    return entries.map((entry) => formatLogEntry(entry)).join('\n')
  }

  return JSON.stringify(data, null, 2)
}

function normalizeVersionSelector(value?: string): 'ACTIVE' | 'PENDING' | 'ALL' | undefined {
  if (!value) {
    return undefined
  }
  const normalized = value.toUpperCase()
  if (normalized === 'ACTIVE' || normalized === 'PENDING' || normalized === 'ALL') {
    return normalized
  }
  throw new CliError(`Invalid version selector "${value}". Use active, pending, or all.`)
}

function parseInteger(value: string) {
  const parsedValue = Number.parseInt(value, 10)
  if (Number.isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.')
  }
  return parsedValue
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function asNumber(value: unknown) {
  return typeof value === 'number' ? value : undefined
}

function shapeProcessorStatusOutput(
  data: { processors?: Array<Record<string, unknown>> },
  versionSelector?: 'ACTIVE' | 'PENDING' | 'ALL'
) {
  const processors = Array.isArray(data.processors) ? data.processors : []
  if (versionSelector === 'ALL') {
    return { ...data, processors }
  }
  if (versionSelector === 'ACTIVE' || versionSelector === 'PENDING') {
    return {
      ...data,
      processors: processors.filter((processor) => asString(processor.versionState) === versionSelector)
    }
  }
  return {
    ...data,
    processors: processors.filter((processor) => {
      const versionState = asString(processor.versionState)
      return versionState === 'ACTIVE' || versionState === 'PENDING'
    })
  }
}

function groupProcessorsByVersionState(processors: Array<Record<string, unknown>>) {
  const grouped = new Map<string, Array<Record<string, unknown>>>()
  for (const processor of processors) {
    const versionState = asString(processor.versionState) ?? 'UNKNOWN'
    const existing = grouped.get(versionState)
    if (existing) {
      existing.push(processor)
      continue
    }
    grouped.set(versionState, [processor])
  }

  const order = ['ACTIVE', 'PENDING', 'OBSOLETE', 'UNKNOWN']
  return Array.from(grouped.entries())
    .sort((left, right) => {
      const leftIndex = order.indexOf(left[0])
      const rightIndex = order.indexOf(right[0])
      return (leftIndex === -1 ? order.length : leftIndex) - (rightIndex === -1 ? order.length : rightIndex)
    })
    .map(([versionState, groupedProcessors]) => ({
      versionState,
      processors: [...groupedProcessors].sort(
        (left, right) => (asNumber(right.version) ?? 0) - (asNumber(left.version) ?? 0)
      )
    }))
}
