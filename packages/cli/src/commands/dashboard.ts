import { WebService } from '@sentio/api'
import { Command } from '@commander-js/extra-typings'
import process from 'process'
import yaml from 'yaml'
import {
  CliError,
  createApiContext,
  handleCommandError,
  loadJsonInput,
  postApiJson,
  resolveProjectRef,
  unwrapApiResult
} from '../api.js'
import { buildEventsInsightQueryBody, buildMetricsInsightQueryBody } from './data.js'

interface DashboardOptions {
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

interface DashboardImportOptions extends DashboardOptions {
  file?: string
  stdin?: boolean
  overrideLayouts?: boolean
}

interface DashboardCreateOptions extends DashboardOptions {
  title?: string
  file?: string
  stdin?: boolean
}

interface AddPanelOptions extends DashboardOptions {
  panelName?: string
  type?: string
  sql?: string
  size?: number
  event?: string
  metric?: string
  alias?: string
  sourceName?: string
  filter?: string[]
  groupBy?: string[]
  aggr?: string
  func?: string[]
  timeRangeStart?: string
  timeRangeEnd?: string
  timeRangeStep?: string
}

export function createDashboardCommand() {
  const dashboardCommand = new Command('dashboard').description('Manage Sentio dashboards')
  dashboardCommand.addCommand(createDashboardListCommand())
  dashboardCommand.addCommand(createDashboardCreateCommand())
  dashboardCommand.addCommand(createDashboardExportCommand())
  dashboardCommand.addCommand(createDashboardImportCommand())
  dashboardCommand.addCommand(createDashboardAddPanelCommand())
  return dashboardCommand
}

function createDashboardListCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('list').description('List dashboards for a project')))
  )
    .showHelpAfterError()
    .action(async (options, command) => {
      try {
        await runDashboardList(options)
      } catch (error) {
        handleDashboardCommandError(error, command)
      }
    })
}

function createDashboardCreateCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('create').description('Create a dashboard for a project')))
  )
    .showHelpAfterError()
    .requiredOption('--title <name>', 'Dashboard title')
    .option('--file <path>', 'Read initial dashboard JSON or YAML from file')
    .option('--stdin', 'Read initial dashboard JSON or YAML from stdin')
    .action(async (options, command) => {
      try {
        await runDashboardCreate(options)
      } catch (error) {
        handleDashboardCommandError(error, command)
      }
    })
}

function createDashboardExportCommand() {
  return withOutputOptions(
    withSharedProjectOptions(
      withAuthOptions(
        new Command('export').description('Export a dashboard as JSON').argument('<dashboardId>', 'Dashboard ID')
      )
    )
  )
    .showHelpAfterError()
    .action(async (dashboardId, options, command) => {
      try {
        await runDashboardExport(dashboardId, options)
      } catch (error) {
        handleDashboardCommandError(error, command)
      }
    })
}

function createDashboardImportCommand() {
  return withOutputOptions(
    withSharedProjectOptions(
      withAuthOptions(
        new Command('import')
          .description('Import dashboard data from a JSON file into an existing dashboard')
          .argument('<dashboardId>', 'Target dashboard ID to import into')
      )
    )
  )
    .showHelpAfterError()
    .option('--file <path>', 'Read dashboard JSON from file')
    .option('--stdin', 'Read dashboard JSON from stdin')
    .option('--override-layouts', 'Override the layout of the target dashboard')
    .action(async (dashboardId, options, command) => {
      try {
        await runDashboardImport(dashboardId, options)
      } catch (error) {
        handleDashboardCommandError(error, command)
      }
    })
}

function createDashboardAddPanelCommand() {
  return withOutputOptions(
    withSharedProjectOptions(
      withAuthOptions(
        new Command('add-panel')
          .description('Add a panel to a dashboard (SQL or insights query)')
          .argument('<dashboardId>', 'Dashboard ID')
      )
    )
  )
    .showHelpAfterError()
    .requiredOption('--panel-name <name>', 'Panel name')
    .requiredOption('--type <type>', 'Chart type: TABLE, LINE, BAR, PIE, QUERY_VALUE, AREA, BAR_GAUGE, SCATTER')
    .option('--sql <query>', 'SQL query (plain SQL — automatically wrapped into the required format)')
    .option('--size <count>', 'SQL query result size limit (default: 100)')
    .option('--event <name>', 'Event name for an insights panel (mutually exclusive with --sql and --metric)')
    .option('--metric <name>', 'Metric name for an insights panel (mutually exclusive with --sql and --event)')
    .option('--alias <alias>', 'Alias for the insights query')
    .option('--source-name <name>', 'Source name for the insights query')
    .option(
      '--filter <selector>',
      'Event filter or metric label selector like field:value or amount>0',
      collectOption,
      []
    )
    .option('--group-by <field>', 'Group by event property or metric label', collectOption, [])
    .option('--aggr <aggregation>', 'Event: total|unique|AAU|DAU|WAU|MAU. Metric: avg|sum|min|max|count')
    .option('--func <function>', 'Function like topk(1), bottomk(1)', collectOption, [])
    .option(
      '--time-range-start <value>',
      'Panel time range start: relative (e.g. -24h, -7d, -30m) or ISO date (e.g. 2024-01-01T00:00:00Z)'
    )
    .option(
      '--time-range-end <value>',
      'Panel time range end: relative (e.g. now, -1h) or ISO date. Defaults to now when --time-range-start is set.'
    )
    .option('--time-range-step <seconds>', 'Panel time range step in seconds (e.g. 3600)')
    .addHelpText(
      'after',
      `

Data source: use exactly one of --sql, --event, or --metric.

SQL panel examples:
  $ sentio dashboard add-panel abc123 --project owner/slug \\
      --panel-name "Top Holders" --type TABLE \\
      --sql "SELECT * FROM CoinBalance ORDER BY balance DESC LIMIT 50"
  $ sentio dashboard add-panel abc123 --project owner/slug \\
      --panel-name "Daily Volume" --type LINE \\
      --sql "SELECT toStartOfDay(timestamp) as date, sum(amount) as volume FROM Transfer GROUP BY date ORDER BY date"

Event insights panel examples:
  $ sentio dashboard add-panel abc123 --project owner/slug \\
      --panel-name "Transfer Count" --type LINE \\
      --event Transfer --aggr total
  $ sentio dashboard add-panel abc123 --project owner/slug \\
      --panel-name "Large Transfers" --type TABLE \\
      --event Transfer --filter amount>1000 --aggr total --group-by meta.address
  $ sentio dashboard add-panel abc123 --project owner/slug \\
      --panel-name "Top 5 Senders" --type BAR \\
      --event Transfer --aggr unique --group-by from --func 'topk(5)'
  $ sentio dashboard add-panel abc123 --project owner/slug \\
      --panel-name "DAU" --type LINE \\
      --event Transfer --aggr DAU

Metric insights panel examples:
  $ sentio dashboard add-panel abc123 --project owner/slug \\
      --panel-name "ETH Price" --type LINE \\
      --metric cbETH_price
  $ sentio dashboard add-panel abc123 --project owner/slug \\
      --panel-name "Avg Burn by Chain" --type BAR \\
      --metric burn --filter meta.chain=1 --aggr avg --group-by meta.address
  $ sentio dashboard add-panel abc123 --project owner/slug \\
      --panel-name "Burn Rate Delta" --type LINE \\
      --metric burn --aggr sum

Panel time range override examples:
  $ sentio dashboard add-panel abc123 --project owner/slug \\
      --panel-name "Last 24h Transfers" --type LINE \\
      --event Transfer --aggr total \\
      --time-range-start -24h --time-range-end now --time-range-step 3600
  $ sentio dashboard add-panel abc123 --project owner/slug \\
      --panel-name "Jan 2024 Volume" --type BAR \\
      --sql "SELECT date, sum(amount) FROM Transfer GROUP BY date" \\
      --time-range-start 2024-01-01T00:00:00Z --time-range-end 2024-02-01T00:00:00Z
`
    )
    .action(async (dashboardId, options, command) => {
      try {
        await runDashboardAddPanel(dashboardId, options)
      } catch (error) {
        handleDashboardCommandError(error, command)
      }
    })
}

async function runDashboardList(options: DashboardOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const response = await WebService.listDashboards2({
    path: { owner: project.owner, slug: project.slug },
    headers: context.headers
  })
  const data = unwrapApiResult(response)
  printOutput(options, data)
}

async function runDashboardCreate(options: DashboardCreateOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const body = buildDashboardCreateBody(options, project)
  const data = await postApiJson<{ dashboard?: Record<string, unknown> }>('/v1/dashboards', context, body)

  printOutput(options, {
    message: `Dashboard "${options.title}" created`,
    dashboard: data.dashboard ?? data
  })
}

async function runDashboardExport(dashboardId: string, options: DashboardOptions) {
  const context = createApiContext(options)
  const response = await WebService.exportDashboard({
    path: { dashboardId },
    headers: context.headers
  })
  const data = unwrapApiResult(response)
  // Export always outputs JSON regardless of --yaml flag, since the exported data is meant to be re-imported
  console.log(JSON.stringify(data.dashboardJson ?? data, null, 2))
}

async function runDashboardImport(dashboardId: string, options: DashboardImportOptions) {
  const context = createApiContext(options)
  const input = loadJsonInput(options)
  if (!input) {
    throw new CliError('Provide --file or --stdin with the dashboard JSON to import.')
  }

  const dashboardJson = typeof input === 'object' ? (input as Record<string, unknown>) : {}

  const response = await WebService.importDashboard({
    body: {
      dashboardId,
      dashboardJson,
      overrideLayouts: options.overrideLayouts
    },
    headers: context.headers
  })
  const data = unwrapApiResult(response)
  printOutput(options, { message: `Dashboard imported into ${dashboardId}`, dashboard: data.dashboard })
}

function buildDashboardCreateBody(options: DashboardCreateOptions, project: { owner: string; slug: string }) {
  const input = loadJsonInput(options)
  const initialDashboard = normalizeDashboardInit(input)

  return {
    name: options.title,
    projectOwner: project.owner,
    projectSlug: project.slug,
    ...initialDashboard
  }
}

function normalizeDashboardInit(input: unknown) {
  const emptyLayouts = {
    responsiveLayouts: {
      lg: { layouts: [] },
      md: { layouts: [] },
      sm: { layouts: [] },
      xs: { layouts: [] }
    }
  }

  if (input === undefined) {
    return {
      panels: {},
      layouts: emptyLayouts
    }
  }

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new CliError('Dashboard initialization data must be a JSON or YAML object.')
  }

  const dashboard = input as Record<string, unknown>
  return {
    panels: isRecord(dashboard.panels) ? dashboard.panels : {},
    layouts: isRecord(dashboard.layouts) ? dashboard.layouts : emptyLayouts
  }
}

async function runDashboardAddPanel(dashboardId: string, options: AddPanelOptions) {
  const context = createApiContext(options)

  // Validate: exactly one data source
  const selectedSources = [Boolean(options.sql), Boolean(options.event), Boolean(options.metric)].filter(Boolean).length
  if (selectedSources === 0) {
    throw new CliError('Provide exactly one data source: --sql, --event, or --metric.')
  }
  if (selectedSources > 1) {
    throw new CliError('Use exactly one of --sql, --event, or --metric.')
  }

  // 1. Fetch current dashboard to determine layout positions
  const getResponse = await WebService.getDashboard({
    path: { dashboardId },
    headers: context.headers
  })
  const dashboardData = unwrapApiResult(getResponse)
  const dashboard = dashboardData.dashboards?.[0]
  if (!dashboard) {
    throw new CliError(`Dashboard ${dashboardId} not found.`)
  }

  // 2. Build the new panel chart
  const chartType = normalizeChartType(options.type!)
  const panelId = generatePanelId()
  const chart = buildPanelChart(chartType, options)

  const timeRangeOverride = buildTimeRangeOverride(options)
  const newPanel: Record<string, unknown> = {
    id: panelId,
    name: options.panelName,
    dashboardId,
    chart,
    ...(timeRangeOverride ? { timeRangeOverride } : {})
  }

  // 3. Compute layout position: place below all existing panels
  const existingLayouts = dashboard.layouts?.responsiveLayouts?.lg?.layouts ?? []
  let maxBottom = 0
  for (const layout of existingLayouts) {
    const bottom = (layout.y ?? 0) + (layout.h ?? 0)
    if (bottom > maxBottom) {
      maxBottom = bottom
    }
  }

  const newLayout = {
    i: panelId,
    x: 0,
    y: maxBottom,
    w: 12,
    h: 6
  }

  // 4. Build updated dashboard JSON and import it
  const panels = { ...(dashboard.panels ?? {}) }
  panels[panelId] = newPanel as never

  const existingResponsive = dashboard.layouts?.responsiveLayouts ?? {}
  const updatedResponsive: Record<string, unknown> = { ...existingResponsive }
  for (const bp of ['lg', 'md', 'sm', 'xs'] as const) {
    const existing = (existingResponsive as Record<string, { layouts?: unknown[] } | undefined>)[bp]?.layouts ?? []
    updatedResponsive[bp] = { layouts: [...existing, newLayout] }
  }

  const dashboardJson: Record<string, unknown> = {
    ...dashboard,
    panels,
    layouts: {
      responsiveLayouts: updatedResponsive
    }
  }

  const importResponse = await WebService.importDashboard({
    body: {
      dashboardId,
      dashboardJson,
      overrideLayouts: true
    },
    headers: context.headers
  })
  const importData = unwrapApiResult(importResponse)
  printOutput(options, {
    message: `Panel "${options.panelName}" added to dashboard ${dashboardId}`,
    panelId,
    dashboard: importData.dashboard
  })
}

function buildTimeRangeLike(value: string): Record<string, unknown> {
  const relMatch = value.match(/^(-?\d+)\s*([smhdwMy])$/)
  if (relMatch) {
    return { relativeTime: { unit: relMatch[2], value: Number(relMatch[1]) } }
  }
  if (value === 'now' || value === '0') {
    return { relativeTime: { unit: 'h', value: 0 } }
  }
  const ts = Date.parse(value)
  if (!Number.isNaN(ts)) {
    return { absoluteTime: String(ts) }
  }
  throw new CliError(
    `Invalid time range value "${value}". Use a relative offset (e.g. -24h, -7d, -30m, now) or an ISO date string.`
  )
}

function buildTimeRangeOverride(options: AddPanelOptions): Record<string, unknown> | undefined {
  if (!options.timeRangeStart && !options.timeRangeEnd) {
    return undefined
  }
  const timeRange: Record<string, unknown> = {}
  if (options.timeRangeStart) {
    timeRange.start = buildTimeRangeLike(options.timeRangeStart)
  }
  if (options.timeRangeEnd) {
    timeRange.end = buildTimeRangeLike(options.timeRangeEnd)
  } else {
    // default end to "now" when start is provided
    timeRange.end = { relativeTime: { unit: 'h', value: 0 } }
  }
  if (options.timeRangeStep) {
    timeRange.step = options.timeRangeStep
  }
  return { enabled: true, timeRange }
}

function buildPanelChart(chartType: string, options: AddPanelOptions) {
  if (options.sql) {
    const sqlSize = Number.parseInt(String(options.size ?? '100'), 10) || 100
    return {
      type: chartType,
      datasourceType: 'SQL' as const,
      sqlQuery: JSON.stringify({ sql: options.sql, size: sqlSize })
    }
  }

  if (options.event) {
    const queryBody = buildEventsInsightQueryBody(options.event, {
      alias: options.alias,
      sourceName: options.sourceName,
      filter: options.filter,
      groupBy: options.groupBy,
      aggr: options.aggr,
      func: options.func
    })
    return {
      type: chartType,
      datasourceType: 'INSIGHTS' as const,
      insightsQueries: queryBody.queries
    }
  }

  if (options.metric) {
    const queryBody = buildMetricsInsightQueryBody(options.metric, {
      alias: options.alias,
      sourceName: options.sourceName,
      filter: options.filter,
      groupBy: options.groupBy,
      aggr: options.aggr,
      func: options.func
    })
    return {
      type: chartType,
      datasourceType: 'INSIGHTS' as const,
      insightsQueries: queryBody.queries
    }
  }

  throw new CliError('Provide exactly one data source: --sql, --event, or --metric.')
}

function normalizeChartType(value: string) {
  const normalized = value.toUpperCase()
  const valid = ['LINE', 'AREA', 'BAR', 'BAR_GAUGE', 'TABLE', 'QUERY_VALUE', 'PIE', 'NOTE', 'SCATTER']
  if (valid.includes(normalized)) {
    return normalized
  }
  throw new CliError(`Invalid chart type "${value}". Use one of: ${valid.join(', ')}`)
}

function generatePanelId() {
  return `panel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function collectOption(value: string, previous: string[] = []) {
  previous.push(value)
  return previous
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
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

function handleDashboardCommandError(error: unknown, command?: Command) {
  if (
    error instanceof CliError &&
    (error.message.startsWith('Project is required.') ||
      error.message.startsWith('Invalid project ') ||
      error.message.startsWith('Dashboard ') ||
      error.message.startsWith('Provide --file or --stdin') ||
      error.message.startsWith('Use either --file or --stdin') ||
      error.message.startsWith('Expected JSON or YAML') ||
      error.message.startsWith('Invalid JSON or YAML') ||
      error.message.startsWith('Dashboard initialization data') ||
      error.message.startsWith('Provide exactly one data source') ||
      error.message.startsWith('Use exactly one of --sql') ||
      error.message.startsWith('Invalid chart type') ||
      error.message.startsWith('Invalid aggregation') ||
      error.message.startsWith('Invalid metric aggregation') ||
      error.message.startsWith('Invalid filter') ||
      error.message.startsWith('Invalid metric selector') ||
      error.message.startsWith('Invalid time range value') ||
      error.message.startsWith('Unknown function "'))
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

function printOutput(options: DashboardOptions, data: unknown) {
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
  if (data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)) {
    return String((data as { message?: string }).message ?? '')
  }

  if (data && typeof data === 'object' && 'dashboards' in (data as Record<string, unknown>)) {
    const dashboards = ((data as { dashboards?: unknown[] }).dashboards ?? []) as Array<Record<string, unknown>>
    const lines = [`Dashboards (${dashboards.length})`]
    for (const db of dashboards) {
      const id = db.id ?? '<id>'
      const name = db.name ?? '<unnamed>'
      const panelCount = db.panels ? Object.keys(db.panels as Record<string, unknown>).length : 0
      const visibility = db.visibility ?? ''
      const updated = formatTimestamp(db.updatedAt as string | undefined)
      lines.push(
        `- ${id} "${name}" [${panelCount} panels]${visibility ? ` ${visibility}` : ''}${updated ? ` updated ${updated}` : ''}`
      )
    }
    return lines.join('\n')
  }

  return JSON.stringify(data, null, 2)
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
