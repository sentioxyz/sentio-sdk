import { PriceService } from '@sentio/api'
import { Command, InvalidArgumentError } from '@commander-js/extra-typings'
import process from 'process'
import yaml from 'yaml'
import { CliError, createApiContext, handleCommandError, loadJsonInput, unwrapApiResult } from '../api.js'

interface PriceOptions {
  host?: string
  apiKey?: string
  token?: string
  json?: boolean
  yaml?: boolean
}

interface PriceGetOptions extends PriceOptions {
  coin?: string
  symbol?: string
  address?: string
  chain?: string
  timestamp?: string
  source?: string
  enablePythSource?: boolean
}

interface PriceBatchOptions extends PriceOptions {
  file?: string
  stdin?: boolean
}

interface PriceCoinsOptions extends PriceOptions {
  limit?: number
  offset?: number
  searchQuery?: string
  chain?: string
}

interface PriceCoinId {
  symbol?: string
  address?: {
    address?: string
    chain?: string
  }
}

export function createPriceCommand() {
  const priceCommand = new Command('price').description('Query Sentio price data')
  priceCommand.addCommand(createPriceGetCommand())
  priceCommand.addCommand(createPriceBatchCommand())
  priceCommand.addCommand(createPriceCoinsCommand())
  priceCommand.addCommand(createPriceCheckLatestCommand())
  return priceCommand
}

function createPriceGetCommand() {
  return withOutputOptions(withAuthOptions(new Command('get').description('Get a coin price')))
    .showHelpAfterError()
    .option('--coin <id>', 'Coin id as SYMBOL or chain:0xaddress')
    .option('--symbol <symbol>', 'Coin symbol like ETH')
    .option('--address <address>', 'Coin contract address')
    .option('--chain <chain>', 'Chain identifier for --address')
    .option('--timestamp <timestamp>', 'Requested timestamp')
    .option('--source <source>', 'Optional price source override')
    .option('--enable-pyth-source', 'Enable Pyth source in experimental flag')
    .addHelpText(
      'after',
      `

Examples:
  $ sentio price get --symbol ETH
  $ sentio price get --coin ETH
  $ sentio price get --coin 1:0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2
  $ sentio price get --address 0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2 --chain 1
`
    )
    .action(async (options, command) => {
      try {
        await runPriceGet(options)
      } catch (error) {
        handlePriceCommandError(error, command)
      }
    })
}

function createPriceBatchCommand() {
  return withOutputOptions(withJsonInputOptions(withAuthOptions(new Command('batch').description('Batch get prices'))))
    .showHelpAfterError()
    .addHelpText(
      'after',
      `

Examples:
  $ sentio price batch --file prices.yaml
  $ sentio price batch --stdin < prices.json
`
    )
    .action(async (options, command) => {
      try {
        await runPriceBatch(options)
      } catch (error) {
        handlePriceCommandError(error, command)
      }
    })
}

function createPriceCoinsCommand() {
  return withOutputOptions(withAuthOptions(new Command('coins').description('List supported coins')))
    .showHelpAfterError()
    .option('--limit <count>', 'Limit results', parseInteger)
    .option('--offset <count>', 'Offset results', parseInteger)
    .option('--search-query <query>', 'Search query')
    .option('--chain <chain>', 'Filter by chain')
    .action(async (options, command) => {
      try {
        await runPriceCoins(options)
      } catch (error) {
        handlePriceCommandError(error, command)
      }
    })
}

function createPriceCheckLatestCommand() {
  return withOutputOptions(withAuthOptions(new Command('check-latest').description('Check latest available prices')))
    .showHelpAfterError()
    .action(async (options, command) => {
      try {
        await runPriceCheckLatest(options)
      } catch (error) {
        handlePriceCommandError(error, command)
      }
    })
}

async function runPriceGet(options: PriceGetOptions) {
  const context = createApiContext(options)
  const coin = normalizeCoinInput(options)
  const response = await PriceService.getPrice({
    query: {
      timestamp: options.timestamp,
      'coinId.symbol': coin.symbol,
      'coinId.address.address': coin.address?.address,
      'coinId.address.chain': coin.address?.chain,
      source: options.source,
      'experimentalFlag.enablePythSource': options.enablePythSource
    },
    headers: context.headers
  })
  printOutput(options, {
    coinId: coin,
    ...(unwrapApiResult(response) as Record<string, unknown>)
  })
}

async function runPriceBatch(options: PriceBatchOptions) {
  const context = createApiContext(options)
  const body = loadJsonInput(options)
  if (!body) {
    throw new CliError('Provide --file or --stdin for price batch.')
  }
  const response = await PriceService.batchGetPrices({
    body: body as never,
    headers: context.headers
  })
  printOutput(options, unwrapApiResult(response))
}

async function runPriceCoins(options: PriceCoinsOptions) {
  const context = createApiContext(options)
  const response = await PriceService.priceListCoins({
    query: {
      limit: options.limit,
      offset: options.offset,
      searchQuery: options.searchQuery,
      chain: options.chain
    },
    headers: context.headers
  })
  printOutput(options, unwrapApiResult(response))
}

async function runPriceCheckLatest(options: PriceOptions) {
  const context = createApiContext(options)
  const response = await PriceService.checkLatestPrice({
    headers: context.headers
  })
  printOutput(options, unwrapApiResult(response))
}

function withAuthOptions<T extends Command<any, any, any>>(command: T) {
  return command
    .option('--host <host>', 'Override Sentio host')
    .option('--api-key <key>', 'Use an explicit API key instead of saved credentials')
    .option('--token <token>', 'Use an explicit bearer token instead of saved credentials')
}

function withJsonInputOptions<T extends Command<any, any, any>>(command: T) {
  return command
    .option('--file <path>', 'Read request JSON or YAML from file')
    .option('--stdin', 'Read request JSON or YAML from stdin')
}

function withOutputOptions<T extends Command<any, any, any>>(command: T) {
  return command.option('--json', 'Print raw JSON response').option('--yaml', 'Print raw YAML response')
}

function handlePriceCommandError(error: unknown, command?: Command) {
  if (
    error instanceof CliError &&
    (error.message.startsWith('Provide exactly one coin identifier.') ||
      error.message.startsWith('Address-based price lookup requires --chain.') ||
      error.message.startsWith('Provide --file or --stdin for price batch.'))
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

function printOutput(options: PriceOptions, data: unknown) {
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
  if (
    data &&
    typeof data === 'object' &&
    ('price' in (data as Record<string, unknown>) || 'coinId' in (data as Record<string, unknown>))
  ) {
    const objectData = data as Record<string, unknown>
    const lines = [`Coin: ${formatCoinId(objectData.coinId)}`]
    if (typeof objectData.price === 'number') {
      lines.push(`Price: ${objectData.price} USD`)
    }
    if (typeof objectData.timestamp === 'string') {
      lines.push(`Timestamp: ${objectData.timestamp}`)
    }
    if (typeof objectData.source === 'string') {
      lines.push(`Source: ${objectData.source}`)
    }
    return lines.join('\n')
  }

  if (data && typeof data === 'object' && Array.isArray((data as { prices?: unknown[] }).prices)) {
    const prices = (data as { prices: Array<Record<string, unknown>> }).prices
    const lines = [`Prices (${prices.length})`]
    for (const entry of prices) {
      const coin = formatCoinId(entry.coinId)
      const priceObject = entry.price as Record<string, unknown> | undefined
      const result = Array.isArray(priceObject?.results)
        ? (priceObject?.results?.[0] as Record<string, unknown> | undefined)
        : undefined
      const error = typeof entry.error === 'string' ? entry.error : undefined
      if (error) {
        lines.push(`- ${coin}: error=${error}`)
        continue
      }
      lines.push(
        `- ${coin}: ${typeof result?.price === 'number' ? `${result.price} USD` : 'n/a'}${typeof result?.timestamp === 'string' ? ` at ${result.timestamp}` : ''}`
      )
    }
    return lines.join('\n')
  }

  if (data && typeof data === 'object' && Array.isArray((data as { coins?: unknown[] }).coins)) {
    const coins = (data as { coins: Array<Record<string, unknown>> }).coins
    const lines = [`Coins (${coins.length})`]
    for (const coin of coins) {
      lines.push(`- ${formatCoinId(coin)}`)
    }
    return lines.join('\n')
  }

  if (
    data &&
    typeof data === 'object' &&
    ('latestPrice' in (data as Record<string, unknown>) || 'prices' in (data as Record<string, unknown>))
  ) {
    const objectData = data as { latestPrice?: Record<string, unknown>; prices?: Array<Record<string, unknown>> }
    const lines: string[] = []
    if (objectData.latestPrice) {
      lines.push('Latest price')
      lines.push(
        `- ${formatCoinId(objectData.latestPrice.coinId)}: ${objectData.latestPrice.price ?? 'n/a'} USD${objectData.latestPrice.timestamp ? ` at ${objectData.latestPrice.timestamp}` : ''}`
      )
    }
    const prices = Array.isArray(objectData.prices) ? objectData.prices : []
    if (prices.length > 0) {
      lines.push(`Prices (${prices.length})`)
      for (const entry of prices) {
        lines.push(
          `- ${formatCoinId(entry.coinId)}: ${entry.price ?? 'n/a'} USD${entry.timestamp ? ` at ${entry.timestamp}` : ''}`
        )
      }
    }
    return lines.join('\n')
  }

  return JSON.stringify(data, null, 2)
}

function normalizeCoinInput(options: PriceGetOptions): PriceCoinId {
  const explicitKinds = [Boolean(options.coin), Boolean(options.symbol), Boolean(options.address)].filter(
    Boolean
  ).length
  if (explicitKinds !== 1) {
    throw new CliError('Provide exactly one coin identifier. Use --coin, --symbol, or --address.')
  }

  if (options.coin) {
    return parseCoinIdentifier(options.coin)
  }
  if (options.symbol) {
    return { symbol: options.symbol }
  }
  if (!options.chain) {
    throw new CliError('Address-based price lookup requires --chain.')
  }
  return {
    address: {
      address: options.address,
      chain: options.chain
    }
  }
}

function parseCoinIdentifier(value: string) {
  const trimmed = value.trim()
  const addressMatch = /^([^:]+):(0x[a-fA-F0-9]+)$/.exec(trimmed)
  if (addressMatch) {
    return {
      address: {
        chain: addressMatch[1],
        address: addressMatch[2]
      }
    }
  }
  return {
    symbol: trimmed
  }
}

function formatCoinId(value: unknown) {
  const coin = (value ?? {}) as { symbol?: string; address?: { address?: string; chain?: string } }
  if (coin.symbol) {
    return coin.symbol
  }
  if (coin.address?.chain || coin.address?.address) {
    return `${coin.address?.chain ?? '?'}:${coin.address?.address ?? '?'}`
  }
  return '<coin>'
}

function parseInteger(value: string) {
  const parsedValue = Number.parseInt(value, 10)
  if (Number.isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.')
  }
  return parsedValue
}
