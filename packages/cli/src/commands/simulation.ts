import { Command, InvalidArgumentError } from '@commander-js/extra-typings'
import process from 'process'
import yaml from 'yaml'
import { DebugAndSimulationService } from '@sentio/api'
import {
  CliError,
  createApiContext,
  handleCommandError,
  loadJsonInput,
  resolveProjectRef,
  unwrapApiResult
} from '../api.js'

interface SimulationOptions {
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

interface SimulationListOptions extends SimulationOptions {
  labelContains?: string
  page?: number
  pageSize?: number
}

interface SimulationRunOptions extends SimulationOptions {
  chainId?: string
  file?: string
  stdin?: boolean
}

interface SimulationTraceOptions extends SimulationOptions {
  chainId?: string
  withInternalCalls?: boolean
  disableOptimizer?: boolean
  ignoreGasCost?: boolean
}

export function createSimulationCommand() {
  const simulationCommand = new Command('simulation').description('Manage Sentio Solidity simulations')
  simulationCommand.addCommand(createSimulationListCommand())
  simulationCommand.addCommand(createSimulationGetCommand())
  simulationCommand.addCommand(createSimulationBundleCommand())
  simulationCommand.addCommand(createSimulationRunCommand())
  simulationCommand.addCommand(createSimulationRunBundleCommand())
  simulationCommand.addCommand(createSimulationTraceCommand())
  return simulationCommand
}

function createSimulationListCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('list').description('List simulations in a project')))
  )
    .showHelpAfterError()
    .option('--label-contains <text>', 'Filter by label substring')
    .option('--page <page>', 'Page number', parseInteger)
    .option('--page-size <count>', 'Page size', parseInteger)
    .action(async (options, command) => {
      try {
        await runSimulationList(options)
      } catch (error) {
        handleSimulationCommandError(error, command)
      }
    })
}

function createSimulationGetCommand() {
  return withOutputOptions(
    withSharedProjectOptions(
      withAuthOptions(new Command('get').description('Get a simulation').argument('<simulation-id>'))
    )
  )
    .showHelpAfterError()
    .action(async (simulationId, options, command) => {
      try {
        await runSimulationGet(simulationId, options)
      } catch (error) {
        handleSimulationCommandError(error, command)
      }
    })
}

function createSimulationBundleCommand() {
  const bundleCommand = new Command('bundle').description('Get simulation bundles')
  bundleCommand.addCommand(
    withOutputOptions(
      withSharedProjectOptions(
        withAuthOptions(new Command('get').description('Get a simulation bundle').argument('<bundle-id>'))
      )
    )
      .showHelpAfterError()
      .action(async (bundleId, options, command) => {
        try {
          await runSimulationBundleGet(bundleId, options)
        } catch (error) {
          handleSimulationCommandError(error, command)
        }
      })
  )
  return bundleCommand
}

function createSimulationRunCommand() {
  return withOutputOptions(
    withJsonInputOptions(
      withSharedProjectOptions(withAuthOptions(new Command('run').description('Run a transaction simulation')))
    )
  )
    .showHelpAfterError()
    .option('--chain-id <id>', 'Chain id')
    .addHelpText(
      'after',
      `

Examples:
  $ sentio simulation run --project sentio/coinbase --chain-id 1 --file simulation.yaml
`
    )
    .action(async (options, command) => {
      try {
        await runSimulation(options)
      } catch (error) {
        handleSimulationCommandError(error, command)
      }
    })
}

function createSimulationRunBundleCommand() {
  return withOutputOptions(
    withJsonInputOptions(
      withSharedProjectOptions(withAuthOptions(new Command('run-bundle').description('Run a bundle simulation')))
    )
  )
    .showHelpAfterError()
    .option('--chain-id <id>', 'Chain id')
    .action(async (options, command) => {
      try {
        await runSimulationBundle(options)
      } catch (error) {
        handleSimulationCommandError(error, command)
      }
    })
}

function createSimulationTraceCommand() {
  const traceCommand = new Command('trace').description('Fetch call traces')
  traceCommand.addCommand(createSimulationTraceBySimulationCommand())
  traceCommand.addCommand(createSimulationTraceByBundleCommand())
  traceCommand.addCommand(createSimulationTraceByTxCommand())
  return traceCommand
}

function createSimulationTraceBySimulationCommand() {
  return withOutputOptions(
    withTraceOptions(
      withSharedProjectOptions(
        withAuthOptions(new Command('simulation').description('Get trace by simulation').argument('<simulation-id>'))
      )
    )
  )
    .showHelpAfterError()
    .action(async (simulationId, options, command) => {
      try {
        await runTraceBySimulation(simulationId, options)
      } catch (error) {
        handleSimulationCommandError(error, command)
      }
    })
}

function createSimulationTraceByBundleCommand() {
  return withOutputOptions(
    withTraceOptions(
      withSharedProjectOptions(
        withAuthOptions(new Command('bundle').description('Get trace by bundle').argument('<bundle-id>'))
      )
    )
  )
    .showHelpAfterError()
    .action(async (bundleId, options, command) => {
      try {
        await runTraceByBundle(bundleId, options)
      } catch (error) {
        handleSimulationCommandError(error, command)
      }
    })
}

function createSimulationTraceByTxCommand() {
  return withOutputOptions(
    withTraceOptions(
      withSharedProjectOptions(
        withAuthOptions(new Command('tx').description('Get trace by transaction').argument('<tx-hash>'))
      )
    )
  )
    .showHelpAfterError()
    .action(async (txHash, options, command) => {
      try {
        await runTraceByTransaction(txHash, options)
      } catch (error) {
        handleSimulationCommandError(error, command)
      }
    })
}

async function runSimulationList(options: SimulationListOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const response = await DebugAndSimulationService.getSimulations({
    path: {
      owner: project.owner,
      slug: project.slug
    },
    query: {
      labelContains: options.labelContains,
      page: options.page,
      pageSize: options.pageSize
    },
    headers: context.headers
  })
  printOutput(options, unwrapApiResult(response))
}

async function runSimulationGet(simulationId: string, options: SimulationOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const response = await DebugAndSimulationService.getSimulation({
    path: {
      owner: project.owner,
      slug: project.slug,
      simulationId
    },
    headers: context.headers
  })
  printOutput(options, unwrapApiResult(response))
}

async function runSimulationBundleGet(bundleId: string, options: SimulationOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const response = await DebugAndSimulationService.getSimulationBundleInProject({
    path: {
      owner: project.owner,
      slug: project.slug,
      bundleId
    },
    headers: context.headers
  })
  printOutput(options, unwrapApiResult(response))
}

async function runSimulation(options: SimulationRunOptions) {
  const body = loadJsonInput(options)
  if (!body) {
    throw new CliError('Provide --file or --stdin for simulation run.')
  }
  if (!options.chainId) {
    throw new CliError('Chain id is required. Use --chain-id <id>.')
  }
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const response = await DebugAndSimulationService.simulateTransaction({
    path: {
      owner: project.owner,
      slug: project.slug,
      chainId: options.chainId
    },
    body: body as never,
    headers: context.headers
  })
  printOutput(options, unwrapApiResult(response))
}

async function runSimulationBundle(options: SimulationRunOptions) {
  const body = loadJsonInput(options)
  if (!body) {
    throw new CliError('Provide --file or --stdin for simulation run-bundle.')
  }
  if (!options.chainId) {
    throw new CliError('Chain id is required. Use --chain-id <id>.')
  }
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const response = await DebugAndSimulationService.simulateTransactionBundle({
    path: {
      owner: project.owner,
      slug: project.slug,
      chainId: options.chainId
    },
    body: body as never,
    headers: context.headers
  })
  printOutput(options, unwrapApiResult(response))
}

async function runTraceBySimulation(simulationId: string, options: SimulationTraceOptions) {
  await runTrace(options, (project, context) =>
    DebugAndSimulationService.getCallTraceBySimulation({
      path: {
        owner: project.owner,
        slug: project.slug,
        chainId: options.chainId!,
        simulationId
      },
      query: buildTraceQuery(options),
      headers: context.headers
    })
  )
}

async function runTraceByBundle(bundleId: string, options: SimulationTraceOptions) {
  await runTrace(options, (project, context) =>
    DebugAndSimulationService.getCallTraceByBundle({
      path: {
        owner: project.owner,
        slug: project.slug,
        chainId: options.chainId!,
        bundleId
      },
      query: buildTraceQuery(options),
      headers: context.headers
    })
  )
}

async function runTraceByTransaction(txHash: string, options: SimulationTraceOptions) {
  await runTrace(options, (project, context) =>
    DebugAndSimulationService.getCallTraceByTransaction({
      path: {
        owner: project.owner,
        slug: project.slug,
        chainId: options.chainId!,
        txHash
      },
      query: buildTraceQuery(options),
      headers: context.headers
    })
  )
}

async function runTrace(
  options: SimulationTraceOptions,
  operation: (
    project: Awaited<ReturnType<typeof resolveProjectRef>>,
    context: ReturnType<typeof createApiContext>
  ) => Promise<unknown>
) {
  if (!options.chainId) {
    throw new CliError('Chain id is required. Use --chain-id <id>.')
  }
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const data = unwrapApiResult((await operation(project, context)) as never)
  printOutput(options, data)
}

function buildTraceQuery(options: SimulationTraceOptions) {
  return {
    withInternalCalls: options.withInternalCalls,
    disableOptimizer: options.disableOptimizer,
    ignoreGasCost: options.ignoreGasCost
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

function withJsonInputOptions<T extends Command<any, any, any>>(command: T) {
  return command
    .option('--file <path>', 'Read request JSON or YAML from file')
    .option('--stdin', 'Read request JSON or YAML from stdin')
}

function withOutputOptions<T extends Command<any, any, any>>(command: T) {
  return command.option('--json', 'Print raw JSON response').option('--yaml', 'Print raw YAML response')
}

function withTraceOptions<T extends Command<any, any, any>>(command: T) {
  return command
    .option('--chain-id <id>', 'Chain id')
    .option('--with-internal-calls', 'Fetch decoded trace with internal calls')
    .option('--disable-optimizer', 'Disable optimizer for more accurate internal calls')
    .option('--ignore-gas-cost', 'Ignore gas cost when optimizer is disabled')
}

function handleSimulationCommandError(error: unknown, command?: Command) {
  if (
    error instanceof CliError &&
    (error.message.startsWith('Project is required.') ||
      error.message.startsWith('Invalid project ') ||
      error.message.startsWith('Provide --file or --stdin for simulation run') ||
      error.message.startsWith('Chain id is required. Use --chain-id <id>.'))
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

function printOutput(options: SimulationOptions, data: unknown) {
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
  if (data && typeof data === 'object' && Array.isArray((data as { simulations?: unknown[] }).simulations)) {
    const simulations = (data as { simulations: Array<Record<string, unknown>> }).simulations
    const lines = [`Simulations (${simulations.length})`]
    for (const simulation of simulations) {
      lines.push(formatSimulationLine(simulation))
    }
    return lines.join('\n')
  }

  if (data && typeof data === 'object' && 'simulation' in (data as Record<string, unknown>)) {
    const simulation = (data as { simulation?: Record<string, unknown> }).simulation
    return simulation ? formatSimulationDetails(simulation) : JSON.stringify(data, null, 2)
  }

  if (data && typeof data === 'object' && 'bundleId' in (data as Record<string, unknown>)) {
    const bundle = data as { bundleId?: string; simulations?: Array<Record<string, unknown>>; error?: string }
    const lines = [`Bundle: ${bundle.bundleId ?? '<bundle>'}`]
    if (bundle.error) {
      lines.push(`Error: ${bundle.error}`)
    }
    const simulations = Array.isArray(bundle.simulations) ? bundle.simulations : []
    if (simulations.length > 0) {
      lines.push(`Simulations (${simulations.length})`)
      for (const simulation of simulations) {
        lines.push(formatSimulationLine(simulation))
      }
    }
    return lines.join('\n')
  }

  if (
    data &&
    typeof data === 'object' &&
    ('contentType' in (data as Record<string, unknown>) || 'data' in (data as Record<string, unknown>))
  ) {
    const body = data as { contentType?: string; data?: string }
    const lines = ['Trace']
    if (body.contentType) {
      lines.push(`Content-Type: ${body.contentType}`)
    }
    if (body.data) {
      lines.push(body.data)
    }
    return lines.join('\n')
  }

  return JSON.stringify(data, null, 2)
}

function formatSimulationLine(simulation: Record<string, unknown>) {
  const id = asString(simulation.id) ?? '<simulation>'
  const label = asString(simulation.label)
  const chainId =
    asString(simulation.chainId) ??
    asString((simulation.chainSpec as Record<string, unknown> | undefined)?.chainId) ??
    '?'
  const from = asString(simulation.from) ?? '?'
  const to = asString(simulation.to) ?? '?'
  return `- ${id}${label ? ` "${label}"` : ''} chain=${chainId} from=${from} to=${to}`
}

function formatSimulationDetails(simulation: Record<string, unknown>) {
  const lines = [formatSimulationLine(simulation)]
  if (asString(simulation.bundleId)) {
    lines.push(`Bundle ID: ${asString(simulation.bundleId)}`)
  }
  if (asString(simulation.blockNumber)) {
    lines.push(`Block: ${asString(simulation.blockNumber)}`)
  }
  if (asString(simulation.transactionIndex)) {
    lines.push(`Transaction index: ${asString(simulation.transactionIndex)}`)
  }
  if (asString(simulation.value)) {
    lines.push(`Value: ${asString(simulation.value)}`)
  }
  return lines.join('\n')
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
