import { DataService } from '@sentio/api'
import { Command, InvalidArgumentError } from '@commander-js/extra-typings'
import chalk from 'chalk'
import process from 'process'
import yaml from 'yaml'
import {
  ApiContext,
  ApiResult,
  CliError,
  createApiContext,
  fetchApiJson,
  handleCommandError,
  loadJsonInput,
  unwrapApiResult,
  resolveProjectRef
} from '../api.js'

const DEFAULT_RANGE_STEP = 3600

// Valid function names sourced from sentio/app/lib/functions.ts
const VALID_METRIC_FUNCTIONS: ReadonlySet<string> = new Set([
  // Math
  'abs',
  'ceil',
  'floor',
  'round',
  'log2',
  'log10',
  'ln',
  // Rollup
  'rollup_avg',
  'rollup_count',
  'rollup_last',
  'rollup_max',
  'rollup_min',
  'rollup_sum',
  'rollup_delta',
  // Aggregate Over Time
  'avg_over_time',
  'count_over_time',
  'last_over_time',
  'max_over_time',
  'min_over_time',
  'sum_over_time',
  'delta_over_time',
  // Rate
  'rate',
  'irate',
  'delta',
  'moving_delta',
  // Rank
  'topk',
  'bottomk',
  // Time
  'timestamp',
  'day_of_year',
  'day_of_month',
  'day_of_week',
  'year',
  'month',
  'hour',
  'minute',
  // TimeShift
  'before',
  'after'
])

const VALID_EVENT_FUNCTIONS: ReadonlySet<string> = new Set([
  // Rank
  'topk',
  'bottomk',
  // Delta
  'delta'
])
interface CommonDataOptions {
  host?: string
  apiKey?: string
  token?: string
  project?: string
  owner?: string
  name?: string
  projectId?: string
  file?: string
  stdin?: boolean
  json?: boolean
  yaml?: boolean
}

interface RangeOptions {
  start?: string
  end?: string
  step?: number
  timezone?: string
  limit?: number
  offset?: number
  version?: number
}

interface DataQueryOptions extends CommonDataOptions, RangeOptions {
  doc?: boolean
  event?: string
  metric?: string
  price?: string[]
  alias?: string
  sourceName?: string
  filter?: string[]
  groupBy?: string[]
  aggr?: string
  func?: string[]
}

interface SqlCommandOptions extends CommonDataOptions {
  query?: string
  result?: string
  cursor?: string
  async?: boolean
  version?: number
  engine?: string
  noCache?: boolean
  cacheTtlSecs?: number
  cacheRefreshTtlSecs?: number
}

export function createDataCommand() {
  const dataCommand = new Command('data').description('Retrieve data from Sentio')
  dataCommand.addCommand(createDataQueryCommand())
  dataCommand.addCommand(createDataEventsCommand())
  dataCommand.addCommand(createDataMetricsCommand())
  dataCommand.addCommand(createDataSqlCommand())
  return dataCommand
}

export function buildTimeRangeLite(options: RangeOptions) {
  return {
    start: options.start ?? 'now-7d',
    end: options.end ?? 'now',
    step: options.step ?? DEFAULT_RANGE_STEP,
    timezone: options.timezone
  }
}

export function buildEventsInsightQueryBody(
  search: string,
  options: RangeOptions & {
    alias?: string
    sourceName?: string
    filter?: string[]
    groupBy?: string[]
    aggr?: string
    func?: string[]
  }
) {
  return {
    timeRange: buildTimeRangeLite(options),
    limit: options.limit,
    offset: options.offset,
    version: options.version,
    queries: [
      {
        dataSource: 'EVENTS',
        sourceName: options.sourceName ?? '',
        eventsQuery: {
          id: 'events',
          alias: options.alias ?? search,
          resource: {
            type: 'EVENTS',
            name: search
          },
          aggregation: buildEventAggregation(options.aggr),
          selectorExpr: buildSelectorExpr(options.filter),
          groupBy: normalizeListOption(options.groupBy),
          functions: buildFunctions(options.func, VALID_EVENT_FUNCTIONS),
          disabled: false
        }
      }
    ],
    formulas: []
  }
}

export function buildMetricsInsightQueryBody(
  query: string,
  options: RangeOptions & {
    alias?: string
    sourceName?: string
    filter?: string[]
    groupBy?: string[]
    aggr?: string
    func?: string[]
  }
) {
  return {
    timeRange: buildTimeRangeLite(options),
    limit: options.limit,
    offset: options.offset,
    version: options.version,
    queries: [
      {
        dataSource: 'METRICS',
        sourceName: options.sourceName ?? '',
        metricsQuery: {
          id: 'metrics',
          alias: options.alias ?? query,
          query,
          labelSelector: buildMetricLabelSelector(options.filter),
          aggregate: buildMetricAggregate(options.aggr, options.groupBy),
          functions: buildFunctions(options.func, VALID_METRIC_FUNCTIONS),
          disabled: false
        }
      }
    ],
    formulas: []
  }
}

export function buildPriceInsightQueryBody(
  prices: string[],
  options: RangeOptions & {
    alias?: string
    sourceName?: string
  }
) {
  const normalizedPrices = normalizeListOption(prices)
  if (normalizedPrices.length === 0) {
    throw new CliError('Price query requires at least one coin id.')
  }

  return {
    timeRange: buildTimeRangeLite(options),
    limit: options.limit,
    offset: options.offset,
    version: options.version,
    queries: [
      {
        dataSource: 'PRICE',
        sourceName: options.sourceName ?? '',
        priceQuery: {
          id: 'price',
          alias: options.alias ?? normalizedPrices.join(','),
          coinId: normalizedPrices.map(parseCoinIdentifier),
          disabled: false
        }
      }
    ],
    formulas: []
  }
}

export function buildDataQueryBody(options: DataQueryOptions) {
  const selectedKinds = [
    Boolean(options.event),
    Boolean(options.metric),
    normalizeListOption(options.price).length > 0
  ].filter(Boolean).length

  if (selectedKinds > 1) {
    throw new CliError('Use exactly one of --event, --metric, or --price for data query.')
  }

  const priceValues = normalizeListOption(options.price)
  if (priceValues.length > 0) {
    if (
      normalizeListOption(options.filter).length > 0 ||
      normalizeListOption(options.groupBy).length > 0 ||
      options.aggr ||
      normalizeListOption(options.func).length > 0
    ) {
      throw new CliError('Price queries only support --price, --alias, --source-name, and time range options.')
    }
    return buildPriceInsightQueryBody(priceValues, options)
  }

  if (options.metric) {
    return buildMetricsInsightQueryBody(options.metric, options)
  }

  if (!options.event) {
    return undefined
  }

  return buildEventsInsightQueryBody(options.event, options)
}

export function buildSqlExecuteBody(options: SqlCommandOptions) {
  const cachePolicy =
    options.noCache || options.cacheTtlSecs !== undefined || options.cacheRefreshTtlSecs !== undefined
      ? {
          noCache: options.noCache ?? false,
          cacheTtlSecs: options.cacheTtlSecs,
          cacheRefreshTtlSecs: options.cacheRefreshTtlSecs
        }
      : undefined

  const body: Record<string, unknown> = {
    version: options.version,
    cursor: options.cursor,
    sqlQuery: {
      sql: options.query
    }
  }

  if (cachePolicy) {
    body.cachePolicy = cachePolicy
  }
  if (options.engine) {
    body.engine = options.engine
  }
  return body
}

function createDataEventsCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('events').description('List available events for a project')))
  )
    .option('--version <version>', 'Processor version', parseInteger)
    .action(async (options, command) => {
      try {
        await runEventsList(options)
      } catch (error) {
        handleDataCommandError(error, command)
      }
    })
}

function createDataQueryCommand() {
  return withOutputOptions(
    withQueryInputOptions(
      withSharedProjectOptions(withAuthOptions(new Command('query').description('Query data with Sentio insights')))
    )
  )
    .option('--doc', 'Print the full insights query file format and exit')
    .option('--event <name>', 'Event name to query when not using --file/--stdin')
    .option('--metric <name>', 'Metric name to query when not using --file/--stdin')
    .option('--price <coin>', 'Coin id for a price query, for example ETH or 1:0xabc...', collectOption, [])
    .option('--alias <alias>', 'Alias for generated query')
    .option('--source-name <name>', 'Optional source name for generated query')
    .option(
      '--filter <selector>',
      'Event filter or metric label selector like field:value or chain=1',
      collectOption,
      []
    )
    .option('--group-by <field>', 'Group by event property or metric label', collectOption, [])
    .option('--aggr <aggregation>', 'Event: total|unique|AAU|DAU|WAU|MAU. Metric: avg|sum|min|max|count')
    .option('--func <function>', 'Function like topk(1), bottomk(1), delta(1m)', collectOption, [])
    .option('--start <time>', 'Time range start, defaults to now-7d')
    .option('--end <time>', 'Time range end, defaults to now')
    .option('--step <seconds>', 'Time range step in seconds', parseInteger, DEFAULT_RANGE_STEP)
    .option('--timezone <timezone>', 'Timezone for the query')
    .option('--limit <count>', 'Limit rows/series returned', parseInteger)
    .option('--offset <count>', 'Offset rows returned', parseInteger)
    .option('--version <version>', 'Processor version', parseInteger)
    .addHelpText(
      'after',
      `

Examples:
  $ sentio data query --project sentio/coinbase --event Transfer --filter amount>0 --group-by timestamp --aggr total
  $ sentio data query --project sentio/coinbase --event Transfer --filter from:0xabc --group-by meta.address --aggr unique --func 'bottomk(5)'
  $ sentio data query --project sentio/coinbase --metric cbETH_price
  $ sentio data query --project sentio/coinbase --metric burn --filter meta.chain=1 --aggr avg --group-by meta.address
  $ sentio data query --project sentio/coinbase --price ETH
  $ sentio data query --project sentio/coinbase --file query.yaml   # use --doc to show file format
`
    )
    .action(async (options, command) => {
      try {
        await runDataQuery(options)
      } catch (error) {
        handleDataCommandError(error, command)
      }
    })
}

function createDataMetricsCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('metrics').description('List metrics metadata for a project')))
  )
    .option('--metric <name>', 'Filter by metric name')
    .option('--version <version>', 'Processor version', parseInteger)
    .action(async (options, command) => {
      try {
        await runMetricsList(options)
      } catch (error) {
        handleDataCommandError(error, command)
      }
    })
}

function createDataSqlCommand() {
  return withOutputOptions(
    withJsonInputOptions(
      withSharedProjectOptions(withAuthOptions(new Command('sql').description('Execute Sentio SQL')))
    )
  )
    .option('--query <sql>', 'Inline SQL text when not using --file/--stdin')
    .option('--result <execution-id>', 'Fetch an async SQL execution result')
    .option('--cursor <cursor>', 'Cursor for paginated SQL queries')
    .option('--async', 'Execute SQL asynchronously')
    .option('--version <version>', 'Processor version', parseInteger)
    .option('--engine <engine>', 'Optional SQL engine override')
    .option('--no-cache', 'Disable cache for this SQL execution')
    .option('--cache-ttl-secs <seconds>', 'Cache TTL in seconds', parseInteger)
    .option('--cache-refresh-ttl-secs <seconds>', 'Cache refresh TTL in seconds', parseInteger)
    .addHelpText(
      'after',
      `

Examples:
  $ sentio data sql --project sentio/coinbase --query "select 1 as v"
  $ sentio data sql --project sentio/coinbase --query "select * from transfer limit 10" --async
  $ sentio data sql --project sentio/coinbase --result <execution-id>
`
    )
    .action(async (options, command) => {
      try {
        await runSql(options)
      } catch (error) {
        handleDataCommandError(error, command)
      }
    })
}

async function runEventsList(
  options: CommonDataOptions & {
    start?: string
    end?: string
    timezone?: string
    limit?: number
    offset?: number
    version?: number
    search?: string
  }
) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: false, projectId: true })
  const data = await fetchApiJson<{
    events?: Array<{ name?: string; displayName?: string; properties?: Array<{ name?: string; type?: string }> }>
    computeStats?: Record<string, unknown> | null
  }>('/api/v1/analytics/events', context, {
    projectId: project.projectId,
    version: options.version
  })
  printOutput(options, data)
}

async function runDataQuery(options: DataQueryOptions) {
  if (options.doc) {
    console.log(DATA_QUERY_DOC.trimEnd())
    return
  }

  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const body = loadJsonInput(options) ?? buildDataQueryBody(options)

  if (!body) {
    throw new CliError('Provide --file, --stdin, or exactly one of --event, --metric, or --price for data query.')
  }

  const response = await DataService.query({
    path: {
      owner: project.owner,
      slug: project.slug
    },
    body: body as never,
    headers: context.headers
  })
  const data = unwrapApiResult(response)
  printOutput(options, data)
}

async function runMetricsList(options: CommonDataOptions & { metric?: string; version?: number }) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: false, projectId: true })
  const response = await DataService.getMetrics({
    query: {
      projectId: project.projectId,
      name: options.metric,
      version: options.version
    },
    headers: context.headers
  })
  const data = unwrapApiResult(response)

  printOutput(options, data)
}

async function runSql(options: SqlCommandOptions) {
  if (options.query && options.result) {
    throw new CliError('Use only one of --query or --result.')
  }
  if (options.result) {
    if (options.async) {
      throw new CliError('--async only works with --query.')
    }
    await runSqlResult(options.result, options)
    return
  }

  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const body = loadJsonInput(options) ?? (options.query ? buildSqlExecuteBody(options) : undefined)

  if (!body) {
    throw new CliError('Provide --query, --result, --file, or --stdin.')
  }

  if (options.async) {
    const response = await DataService.executeSqlAsync({
      path: {
        owner: project.owner,
        slug: project.slug
      },
      body: body as never,
      headers: context.headers
    })
    const data = unwrapApiResult(response)
    printOutput(options, data)
    return
  }

  const response = await DataService.executeSql({
    path: {
      owner: project.owner,
      slug: project.slug
    },
    body: body as never,
    headers: context.headers
  })
  const data = unwrapApiResult(response)
  printOutput(options, data)
}

async function runSqlResult(executionId: string, options: CommonDataOptions & { projectId?: string }) {
  await runSqlExecutionRead(executionId, options, (project, context) =>
    DataService.querySqlResult({
      path: {
        owner: project.owner,
        slug: project.slug,
        executionId
      },
      query: {
        projectId: project.projectId
      },
      headers: context.headers
    })
  )
}

async function runSqlExecutionRead(
  executionId: string,
  options: CommonDataOptions & { projectId?: string },
  operation: (
    project: Awaited<ReturnType<typeof resolveProjectRef>>,
    context: ApiContext
  ) => Promise<ApiResult<unknown>>
) {
  if (!executionId) {
    throw new CliError('Execution id is required.')
  }

  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { ownerSlug: true })
  const data = unwrapApiResult(await operation(project, context))
  printOutput(options, data)
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

function withJsonInputOptions<T extends Command<any, any, any>>(command: T) {
  return command
    .option('--file <path>', 'Read request JSON or YAML from file')
    .option('--stdin', 'Read request JSON or YAML from stdin')
}

function withQueryInputOptions<T extends Command<any, any, any>>(command: T) {
  return command
    .option('--file <path>', 'Read request JSON or YAML from file. Use --doc to show the full insight query format')
    .option('--stdin', 'Read request JSON or YAML from stdin. Use --doc to show the full insight query format')
}

function withOutputOptions<T extends Command<any, any, any>>(command: T) {
  return command
    .showHelpAfterError()
    .option('--json', 'Print raw JSON response')
    .option('--yaml', 'Print raw YAML response')
}

function parseInteger(value: string) {
  const parsedValue = Number.parseInt(value, 10)
  if (Number.isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.')
  }
  return parsedValue
}

function collectOption(value: string, previous: string[] = []) {
  previous.push(value)
  return previous
}

function printJson(data: unknown) {
  console.log(JSON.stringify(data, null, 2))
}

function handleDataCommandError(error: unknown, command?: Command) {
  if (error instanceof CliError && shouldShowHelpForDataCommandError(error)) {
    console.error(chalk.red(error.message))
    if (command) {
      console.error()
      command.outputHelp()
    }
    process.exit(1)
  }
  handleCommandError(error)
}

function shouldShowHelpForDataCommandError(error: CliError) {
  return (
    error.message.startsWith('Project is required.') ||
    error.message.startsWith(
      'Provide --file, --stdin, or exactly one of --event, --metric, or --price for data query'
    ) ||
    error.message.startsWith('Use exactly one of --event, --metric, or --price for data query.') ||
    error.message.startsWith('Price queries only support --price') ||
    error.message.startsWith('Provide --query, --result, --file, or --stdin.') ||
    error.message.startsWith('Use only one of --query or --result.') ||
    error.message.startsWith('--async only works with --query.') ||
    error.message.startsWith('Execution id is required.') ||
    error.message.startsWith('Unknown function "')
  )
}

function buildEventAggregation(aggregationName = 'total') {
  switch (aggregationName.toUpperCase()) {
    case 'TOTAL':
      return { total: {} }
    case 'UNIQUE':
      return { unique: {} }
    case 'AAU':
      return { countUnique: { duration: { value: 1, unit: 'y' } } }
    case 'DAU':
      return { countUnique: { duration: { value: 1, unit: 'd' } } }
    case 'WAU':
      return { countUnique: { duration: { value: 1, unit: 'w' } } }
    case 'MAU':
      return { countUnique: { duration: { value: 1, unit: 'mo' } } }
    default:
      throw new CliError(`Invalid aggregation "${aggregationName}". Use total, unique, AAU, DAU, WAU, or MAU.`)
  }
}

function buildMetricAggregate(aggregationName?: string, groupBy?: string[]) {
  const grouping = normalizeListOption(groupBy)
  if (!aggregationName && grouping.length === 0) {
    return undefined
  }

  const normalizedAggregation = (aggregationName ?? 'avg').toUpperCase()
  switch (normalizedAggregation) {
    case 'AVG':
    case 'SUM':
    case 'MIN':
    case 'MAX':
    case 'COUNT':
      return {
        op: normalizedAggregation,
        grouping
      }
    default:
      throw new CliError(`Invalid metric aggregation "${aggregationName}". Use avg, sum, min, max, or count.`)
  }
}

function buildMetricLabelSelector(filters?: string[]) {
  const selectors = normalizeListOption(filters)
  if (selectors.length === 0) {
    return {}
  }

  return Object.fromEntries(selectors.map(parseMetricLabelSelector))
}

function buildSelectorExpr(filters?: string[]) {
  const normalizedFilters = normalizeListOption(filters)
  if (normalizedFilters.length === 0) {
    return undefined
  }

  const expressions = normalizedFilters.map((filter) => {
    const parsed = parseSelectorFilter(filter)
    return {
      selector: {
        key: parsed.key,
        operator: parsed.operator,
        value: parsed.value
      }
    }
  })

  if (expressions.length === 1) {
    return expressions[0]
  }

  return {
    logicExpr: {
      operator: 'AND',
      expressions
    }
  }
}

function parseSelectorFilter(filter: string) {
  const trimmed = filter.trim()
  const operators = [
    { token: '!=', operator: 'NEQ' },
    { token: '>=', operator: 'GTE' },
    { token: '<=', operator: 'LTE' },
    { token: '>', operator: 'GT' },
    { token: '<', operator: 'LT' },
    { token: ':', operator: 'EQ' },
    { token: '=', operator: 'EQ' }
  ] as const

  for (const entry of operators) {
    const index = trimmed.indexOf(entry.token)
    if (index <= 0) {
      continue
    }
    const key = trimmed.slice(0, index).trim()
    const rawValue = trimmed.slice(index + entry.token.length).trim()
    if (!key || !rawValue) {
      break
    }
    return {
      key,
      operator: entry.operator,
      value: [parseAnyValue(rawValue)]
    }
  }

  throw new CliError(`Invalid filter "${filter}". Use forms like field:value, field=value, amount>0, or amount>=0.`)
}

function parseMetricLabelSelector(filter: string) {
  const trimmed = filter.trim()
  for (const token of [':', '=']) {
    const index = trimmed.indexOf(token)
    if (index <= 0) {
      continue
    }
    const key = trimmed.slice(0, index).trim()
    const value = stripMatchingQuotes(trimmed.slice(index + token.length).trim())
    if (key && value) {
      return [key, value] as const
    }
  }

  throw new CliError(`Invalid metric selector "${filter}". Use forms like chain:1 or token=cbETH.`)
}

function parseAnyValue(rawValue: string) {
  const unquotedValue = stripMatchingQuotes(rawValue)
  if (/^-?\d+$/.test(unquotedValue)) {
    return { longValue: unquotedValue }
  }
  if (/^-?\d+\.\d+$/.test(unquotedValue)) {
    return { doubleValue: Number.parseFloat(unquotedValue) }
  }
  if (unquotedValue === 'true' || unquotedValue === 'false') {
    return { boolValue: unquotedValue === 'true' }
  }
  return { stringValue: unquotedValue }
}

function buildFunctions(functions?: string[], validNames?: ReadonlySet<string>) {
  return normalizeListOption(functions).map((f) => {
    const parsed = parseFunctionCall(f)
    if (validNames && !validNames.has(parsed.name)) {
      throw new CliError(`Unknown function "${parsed.name}". Valid functions: ${[...validNames].sort().join(', ')}.`)
    }
    return parsed
  })
}

function parseFunctionCall(value: string) {
  const trimmed = value.trim()
  const match = /^([a-zA-Z_][\w]*)\((.*)\)$/.exec(trimmed)
  if (!match) {
    return {
      name: trimmed,
      arguments: []
    }
  }

  const [, name, rawArgs] = match
  const args = rawArgs.trim() ? splitFunctionArgs(rawArgs).map(parseFunctionArgument) : []
  return {
    name,
    arguments: args
  }
}

function splitFunctionArgs(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function parseFunctionArgument(value: string) {
  const unquotedValue = stripMatchingQuotes(value)
  const durationMatch = /^(-?\d+)([a-zA-Z]+)$/.exec(unquotedValue)
  if (durationMatch) {
    return {
      durationValue: {
        value: Number.parseInt(durationMatch[1], 10),
        unit: durationMatch[2]
      }
    }
  }
  if (/^-?\d+$/.test(unquotedValue)) {
    return { intValue: Number.parseInt(unquotedValue, 10) }
  }
  if (/^-?\d+\.\d+$/.test(unquotedValue)) {
    return { doubleValue: Number.parseFloat(unquotedValue) }
  }
  if (unquotedValue === 'true' || unquotedValue === 'false') {
    return { boolValue: unquotedValue === 'true' }
  }
  return { stringValue: unquotedValue }
}

function parseCoinIdentifier(value: string) {
  const normalizedValue = stripMatchingQuotes(value.trim())
  const addressMatch = /^([^:]+):(0x[a-fA-F0-9]+)$/.exec(normalizedValue)
  if (addressMatch) {
    return {
      address: {
        chain: addressMatch[1],
        address: addressMatch[2]
      }
    }
  }

  return {
    symbol: normalizedValue
  }
}

function normalizeListOption(values?: string[]) {
  return (values ?? [])
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean)
}

function stripMatchingQuotes(value: string) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}

const DATA_QUERY_DOC = `
Insights query file format

The --file/--stdin input is passed directly to Sentio's insights query API.
Any valid request body for the insights query endpoint is accepted.

Top-level fields:
  version: optional processor version
  timeRange:
    start: relative or absolute time, for example now-7d
    end: relative or absolute time, for example now
    step: bucket size in seconds
    timezone: optional timezone like UTC
  limit: optional result limit
  offset: optional result offset
  queries: array of event, metric, or price queries
  formulas: optional array of formulas that combine query ids

Event query example:
  version: 67
  timeRange:
    start: now-7d
    end: now
    step: 3600
  queries:
    - dataSource: EVENTS
      sourceName: ""
      eventsQuery:
        id: a
        alias: Transfer
        resource:
          type: EVENTS
          name: Transfer
        aggregation:
          total: {}
        selectorExpr:
          logicExpr:
            operator: AND
            expressions:
              - selector:
                  key: amount
                  operator: GT
                  value:
                    - longValue: "0"
        groupBy:
          - timestamp
        functions:
          - name: bottomk
            arguments:
              - intValue: 5
        disabled: false
  formulas: []

Metric query example:
  version: 67
  timeRange:
    start: now-7d
    end: now
    step: 3600
  queries:
    - dataSource: METRICS
      sourceName: ""
      metricsQuery:
        id: a
        alias: burn
        query: burn
        labelSelector:
          meta.chain: "1"
        aggregate:
          op: AVG
          grouping:
            - meta.address
        functions:
          - name: delta
            arguments:
              - durationValue:
                  value: 1
                  unit: h
        disabled: false
  formulas: []

Price query example:
  timeRange:
    start: now-7d
    end: now
    step: 3600
  queries:
    - dataSource: PRICE
      sourceName: ""
      priceQuery:
        id: a
        alias: ETH
        coinId:
          - symbol: ETH
          - address:
              chain: "1"
              address: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2"
        disabled: false
  formulas: []

Formula example:
  formulas:
    - id: f
      alias: net
      expression: a - b
      disabled: false

Reference:
  https://docs.sentio.xyz/reference/query-1
`

export function formatStructuredOutput(data: unknown, outputFormat: 'json' | 'yaml') {
  if (outputFormat === 'json') {
    return JSON.stringify(data, null, 2)
  }
  return yaml.stringify(data)
}

export function formatDataOutput(data: unknown) {
  if (!data || typeof data !== 'object') {
    return String(data)
  }
  const objectData = data as Record<string, unknown>

  if (hasEventMetadata(objectData)) {
    const lines = [`Events (${objectData.events.length})`]
    for (const event of objectData.events) {
      const name = asString(event.displayName) || asString(event.name) || '<unknown>'
      const properties = Array.isArray(event.properties) ? event.properties : []
      lines.push(`- ${name}`)
      if (properties.length > 0) {
        lines.push(`   properties: ${formatEventProperties(properties)}`)
      }
    }
    return lines.join('\n')
  }

  if (hasMetrics(objectData)) {
    return formatMetricsList(objectData.metrics)
  }

  if (hasResults(objectData)) {
    return formatInsightsResults(objectData.results)
  }

  if (isSqlExecuteResult(objectData)) {
    const lines = []
    if (objectData.runtimeCost) {
      lines.push(`Runtime cost: ${objectData.runtimeCost} ms`)
    }
    if (objectData.result) {
      lines.push(formatTable(objectData.result.columns ?? [], objectData.result.rows ?? []))
    }
    return lines.join('\n\n')
  }

  if (isSqlAsyncResult(objectData)) {
    const lines = ['SQL query queued']
    if (objectData.queryId) {
      lines.push(`Query ID: ${objectData.queryId}`)
    }
    if (objectData.executionId) {
      lines.push(`Execution ID: ${objectData.executionId}`)
    }
    if (objectData.queueLength !== undefined) {
      lines.push(`Queue length: ${objectData.queueLength}`)
    }
    return lines.join('\n')
  }

  if (isSqlResultResponse(objectData)) {
    return formatSqlExecutionInfo(objectData.executionInfo)
  }

  if (isSqlStatusResponse(objectData)) {
    return formatComputeStats(objectData.computeStats)
  }

  return JSON.stringify(data, null, 2)
}

function printOutput(options: CommonDataOptions, data: unknown) {
  if (options.json && options.yaml) {
    throw new CliError('Choose only one structured output format: --json or --yaml.')
  }
  if (options.json) {
    printJson(data)
    return
  }
  if (options.yaml) {
    console.log(formatStructuredOutput(data, 'yaml').trimEnd())
    return
  }
  console.log(formatDataOutput(data))
}

function hasEventMetadata(data: Record<string, unknown>): data is {
  events: Array<{ name?: string; displayName?: string; properties?: Array<{ name?: string; type?: string }> }>
} {
  return Array.isArray(data.events)
}

function hasMetrics(data: Record<string, unknown>): data is { metrics: Array<Record<string, unknown>> } {
  return Array.isArray(data.metrics)
}

function hasResults(data: Record<string, unknown>): data is { results: Array<Record<string, unknown>> } {
  return Array.isArray(data.results)
}

function isSqlExecuteResult(data: Record<string, unknown>): data is {
  runtimeCost?: string
  result?: { columns?: string[]; rows?: Array<Record<string, unknown>> }
} {
  return 'result' in data && typeof data.result === 'object'
}

function isSqlAsyncResult(
  data: Record<string, unknown>
): data is { queryId?: string; executionId?: string; queueLength?: number } {
  return 'executionId' in data || 'queryId' in data
}

function isSqlResultResponse(data: Record<string, unknown>): data is { executionInfo?: Record<string, unknown> } {
  return 'executionInfo' in data
}

function isSqlStatusResponse(data: Record<string, unknown>): data is { computeStats?: Record<string, unknown> } {
  return 'computeStats' in data
}

function formatMetricsList(metrics: Array<Record<string, unknown>>) {
  const lines = [`Metrics (${metrics.length})`]
  for (const metric of metrics) {
    const name = asString(metric.name) ?? '<unknown>'
    const type = asString((metric.metadata as Record<string, unknown> | undefined)?.type) ?? 'UNKNOWN'
    const chainId = asStringArray(metric.chainId).join(',')
    const contract = asStringArray(metric.contractName).join(',')
    const lastSeen = formatTimestamp((metric.metadata as Record<string, unknown> | undefined)?.lastSeen)
    const extras = [`type=${type}`]
    if (chainId) {
      extras.push(`chain=${chainId}`)
    }
    if (contract) {
      extras.push(`contract=${contract}`)
    }
    if (lastSeen) {
      extras.push(`lastSeen=${lastSeen}`)
    }
    lines.push(`- ${name} (${extras.join(', ')})`)
  }
  return lines.join('\n')
}

function formatEventProperties(properties: Array<{ name?: string; type?: string }>) {
  return properties
    .map((property) => {
      const propertyName = asString(property.name) || '<unknown>'
      const propertyType = asString(property.type)
      if (!propertyType || propertyType === 'STRING') {
        return propertyName
      }
      return `${propertyName}(${propertyType})`
    })
    .join(', ')
}

function formatInsightsResults(results: Array<Record<string, unknown>>) {
  const lines: string[] = []
  results.forEach((result, index) => {
    const alias = asString(result.alias) || asString(result.id) || `result-${index + 1}`
    const source = asString(result.dataSource) ?? 'UNKNOWN'
    const matrix = result.matrix as Record<string, unknown> | undefined
    const samples = Array.isArray(matrix?.samples) ? (matrix.samples as Array<Record<string, unknown>>) : []
    lines.push(`${alias} [${source}]`)
    if (samples.length === 0) {
      const error = asString(result.error)
      lines.push(error ? `  error: ${error}` : '  no samples')
      return
    }
    const limit = Math.min(samples.length, 5)
    for (const sample of samples.slice(0, limit)) {
      const metric = (sample.metric as Record<string, unknown> | undefined) ?? {}
      const displayName = asString(metric.displayName) || asString(metric.name) || 'series'
      const labels = formatLabels(metric.labels as Record<string, unknown> | undefined)
      const values = Array.isArray(sample.values) ? (sample.values as Array<Record<string, unknown>>) : []
      const seriesTitle = `${displayName}${labels ? ` {${labels}}` : ''}`
      lines.push(`  - ${seriesTitle}`)
      lines.push(
        indentLines(
          formatTable(
            ['timestamp', 'value'],
            values.map((value) => ({
              timestamp: formatTimestamp(value.timestamp) ?? stringifyCell(value.timestamp),
              value: value.value
            }))
          ),
          '    '
        )
      )
    }
    if (samples.length > limit) {
      lines.push(`  ... ${samples.length - limit} more series`)
    }
  })
  return lines.join('\n')
}

function formatSqlExecutionInfo(info: Record<string, unknown> | undefined) {
  if (!info) {
    return 'No execution info returned.'
  }
  const lines: string[] = []
  if (asString(info.executionId)) {
    lines.push(`Execution ID: ${asString(info.executionId)}`)
  }
  if (asString(info.status)) {
    lines.push(`Status: ${asString(info.status)}`)
  }
  if (asString(info.queryId)) {
    lines.push(`Query ID: ${asString(info.queryId)}`)
  }
  if (asString(info.startedAt)) {
    lines.push(`Started: ${asString(info.startedAt)}`)
  }
  if (asString(info.finishedAt)) {
    lines.push(`Finished: ${asString(info.finishedAt)}`)
  }
  const result = info.result as Record<string, unknown> | undefined
  if (result?.columns || result?.rows) {
    lines.push('', formatTable(asStringArray(result.columns), asRecordArray(result.rows)))
  }
  const error = asString(info.error)
  if (error) {
    lines.push(`Error: ${error}`)
  }
  return lines.join('\n')
}

function formatComputeStats(stats: Record<string, unknown> | undefined) {
  if (!stats) {
    return 'No status details returned.'
  }
  const lines = ['Execution status']
  if (asString(stats.computedAt)) {
    lines.push(`Computed at: ${asString(stats.computedAt)}`)
  }
  if (asString(stats.computeCostMs)) {
    lines.push(`Compute cost: ${asString(stats.computeCostMs)} ms`)
  }
  if (asString(stats.computedBy)) {
    lines.push(`Computed by: ${asString(stats.computedBy)}`)
  }
  return lines.join('\n')
}

function formatTable(columns: string[], rows: Array<Record<string, unknown>>) {
  if (columns.length === 0) {
    return rows.length === 0 ? 'No rows returned.' : JSON.stringify(rows, null, 2)
  }
  const shownRows = rows.slice(0, 20)
  const widths = columns.map((column) => column.length)
  for (const row of shownRows) {
    columns.forEach((column, index) => {
      widths[index] = Math.max(widths[index], stringifyCell(row[column]).length)
    })
  }
  const header = columns.map((column, index) => column.padEnd(widths[index])).join('  ')
  const separator = columns.map((_, index) => '-'.repeat(widths[index])).join('  ')
  const body = shownRows.map((row) =>
    columns.map((column, index) => stringifyCell(row[column]).padEnd(widths[index])).join('  ')
  )
  if (rows.length > shownRows.length) {
    body.push(`... ${rows.length - shownRows.length} more rows`)
  }
  return [header, separator, ...body].join('\n')
}

function indentLines(value: string, indent: string) {
  return value
    .split('\n')
    .map((line) => `${indent}${line}`)
    .join('\n')
}

function stringifyCell(value: unknown) {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  return JSON.stringify(value)
}

function formatLabels(labels: Record<string, unknown> | undefined) {
  if (!labels) {
    return ''
  }
  return Object.entries(labels)
    .map(([key, value]) => `${key}=${stringifyCell(value)}`)
    .join(', ')
}

function formatTimestamp(value: unknown) {
  const stringValue = asString(value)
  if (!stringValue) {
    return undefined
  }
  if (/^\d+$/.test(stringValue)) {
    const num = Number(stringValue)
    const millis = stringValue.length <= 10 ? num * 1000 : num
    return new Date(millis).toISOString()
  }
  const parsed = Date.parse(stringValue)
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString()
  }
  return stringValue
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function asRecordArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    : []
}
