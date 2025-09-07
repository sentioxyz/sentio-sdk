import { Command, InvalidArgumentError } from '@commander-js/extra-typings'

let workerNum = 1
try {
  workerNum = parseInt(process.env['PROCESSOR_WORKER']?.trim() ?? '1')
} catch (e) {
  console.error('Failed to parse worker number', e)
}

function myParseInt(value: string, dummyPrevious: number): number {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10)
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.')
  }
  return parsedValue
}

export const program = new Command('processor-runner')
  .allowUnknownOption()
  .allowExcessArguments()
  .name('processor-runner')
  .description('Sentio Processor Runtime')
  .argument('<target>', 'Path to the processor module to load')
  .option('-p, --port <port>', 'Port to listen on', '4000')
  .option('--concurrency <number>', 'Number of concurrent workers', myParseInt, 4)
  .option('--batch-count <number>', 'Batch count for processing', myParseInt, 1)
  .option('-c, --chains-config <path>', 'Path to chains configuration file', 'chains-config.json')
  .option('--chainquery-server <url>', 'Chain query server URL')
  .option('--pricefeed-server <url>', 'Price feed server URL')
  .option('--log-format <format>', 'Log format (console|json)', 'console')
  .option('--debug', 'Enable debug mode')
  .option('--otlp-debug', 'Enable OTLP debug mode')
  .option('--start-action-server', 'Start action server instead of processor server')
  .option('--worker <number>', 'Number of worker threads', myParseInt, workerNum)
  .option('--process-timeout <seconds>', 'Process timeout in seconds', myParseInt, 60)
  .option(
    '--worker-timeout <seconds>',
    'Worker timeout in seconds',
    myParseInt,
    parseInt(process.env['WORKER_TIMEOUT_SECONDS'] || '60')
  )
  .option(
    '--enable-partition',
    'Enable binding data partition',
    process.env['SENTIO_ENABLE_BINDING_DATA_PARTITION'] === 'true'
  )

export type ProcessorRuntimeOptions = ReturnType<typeof program.opts> & { target: string }

export function getTestConfig(config?: Partial<ProcessorRuntimeOptions>): ProcessorRuntimeOptions {
  return {
    ...program.opts(),
    target: './test-processor.test.js',
    ...config
  }
}
