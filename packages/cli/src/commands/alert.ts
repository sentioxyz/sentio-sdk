import { AlertsService } from '@sentio/api'
import { Command, InvalidArgumentError } from '@commander-js/extra-typings'
import process from 'process'
import yaml from 'yaml'
import {
  CliError,
  createApiContext,
  handleCommandError,
  loadJsonInput,
  resolveProjectRef,
  unwrapApiResult
} from '../api.js'
import { buildEventsInsightQueryBody, buildMetricsInsightQueryBody } from './data.js'

interface AlertOptions {
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

interface AlertCreateOptions extends AlertOptions {
  doc?: boolean
  type?: string
  subject?: string
  message?: string
  query?: string
  event?: string
  metric?: string
  alias?: string
  sourceName?: string
  filter?: string[]
  groupBy?: string[]
  aggr?: string
  func?: string[]
  op?: string
  threshold?: number
  threshold2?: number
  for?: string
  interval?: string
  valueColumn?: string
  timeColumn?: string
  sqlAggr?: string
}

interface AlertGetOptions extends AlertOptions {
  page?: number
  pageSize?: number
}

interface AlertListOptions extends AlertOptions {
  recent?: number
}

interface AlertRuleBody {
  rule?: {
    id?: string
    projectId?: string
    state?: string
    subject?: string
    message?: string
    group?: string
    query?: string
    alertType?: string
    mute?: boolean
    channels?: Array<{ type?: string; name?: string }>
    [key: string]: unknown
  }
}
interface AlertQuerySpec {
  id?: string
  event?: string
  metric?: string
  alias?: string
  sourceName?: string
  filter?: string[] | string
  groupBy?: string[] | string
  aggr?: string
  func?: string[] | string
}

export function createAlertCommand() {
  const alertCommand = new Command('alert').description('Manage Sentio alerts')
  alertCommand.addCommand(createAlertListCommand())
  alertCommand.addCommand(createAlertGetCommand())
  alertCommand.addCommand(createAlertCreateCommand())
  alertCommand.addCommand(createAlertUpdateCommand())
  alertCommand.addCommand(createAlertDeleteCommand())
  return alertCommand
}

function createAlertListCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('list').description('List alert rules for a project')))
  )
    .showHelpAfterError()
    .option('--recent <count>', 'Show the most recent N alert instances under each rule', parseInteger, 3)
    .action(async (options, command) => {
      try {
        await runAlertList(options)
      } catch (error) {
        handleAlertCommandError(error, command)
      }
    })
}

function createAlertGetCommand() {
  return withOutputOptions(withAuthOptions(new Command('get').description('Get an alert rule').argument('<rule-id>')))
    .showHelpAfterError()
    .option('--page <page>', 'Page number', parseInteger)
    .option('--page-size <count>', 'Page size', parseInteger)
    .action(async (ruleId, options, command) => {
      try {
        await runAlertGet(ruleId, options)
      } catch (error) {
        handleAlertCommandError(error, command)
      }
    })
}

function createAlertCreateCommand() {
  return withOutputOptions(
    withSharedProjectOptions(withAuthOptions(new Command('create').description('Create an alert rule')))
  )
    .showHelpAfterError()
    .option('--file <path>', 'Read request JSON or YAML from file. Use --doc to show the full alert request format')
    .option('--stdin', 'Read request JSON or YAML from stdin. Use --doc to show the full alert request format')
    .option('--doc', 'Print the full alert request file format and exit')
    .option('--type <type>', 'Alert type: METRIC, LOG, or SQL')
    .option('--subject <text>', 'Alert subject/title')
    .option('--message <text>', 'Optional alert message template')
    .option(
      '--query <text>',
      'Inline query. LOG: Elasticsearch query-string syntax (e.g. amount:>1000, status:error). SQL: full SQL statement.'
    )
    .option('--event <name>', 'Inline event query for METRIC alerts')
    .option('--metric <name>', 'Inline metric query for METRIC alerts')
    .option('--alias <alias>', 'Alias for the inline METRIC query')
    .option('--source-name <name>', 'Optional source name for the inline METRIC query')
    .option('--filter <selector>', 'Inline METRIC query filter like amount>0 or meta.chain=1', collectOption, [])
    .option('--group-by <field>', 'Inline METRIC query group-by field', collectOption, [])
    .option(
      '--aggr <aggregation>',
      'Inline aggregation. METRIC: avg|sum|min|max|count. EVENTS: total|unique|AAU|DAU|WAU|MAU'
    )
    .option('--func <function>', 'Inline function like topk(1), bottomk(1), delta(1m)', collectOption, [])
    .option('--op <operator>', 'Condition operator like >, >=, ==, !=, <, <=, between')
    .option('--threshold <value>', 'Condition threshold', parseNumber)
    .option('--threshold2 <value>', 'Second threshold for between', parseNumber)
    .option('--for <duration>', 'Evaluate over the last duration, for example 5m or 1h')
    .option('--interval <duration>', 'Alert evaluation interval, for example 1m or 5m')
    .option('--time-column <column>', 'SQL alert time column for column-based conditions')
    .option('--value-column <column>', 'SQL alert value column for column-based conditions')
    .option('--sql-aggr <aggregation>', 'SQL aggregation: COUNT, SUM, AVG, MAX, MIN, LAST')
    .addHelpText(
      'after',
      `

Examples:
  $ sentio alert create --project sentio/coinbase --type LOG --subject "Large transfer logs" --query 'amount:>1000' --op '>' --threshold 0
  $ sentio alert create --project sentio/coinbase --type SQL --subject "Large transfer(SQL demo)" --query 'select timestamp, amount from transfer where amount > 1000' --time-column timestamp --value-column amount --sql-aggr MAX --op '>' --threshold 1000
  $ sentio alert create --project sentio/coinbase --type METRIC --subject "Burn spike" --metric burn --filter meta.chain=1 --aggr avg --group-by meta.address --op '>' --threshold 100
  $ sentio alert create --project sentio/coinbase --type METRIC --subject "Transfer anomaly" --event Transfer --filter amount>0 --aggr total --func 'delta(1m)' --op '>' --threshold 100
  $ sentio alert create --project sentio/coinbase --file alert.metric.yaml   # use --doc to show file format
`
    )
    .action(async (options, command) => {
      try {
        await runAlertCreate(options)
      } catch (error) {
        handleAlertCommandError(error, command)
      }
    })
}

function createAlertUpdateCommand() {
  return withOutputOptions(
    withJsonInputOptions(
      withAuthOptions(new Command('update').description('Update an alert rule').argument('<rule-id>'))
    )
  )
    .showHelpAfterError()
    .action(async (ruleId, options, command) => {
      try {
        await runAlertUpdate(ruleId, options)
      } catch (error) {
        handleAlertCommandError(error, command)
      }
    })
}

function createAlertDeleteCommand() {
  return withOutputOptions(
    withAuthOptions(new Command('delete').description('Delete an alert rule').argument('<rule-id>'))
  )
    .showHelpAfterError()
    .action(async (ruleId, options, command) => {
      try {
        await runAlertDelete(ruleId, options)
      } catch (error) {
        handleAlertCommandError(error, command)
      }
    })
}

async function runAlertList(options: AlertListOptions) {
  const context = createApiContext(options)
  const project = await resolveProjectRef(options, context, { projectId: true })
  const response = await AlertsService.getAlertRules({
    path: {
      projectId: project.projectId!
    },
    headers: context.headers
  })
  const data = unwrapApiResult(response)
  const rules = Array.isArray(data.rules) ? data.rules : []
  const recentCount = options.recent ?? 3
  const alertsByRule = Object.fromEntries(
    await Promise.all(
      rules.map(async (rule) => {
        const ruleId = asString(rule.id)
        if (!ruleId || recentCount <= 0) {
          return [ruleId ?? '', []]
        }
        const detail = unwrapApiResult(
          await AlertsService.getAlert({
            path: {
              ruleId
            },
            query: {
              page: 1,
              pageSize: recentCount
            },
            headers: context.headers
          })
        )
        return [ruleId, Array.isArray(detail.alerts) ? detail.alerts : []]
      })
    )
  )
  printOutput(options, {
    ...data,
    alertsByRule,
    recentCount
  })
}

async function runAlertGet(ruleId: string, options: AlertGetOptions) {
  const context = createApiContext(options)
  const response = await AlertsService.getAlert({
    path: {
      ruleId
    },
    query: {
      page: options.page,
      pageSize: options.pageSize
    },
    headers: context.headers
  })
  printOutput(options, unwrapApiResult(response))
}

async function runAlertCreate(options: AlertCreateOptions) {
  if (options.doc) {
    console.log(ALERT_CREATE_DOC.trimEnd())
    return
  }

  const context = createApiContext(options)
  const body =
    (await normalizeAlertRuleBody(loadJsonInput(options), options, context)) ??
    (await buildAlertCreateBodyFromOptions(options, context))
  if (!body) {
    throw new CliError(
      'Provide --file, --stdin, or inline alert flags like --type, --subject, and query options for alert create.'
    )
  }
  const response = await AlertsService.saveAlertRule({
    body: body as never,
    headers: context.headers
  })
  printOutput(options, {
    message: 'Alert rule created',
    ...(unwrapApiResult(response) as Record<string, unknown>)
  })
}

async function runAlertUpdate(ruleId: string, options: AlertOptions) {
  const context = createApiContext(options)
  const body = await normalizeAlertRuleBody(loadJsonInput(options))
  if (!body) {
    throw new CliError('Provide --file or --stdin for alert update.')
  }
  const response = await AlertsService.saveAlertRule2({
    path: {
      id: ruleId
    },
    body: body as never,
    headers: context.headers
  })
  printOutput(options, {
    message: `Alert rule updated: ${ruleId}`,
    ...(unwrapApiResult(response) as Record<string, unknown>)
  })
}

async function runAlertDelete(ruleId: string, options: AlertOptions) {
  const context = createApiContext(options)
  const response = await AlertsService.deleteAlertRule({
    path: {
      id: ruleId
    },
    headers: context.headers
  })
  printOutput(options, {
    message: `Alert rule deleted: ${ruleId}`,
    ...(unwrapApiResult(response) as Record<string, unknown>)
  })
}

async function normalizeAlertRuleBody(
  body: unknown | undefined,
  options?: AlertOptions,
  context?: ReturnType<typeof createApiContext>
): Promise<AlertRuleBody | undefined> {
  if (!body || typeof body !== 'object') {
    return undefined
  }

  const objectBody = body as Record<string, unknown>
  const normalizedBody: AlertRuleBody =
    'rule' in objectBody ? (objectBody as AlertRuleBody) : { rule: objectBody as AlertRuleBody['rule'] }

  if (options && context && normalizedBody.rule && !normalizedBody.rule.projectId) {
    return await injectProjectId(normalizedBody, options, context)
  }

  return normalizedBody
}

async function injectProjectId(
  body: AlertRuleBody,
  options: AlertOptions,
  context: ReturnType<typeof createApiContext>
) {
  const project = await resolveProjectRef(options, context, { projectId: true })
  return {
    ...body,
    rule: {
      ...body.rule,
      projectId: project.projectId
    }
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

function withOutputOptions<T extends Command<any, any, any>>(command: T) {
  return command.option('--json', 'Print raw JSON response').option('--yaml', 'Print raw YAML response')
}

function handleAlertCommandError(error: unknown, command?: Command) {
  if (
    error instanceof CliError &&
    (error.message.startsWith('Project is required.') ||
      error.message.startsWith('Provide --file or --stdin for alert ') ||
      error.message.startsWith('Provide --file, --stdin, or inline alert flags like') ||
      error.message.startsWith('Alert type is required.') ||
      error.message.startsWith('Subject is required.') ||
      error.message.startsWith('LOG alerts require ') ||
      error.message.startsWith('SQL alerts require ') ||
      error.message.startsWith('METRIC alerts require ') ||
      error.message.startsWith('Use exactly one of --event or --metric') ||
      error.message.startsWith('Invalid alert type ') ||
      error.message.startsWith('Invalid alert operator ') ||
      error.message.startsWith('Invalid SQL aggregation ') ||
      error.message.startsWith('Invalid duration ') ||
      error.message.startsWith('Invalid project '))
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

function printOutput(options: AlertOptions, data: unknown) {
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
  if (data && typeof data === 'object' && Array.isArray((data as { rules?: unknown[] }).rules)) {
    const objectData = data as {
      rules: Array<Record<string, unknown>>
      alertsByRule?: Record<string, Array<Record<string, unknown>>>
      recentCount?: number
    }
    const rules = objectData.rules
    const lines = [`Alert rules (${rules.length})`]
    for (const rule of rules) {
      lines.push(...formatRuleBlock(rule))
      const ruleId = asString(rule.id) ?? ''
      const alerts = objectData.alertsByRule?.[ruleId] ?? []
      if (alerts.length > 0) {
        lines.push(`  recent alerts (${Math.min(alerts.length, objectData.recentCount ?? alerts.length)})`)
        for (const alert of alerts) {
          lines.push(`  ${formatAlertLine(alert)}`)
        }
      }
    }
    return lines.join('\n')
  }

  if (data && typeof data === 'object' && 'alertRule' in (data as Record<string, unknown>)) {
    const objectData = data as { alertRule?: Record<string, unknown>; alerts?: Array<Record<string, unknown>> }
    const lines = ['Alert rule']
    if (objectData.alertRule) {
      lines.push(...formatRuleBlock(objectData.alertRule))
    }
    const alerts = Array.isArray(objectData.alerts) ? objectData.alerts : []
    lines.push(`Alerts (${alerts.length})`)
    for (const alert of alerts.slice(0, 10)) {
      lines.push(formatAlertLine(alert))
    }
    if (alerts.length > 10) {
      lines.push(`... ${alerts.length - 10} more alerts`)
    }
    return lines.join('\n')
  }

  if (data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)) {
    return asString((data as Record<string, unknown>).message) ?? JSON.stringify(data, null, 2)
  }

  return JSON.stringify(data, null, 2)
}

function formatRuleLine(rule: Record<string, unknown>) {
  const id = asString(rule.id) ?? '<rule>'
  const alertType = asString(rule.alertType) ?? 'UNKNOWN'
  const state = asString(rule.state) ?? 'UNKNOWN'
  const subject = asString(rule.subject) ?? ''
  const mute = typeof rule.mute === 'boolean' ? (rule.mute ? ' muted' : '') : ''
  return `- ${id} [${alertType}] state=${state}${mute}${subject ? ` subject="${subject}"` : ''}`
}

function formatRuleBlock(rule: Record<string, unknown>) {
  const title = asString(rule.subject) ?? asString(rule.group) ?? asString(rule.id) ?? '<rule>'
  const id = asString(rule.id) ?? '<rule>'
  const alertType = asString(rule.alertType) ?? 'UNKNOWN'
  const state = asString(rule.state) ?? 'UNKNOWN'
  const mute = typeof rule.mute === 'boolean' ? (rule.mute ? ' muted' : '') : ''
  return [`- ${title}`, `  id=${id} [${alertType}] state=${state}${mute}`]
}

function formatAlertLine(alert: Record<string, unknown>) {
  const lastState = alert.lastState as Record<string, unknown> | undefined
  const createState = alert.createState as Record<string, unknown> | undefined
  const title =
    asString(lastState?.message) ??
    asString(createState?.message) ??
    asString(lastState?.subject) ??
    asString(createState?.subject) ??
    '<alert>'
  const state = asString(lastState?.state) ?? asString(createState?.state) ?? 'UNKNOWN'
  const active = typeof alert.active === 'boolean' ? (alert.active ? 'active' : 'inactive') : ''
  const time = asString(alert.startTime) ?? asString(lastState?.time) ?? asString(createState?.time) ?? ''
  return `- ${title} [${state}]${active ? ` ${active}` : ''}${time ? ` at ${time}` : ''}`
}

function parseInteger(value: string) {
  const parsedValue = Number.parseInt(value, 10)
  if (Number.isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.')
  }
  return parsedValue
}

function parseNumber(value: string) {
  const parsedValue = Number.parseFloat(value)
  if (Number.isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.')
  }
  return parsedValue
}

function collectOption(value: string, previous: string[] = []) {
  previous.push(value)
  return previous
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

async function buildAlertCreateBodyFromOptions(
  options: AlertCreateOptions,
  context: ReturnType<typeof createApiContext>
): Promise<AlertRuleBody | undefined> {
  if (!options.type && !options.subject && !options.query && !options.event && !options.metric) {
    return undefined
  }

  const project = await resolveProjectRef(options, context, { projectId: true })
  return buildAlertRuleBodyFromSpec(
    {
      type: options.type,
      subject: options.subject,
      message: options.message,
      query: options.query,
      event: options.event,
      metric: options.metric,
      alias: options.alias,
      sourceName: options.sourceName,
      filter: options.filter,
      groupBy: options.groupBy,
      aggr: options.aggr,
      func: options.func,
      op: options.op,
      threshold: options.threshold,
      threshold2: options.threshold2,
      for: options.for,
      interval: options.interval,
      timeColumn: options.timeColumn,
      valueColumn: options.valueColumn,
      sqlAggr: options.sqlAggr,
      projectId: project.projectId
    },
    options,
    context
  )
}

export async function buildAlertRuleBodyFromSpec(
  body: Record<string, unknown>,
  options?: AlertOptions,
  context?: ReturnType<typeof createApiContext>
): Promise<AlertRuleBody> {
  const alertType = normalizeAlertType(body.type)
  const subject = asString(body.subject)?.trim()
  if (!subject) {
    throw new CliError('Subject is required.')
  }

  const projectId =
    asString(body.projectId) ??
    (options && context ? (await resolveProjectRef(options, context, { projectId: true })).projectId : undefined)

  const rule: Record<string, unknown> = {
    projectId,
    subject,
    message: asString(body.message),
    alertType
  }

  const forDuration = parseDurationInput(body.for)
  if (forDuration) {
    rule.for = forDuration
  }

  const intervalDuration = parseDurationInput(body.interval)
  if (intervalDuration) {
    rule.interval = intervalDuration
  }

  switch (alertType) {
    case 'LOG': {
      const query = asString(body.query)?.trim()
      if (!query) {
        throw new CliError('LOG alerts require --query or a YAML/JSON `query` field.')
      }
      rule.logCondition = {
        query,
        comparisonOp: normalizeAlertOperator(body.op),
        threshold: requireThreshold(body.threshold, 'LOG alerts require --threshold or a YAML/JSON `threshold` field.'),
        threshold2: asNumber(body.threshold2)
      }
      break
    }
    case 'SQL': {
      const query = asString(body.query)?.trim()
      if (!query) {
        throw new CliError('SQL alerts require --query or a YAML/JSON `query` field.')
      }
      rule.query = query
      rule.sqlCondition = {
        sqlQuery: query
      }
      const valueColumn = asString(body.valueColumn)
      const timeColumn = asString(body.timeColumn)
      const op = normalizeAlertOperator(body.op, true)
      const threshold = asNumber(body.threshold)
      if (
        valueColumn ||
        timeColumn ||
        op ||
        threshold !== undefined ||
        body.sqlAggr !== undefined ||
        body.threshold2 !== undefined
      ) {
        if (!valueColumn || !timeColumn || !op || threshold === undefined) {
          throw new CliError(
            'SQL alerts require --value-column, --time-column, --op, and --threshold for inline column conditions.'
          )
        }
        ;(rule.sqlCondition as Record<string, unknown>).columnCondition = {
          valueColumn,
          timeColumn,
          comparisonOp: op,
          threshold,
          threshold2: asNumber(body.threshold2),
          aggregation: normalizeSqlAggregation(body.sqlAggr)
        }
      }
      break
    }
    case 'METRIC': {
      const querySpecs = normalizeAlertQuerySpecs(body)
      if (querySpecs.length === 0) {
        throw new CliError('METRIC alerts require --metric or --event, or a YAML/JSON `queries` section.')
      }
      if (querySpecs.length > 1 && !asString(body.formula)?.trim()) {
        throw new CliError('Metric alert YAML with multiple queries requires a `formula` field.')
      }
      rule.condition = {
        insightQueries: querySpecs.map((querySpec, index) => buildConditionInsightQuery(querySpec, index)),
        comparisonOp: normalizeAlertOperator(body.op),
        threshold: requireThreshold(
          body.threshold,
          'METRIC alerts require --threshold or a YAML/JSON `threshold` field.'
        ),
        threshold2: asNumber(body.threshold2)
      }
      const formula = normalizeFormula(body.formula)
      if (formula) {
        ;(rule.condition as Record<string, unknown>).formula = formula
      }
      break
    }
  }

  return { rule: rule as AlertRuleBody['rule'] }
}

function normalizeAlertQuerySpecs(body: Record<string, unknown>) {
  if (Array.isArray(body.queries)) {
    return body.queries.map((entry) => normalizeAlertQuerySpec(entry))
  }

  if (body.metric || body.event) {
    return [normalizeAlertQuerySpec(body)]
  }

  return []
}

function normalizeAlertQuerySpec(value: unknown): AlertQuerySpec {
  if (!value || typeof value !== 'object') {
    throw new CliError('Each metric alert query must be an object.')
  }
  const spec = value as Record<string, unknown>
  return {
    id: asString(spec.id),
    event: asString(spec.event),
    metric: asString(spec.metric),
    alias: asString(spec.alias),
    sourceName: asString(spec.sourceName),
    filter: normalizeMaybeStringList(spec.filter),
    groupBy: normalizeMaybeStringList(spec.groupBy),
    aggr: asString(spec.aggr),
    func: normalizeMaybeStringList(spec.func)
  }
}

function buildConditionInsightQuery(spec: AlertQuerySpec, index: number) {
  if (spec.event && spec.metric) {
    throw new CliError('Use exactly one of --event or --metric for METRIC alerts.')
  }
  if (!spec.event && !spec.metric) {
    throw new CliError('METRIC alert queries require exactly one of `event` or `metric`.')
  }

  const queryId = spec.id ?? defaultQueryId(index)

  if (spec.metric) {
    const queryBody = buildMetricsInsightQueryBody(spec.metric, {
      alias: spec.alias,
      sourceName: spec.sourceName,
      filter: normalizeMaybeStringList(spec.filter),
      groupBy: normalizeMaybeStringList(spec.groupBy),
      aggr: spec.aggr,
      func: normalizeMaybeStringList(spec.func)
    })
    const query = {
      ...(queryBody.queries?.[0] as { metricsQuery?: Record<string, unknown> })?.metricsQuery,
      id: queryId
    }
    return {
      metricsQuery: query,
      sourceName: spec.sourceName ?? ''
    }
  }

  const queryBody = buildEventsInsightQueryBody(spec.event!, {
    alias: spec.alias,
    sourceName: spec.sourceName,
    filter: normalizeMaybeStringList(spec.filter),
    groupBy: normalizeMaybeStringList(spec.groupBy),
    aggr: spec.aggr,
    func: normalizeMaybeStringList(spec.func)
  })
  const query = { ...(queryBody.queries?.[0] as { eventsQuery?: Record<string, unknown> })?.eventsQuery, id: queryId }
  return {
    eventsQuery: query,
    sourceName: spec.sourceName ?? ''
  }
}

function normalizeAlertType(value: unknown) {
  const normalized = asString(value)?.trim().toUpperCase()
  if (!normalized) {
    throw new CliError('Alert type is required. Use --type METRIC, LOG, or SQL.')
  }
  if (normalized === 'METRIC' || normalized === 'LOG' || normalized === 'SQL') {
    return normalized
  }
  throw new CliError(`Invalid alert type "${String(value)}". Use METRIC, LOG, or SQL.`)
}

function normalizeAlertOperator(value: unknown, optional = false) {
  const normalized = asString(value)?.trim()
  if (!normalized) {
    if (optional) {
      return undefined
    }
    throw new CliError('Invalid alert operator "". Use one of >, >=, ==, !=, <, <=, or between.')
  }
  if (['>', '>=', '==', '!=', '<', '<=', 'between'].includes(normalized)) {
    return normalized
  }
  throw new CliError(`Invalid alert operator "${normalized}". Use one of >, >=, ==, !=, <, <=, or between.`)
}

function normalizeSqlAggregation(value: unknown) {
  const normalized = asString(value)?.trim().toUpperCase() ?? 'MAX'
  if (['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'LAST'].includes(normalized)) {
    return normalized
  }
  throw new CliError(`Invalid SQL aggregation "${String(value)}". Use COUNT, SUM, AVG, MAX, MIN, or LAST.`)
}

function normalizeFormula(value: unknown) {
  if (!value) {
    return undefined
  }
  if (typeof value === 'string') {
    return {
      expression: value,
      disabled: false
    }
  }
  if (typeof value === 'object') {
    return value
  }
  throw new CliError('Formula must be a string or object.')
}

function normalizeMaybeStringList(value: unknown): string[] {
  if (value === undefined || value === null) {
    return []
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => normalizeMaybeStringList(entry))
  }
  throw new CliError('Expected a string or array of strings.')
}

function parseDurationInput(value: unknown) {
  if (!value) {
    return undefined
  }
  if (typeof value === 'object') {
    return value
  }
  const text = asString(value)?.trim()
  if (!text) {
    return undefined
  }
  const match = /^(\d+)([a-zA-Z]+)$/.exec(text)
  if (!match) {
    throw new CliError(`Invalid duration "${text}". Use forms like 5m, 1h, or 7d.`)
  }
  return {
    value: Number.parseInt(match[1], 10),
    unit: match[2]
  }
}

function requireThreshold(value: unknown, errorMessage: string) {
  const threshold = asNumber(value)
  if (threshold === undefined) {
    throw new CliError(errorMessage)
  }
  return threshold
}

function asNumber(value: unknown) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : undefined
}

function defaultQueryId(index: number) {
  return String.fromCharCode('a'.charCodeAt(0) + index)
}

const ALERT_CREATE_DOC = `
Alert create file format

The --file/--stdin input is passed directly to Sentio's alert create API.
Any valid SaveAlertRuleRequest body is accepted.

Supported alert types in this CLI:
  METRIC: use rule.condition
  LOG: use rule.logCondition
  SQL: use rule.sqlCondition

Top-level fields:
  rule:
    projectId: optional project id, auto-resolved when omitted
    alertType: METRIC, LOG, or SQL
    subject: alert title
    message: optional alert message template
    for: optional evaluation duration
    interval: optional evaluation interval
    condition: metric alert condition
    logCondition: log alert condition
    sqlCondition: sql alert condition

Metric alert example:
  rule:
    alertType: METRIC
    subject: net flow anomaly
    message: net flow is too high
    for:
      value: 5
      unit: m
    interval:
      value: 1
      unit: m
    condition:
      comparisonOp: ">"
      threshold: 100000
      formula:
        expression: a - b
        disabled: false
      insightQueries:
        - metricsQuery:
            id: a
            alias: inflow
            query: inflow
            labelSelector:
              meta.chain: "1"
            aggregate:
              op: SUM
            disabled: false
        - metricsQuery:
            id: b
            alias: outflow
            query: outflow
            labelSelector:
              meta.chain: "1"
            aggregate:
              op: SUM
            disabled: false

Log alert example:
  NOTE: logCondition.query uses Elasticsearch query-string syntax.
  Ranges MUST use field:>value form — C-style "field > value" is rejected at evaluation time.
  Examples: amount:>1000000  timestamp:>=2024-01-01  amount:[1000 TO 9999]  status:error
  rule:
    alertType: LOG
    subject: large transfer logs
    logCondition:
      query: amount:>1000
      comparisonOp: ">"
      threshold: 0

SQL alert example:
  rule:
    alertType: SQL
    subject: large transfer(SQL demo)
    query: select timestamp, amount from transfer where amount > 1000
    sqlCondition:
      sqlQuery: select timestamp, amount from transfer where amount > 1000
      columnCondition:
        timeColumn: timestamp
        valueColumn: amount
        aggregation: MAX
        comparisonOp: ">"
        threshold: 1000
`
