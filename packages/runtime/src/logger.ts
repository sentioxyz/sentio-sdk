import { createLogger, format, transports } from 'winston'

function stringify(obj: any): string {
  const cache = new WeakSet()
  return JSON.stringify(obj, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]'
      }
      cache.add(value)
    }
    return value
  })
}

/**
 * Caps on what a processor may write through `console.*`.
 *
 * Every line the processor prints ends up as a container log line that the platform's log
 * collector has to parse, buffer and ship; a handler that prints a multi-megabyte value on
 * every invocation can emit tens of GB per hour and take the node-local collector down with it.
 * These limits keep a single processor's output bounded. A value of 0 disables that limit.
 */
export interface LogGuardOptions {
  /** Longest message (in UTF-8 bytes) a single line may carry; longer ones are cut with a notice. */
  maxLineBytes: number
  /** Lines admitted per wall-clock second; the rest of that second is dropped and summarised. */
  maxLinesPerSecond: number
  /** Message bytes admitted per wall-clock second; the rest of that second is dropped and summarised. */
  maxBytesPerSecond: number
}

export const DEFAULT_LOG_GUARD_OPTIONS: LogGuardOptions = {
  maxLineBytes: 16 * 1024,
  maxLinesPerSecond: 1000,
  maxBytesPerSecond: 1024 * 1024
}

export const LOG_GUARD_ENV = {
  maxLineBytes: 'SENTIO_LOG_MAX_LINE_BYTES',
  maxLinesPerSecond: 'SENTIO_LOG_MAX_LINES_PER_SECOND',
  maxBytesPerSecond: 'SENTIO_LOG_MAX_BYTES_PER_SECOND'
} as const

/** Reads the guard limits from the environment, falling back to the defaults for unset or invalid values. */
export function logGuardOptionsFromEnv(env: NodeJS.ProcessEnv = process.env): LogGuardOptions {
  const read = (key: keyof LogGuardOptions): number => {
    const raw = env[LOG_GUARD_ENV[key]]?.trim()
    if (!raw) {
      return DEFAULT_LOG_GUARD_OPTIONS[key]
    }
    const value = Number(raw)
    return Number.isSafeInteger(value) && value >= 0 ? value : DEFAULT_LOG_GUARD_OPTIONS[key]
  }
  return {
    maxLineBytes: read('maxLineBytes'),
    maxLinesPerSecond: read('maxLinesPerSecond'),
    maxBytesPerSecond: read('maxBytesPerSecond')
  }
}

const WINDOW_MS = 1000

/**
 * Per-process accounting behind {@link LogGuardOptions}: truncates oversized text and decides,
 * per one-second window, whether another line still fits. Lines that do not fit are dropped;
 * once the window ends a single summary line reports how many were lost, via `onSummary`.
 */
export class LogGuard {
  private windowStart = -Infinity
  private lines = 0
  private bytes = 0
  private droppedLines = 0
  private droppedBytes = 0
  private summaryTimer: NodeJS.Timeout | undefined

  constructor(
    private readonly options: LogGuardOptions,
    private readonly onSummary: (summary: string) => void,
    private readonly now: () => number = Date.now
  ) {}

  /** Returns `text` unchanged when it fits in `maxLineBytes`, otherwise its head plus a notice. */
  truncate(text: string): string {
    const max = this.options.maxLineBytes
    // A UTF-16 code unit never encodes to more than 3 UTF-8 bytes, so short strings skip the byte count.
    if (max <= 0 || text.length * 3 <= max) {
      return text
    }
    const size = Buffer.byteLength(text)
    if (size <= max) {
      return text
    }
    // stream: true makes the decoder hold back a partially cut multi-byte character instead of
    // emitting U+FFFD for it, so the cut lands on a character boundary.
    const head = new TextDecoder().decode(Buffer.from(text).subarray(0, max), { stream: true })
    return `${head} ...[truncated by sentio runtime: line was ${size} bytes, limit ${max}]`
  }

  /** Accounts a line of `size` bytes against the current window; `false` means the line must be dropped. */
  admit(size: number): boolean {
    const t = this.now()
    if (t - this.windowStart >= WINDOW_MS) {
      this.rollWindow(t)
    }
    const { maxLinesPerSecond, maxBytesPerSecond } = this.options
    const overLines = maxLinesPerSecond > 0 && this.lines + 1 > maxLinesPerSecond
    const overBytes = maxBytesPerSecond > 0 && this.bytes + size > maxBytesPerSecond
    if (overLines || overBytes) {
      this.droppedLines++
      this.droppedBytes += size
      this.scheduleSummary(this.windowStart + WINDOW_MS - t)
      return false
    }
    this.lines++
    this.bytes += size
    return true
  }

  /** Emits the pending drop summary, if any, without waiting for the window to end. */
  flush(): void {
    if (this.summaryTimer) {
      clearTimeout(this.summaryTimer)
      this.summaryTimer = undefined
    }
    if (this.droppedLines === 0) {
      return
    }
    const { droppedLines, droppedBytes } = this
    this.droppedLines = 0
    this.droppedBytes = 0
    const { maxLinesPerSecond, maxBytesPerSecond } = this.options
    this.onSummary(
      `[sentio runtime] dropped ${droppedLines} console log lines (${droppedBytes} bytes) in the last second: ` +
        `output rate limit exceeded (max ${maxLinesPerSecond} lines/s, ${maxBytesPerSecond} bytes/s)`
    )
  }

  private rollWindow(t: number): void {
    this.flush()
    this.windowStart = t
    this.lines = 0
    this.bytes = 0
  }

  private scheduleSummary(delayMs: number): void {
    if (this.summaryTimer) {
      return
    }
    // The summary must also appear when the burst is followed by silence, so do not wait for the next
    // line to roll the window. unref keeps the timer from holding the process open on shutdown.
    this.summaryTimer = setTimeout(
      () => {
        this.summaryTimer = undefined
        this.flush()
      },
      Math.max(delayMs, 0)
    )
    this.summaryTimer.unref?.()
  }
}

const GUARD_BYPASS = Symbol.for('sentio.logGuardBypass')

// Fields winston or the formats above put on `info` themselves. Anything else is metadata that winston
// copied from a trailing object argument (`console.log('msg', { ... })`) and that the json/simple
// formats would serialise in full, on top of the copy utilFormatter already rendered into `message`.
const OWN_INFO_FIELDS = new Set(['level', 'message', 'timestamp', 'stack'])

/** Serialised size of the metadata fields on `info`, or Infinity when they cannot be serialised. */
function metadataBytes(info: any, keys: string[]): number {
  if (keys.length === 0) {
    return 0
  }
  const meta: Record<string, unknown> = {}
  for (const key of keys) {
    meta[key] = info[key]
  }
  try {
    return Buffer.byteLength(stringify(meta))
  } catch {
    return Infinity
  }
}

export function setupLogger(
  json: boolean,
  enableDebug: boolean,
  workerId?: number,
  guardOptions: LogGuardOptions = logGuardOptionsFromEnv()
) {
  const utilFormatter = {
    transform: (info: any) => {
      const stringRes = []

      if (typeof info.message === 'object') {
        stringRes.push(stringify(info.message))
      } else {
        stringRes.push(info.message)
      }

      const args = info[Symbol.for('splat')]
      if (args) {
        for (const idx in args) {
          const arg = args[idx]
          if (typeof arg === 'object') {
            stringRes.push(stringify(arg))
          } else {
            stringRes.push(arg)
          }
        }
      }

      info.message = stringRes.join(' ')
      return info
    }
  }

  const guard = new LogGuard(guardOptions, (summary) => {
    logger.warn({ message: summary, [GUARD_BYPASS]: true } as any)
  })
  // Runs after the message and the error stack are strings: cuts oversized text and drops lines that
  // exceed the per-second budget (returning false discards the entry). The summary line bypasses the
  // guard so it cannot be dropped by the very limit it reports, and debug lines that the level filter
  // discards anyway are not charged against the budget.
  const guardFormatter = {
    transform: (info: any) => {
      if (info[GUARD_BYPASS] || (info.level === 'debug' && !enableDebug)) {
        return info
      }
      if (typeof info.message === 'string') {
        info.message = guard.truncate(info.message)
      }
      if (typeof info.stack === 'string') {
        info.stack = guard.truncate(info.stack)
      }
      const metaKeys = Object.keys(info).filter((key) => !OWN_INFO_FIELDS.has(key))
      let metaSize = metadataBytes(info, metaKeys)
      const max = guardOptions.maxLineBytes
      if (max > 0 && metaSize > max) {
        // The rendered copy in `message` has already been cut to the cap; the raw fields must not slip
        // past it through the metadata, so they are dropped rather than serialised.
        for (const key of metaKeys) {
          delete info[key]
        }
        info.message = `${info.message} ...[metadata of ${metaSize} bytes dropped by sentio runtime, limit ${max}]`
        metaSize = 0
      }
      const size =
        Buffer.byteLength(String(info.message ?? '')) +
        (typeof info.stack === 'string' ? Buffer.byteLength(info.stack) : 0) +
        metaSize
      return guard.admit(size) ? info : false
    }
  }

  const logger = createLogger({
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
      utilFormatter,
      format.errors({ stack: true }),
      guardFormatter,
      json ? format.json() : format.simple(),
      format.label({ label: workerId ? `worker #{workerId}` : '' })
    ),
    level: enableDebug ? 'debug' : 'info',
    transports: [new transports.Console()]
  })

  // Forward console output to winston, preserving `this` binding to the logger. The methods are
  // typed through `(...args: any[]) => unknown` so the variadic args can be applied without tripping
  // strict overload resolution on `Function.prototype.call`.
  const forward =
    (method: (...args: any[]) => unknown) =>
    (...args: any[]) => {
      method.apply(logger, args)
    }
  console.log = forward(logger.info)
  console.info = forward(logger.info)
  console.warn = forward(logger.warn)
  console.error = forward(logger.error)
  console.debug = forward(logger.debug)
}
