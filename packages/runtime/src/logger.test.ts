import { describe, test, beforeEach, afterEach } from 'node:test'
import { assert } from 'chai'
import { DEFAULT_LOG_GUARD_OPTIONS, LogGuard, logGuardOptionsFromEnv, setupLogger } from './logger.js'

describe('Test logger', () => {
  test('check log output', () => {
    const object = { a: 'asdf', b: 'Asdf' }

    console.log(JSON.stringify(object), object)
    setupLogger(false, true)
    console.log('asdf')
    console.log('asdf')
    console.log(1111, true, 'asdf')
    console.log(111111111n)

    // console.log(object)
    console.log(JSON.stringify(object), object)
  })

  test('check debug log', () => {
    console.log('check debug log')
    setupLogger(false, true)
    console.debug('debug=true')
    setupLogger(true, false)
    console.debug('debug=false')
  })
})

describe('LogGuard', () => {
  test('truncates lines above maxLineBytes and leaves shorter ones alone', () => {
    const guard = new LogGuard({ maxLineBytes: 16, maxLinesPerSecond: 0, maxBytesPerSecond: 0 }, () => {})
    assert.equal(guard.truncate('short'), 'short')
    assert.equal(guard.truncate('exactly16bytes!!'), 'exactly16bytes!!')
    const long = 'a'.repeat(40)
    assert.equal(
      guard.truncate(long),
      'a'.repeat(16) + ' ...[truncated by sentio runtime: line was 40 bytes, limit 16]'
    )
    // multi-byte text is measured in bytes, not characters
    const cjk = '日本語'.repeat(10) // 90 bytes
    const cut = guard.truncate(cjk)
    assert.equal(cut, '日本語日本 ...[truncated by sentio runtime: line was 90 bytes, limit 16]')
  })

  test('maxLineBytes 0 disables truncation', () => {
    const guard = new LogGuard({ maxLineBytes: 0, maxLinesPerSecond: 0, maxBytesPerSecond: 0 }, () => {})
    const long = 'a'.repeat(100_000)
    assert.equal(guard.truncate(long), long)
  })

  test('drops lines over maxLinesPerSecond and summarises once the window ends', () => {
    let now = 1_000_000
    const summaries: string[] = []
    const guard = new LogGuard(
      { maxLineBytes: 0, maxLinesPerSecond: 2, maxBytesPerSecond: 0 },
      (s) => summaries.push(s),
      () => now
    )
    assert.isTrue(guard.admit(10))
    assert.isTrue(guard.admit(10))
    assert.isFalse(guard.admit(10))
    assert.isFalse(guard.admit(30))
    assert.deepEqual(summaries, [])

    now += 1000
    assert.isTrue(guard.admit(10))
    assert.deepEqual(summaries, [
      '[sentio runtime] dropped 2 console log lines (40 bytes) in the last second: ' +
        'output rate limit exceeded (max 2 lines/s, 0 bytes/s)'
    ])
    assert.isTrue(guard.admit(10))
    assert.isFalse(guard.admit(10))
    guard.flush()
    assert.lengthOf(summaries, 2)
    // flushing again with nothing dropped is a no-op
    guard.flush()
    assert.lengthOf(summaries, 2)
  })

  test('drops lines over maxBytesPerSecond', () => {
    let now = 0
    const summaries: string[] = []
    const guard = new LogGuard(
      { maxLineBytes: 0, maxLinesPerSecond: 0, maxBytesPerSecond: 100 },
      (s) => summaries.push(s),
      () => now
    )
    assert.isTrue(guard.admit(60))
    assert.isFalse(guard.admit(60))
    assert.isTrue(guard.admit(40))
    assert.isFalse(guard.admit(1))
    now = 999
    assert.isFalse(guard.admit(1))
    now = 1000
    assert.isTrue(guard.admit(100))
    assert.lengthOf(summaries, 1)
    assert.include(summaries[0], 'dropped 3 console log lines (62 bytes)')
    guard.flush()
  })

  test('all limits 0 means unlimited', () => {
    const guard = new LogGuard({ maxLineBytes: 0, maxLinesPerSecond: 0, maxBytesPerSecond: 0 }, () => {
      assert.fail('nothing should be dropped')
    })
    for (let i = 0; i < 10_000; i++) {
      assert.isTrue(guard.admit(1_000_000))
    }
  })

  test('the summary timer fires after a burst followed by silence', async () => {
    const summaries: string[] = []
    const guard = new LogGuard({ maxLineBytes: 0, maxLinesPerSecond: 1, maxBytesPerSecond: 0 }, (s) =>
      summaries.push(s)
    )
    assert.isTrue(guard.admit(1))
    assert.isFalse(guard.admit(1))
    await new Promise((resolve) => setTimeout(resolve, 1100))
    assert.lengthOf(summaries, 1)
    assert.include(summaries[0], 'dropped 1 console log lines (1 bytes)')
  })

  test('reads limits from the environment and falls back on invalid values', () => {
    assert.deepEqual(logGuardOptionsFromEnv({}), DEFAULT_LOG_GUARD_OPTIONS)
    assert.deepEqual(
      logGuardOptionsFromEnv({
        SENTIO_LOG_MAX_LINE_BYTES: '4096',
        SENTIO_LOG_MAX_LINES_PER_SECOND: '0',
        SENTIO_LOG_MAX_BYTES_PER_SECOND: ' 2048 '
      }),
      { maxLineBytes: 4096, maxLinesPerSecond: 0, maxBytesPerSecond: 2048 }
    )
    assert.deepEqual(
      logGuardOptionsFromEnv({
        SENTIO_LOG_MAX_LINE_BYTES: 'lots',
        SENTIO_LOG_MAX_LINES_PER_SECOND: '-5',
        SENTIO_LOG_MAX_BYTES_PER_SECOND: '1.5'
      }),
      DEFAULT_LOG_GUARD_OPTIONS
    )
  })
})

describe('setupLogger with the log guard', () => {
  // winston's Console transport writes through console._stdout, which Node maps to process.stdout;
  // swapping that (rather than process.stdout itself) keeps the test runner's own stdout traffic out.
  const originalStdout = (console as any)._stdout
  let lines: string[]

  beforeEach(() => {
    lines = []
    Object.defineProperty(console, '_stdout', {
      value: { write: (chunk: any) => lines.push(String(chunk)) },
      configurable: true,
      writable: true
    })
  })

  afterEach(() => {
    Object.defineProperty(console, '_stdout', { value: originalStdout, configurable: true, writable: true })
    setupLogger(false, true)
  })

  test('truncates, drops and summarises console output', async () => {
    setupLogger(true, false, undefined, { maxLineBytes: 32, maxLinesPerSecond: 3, maxBytesPerSecond: 0 })
    console.log('x'.repeat(100))
    console.log('second')
    console.error('third', { a: 1 })
    console.log('fourth, dropped')
    console.log('fifth, dropped')
    console.debug('debug is filtered by level, not charged')
    await new Promise((resolve) => setTimeout(resolve, 1100))

    const messages = lines.map((l) => JSON.parse(l).message as string)
    assert.lengthOf(messages, 4, lines.join(''))
    assert.equal(messages[0], 'x'.repeat(32) + ' ...[truncated by sentio runtime: line was 100 bytes, limit 32]')
    assert.equal(messages[1], 'second')
    assert.equal(messages[2], 'third {"a":1}')
    assert.equal(JSON.parse(lines[2]).a, 1, 'small metadata is still emitted')
    assert.include(messages[3], 'dropped 2 console log lines')
    assert.equal(JSON.parse(lines[3]).level, 'warn')
  })

  test('drops oversized metadata copied from object arguments', () => {
    setupLogger(true, false, undefined, { maxLineBytes: 32, maxLinesPerSecond: 0, maxBytesPerSecond: 0 })
    console.log('response', { payload: 'x'.repeat(2 * 1024 * 1024) })
    console.log('response', { payload: 'small' })
    assert.lengthOf(lines, 2)
    assert.isBelow(lines[0].length, 512, lines[0].slice(0, 200))
    const big = JSON.parse(lines[0])
    assert.isUndefined(big.payload)
    assert.include(big.message, 'truncated by sentio runtime')
    assert.include(big.message, 'metadata of 2097166 bytes dropped by sentio runtime, limit 32')
    assert.deepEqual(JSON.parse(lines[1]).payload, 'small')
  })

  test('bounds metadata in simple output mode too', () => {
    setupLogger(false, false, undefined, { maxLineBytes: 32, maxLinesPerSecond: 0, maxBytesPerSecond: 0 })
    console.log('response', { payload: 'x'.repeat(2 * 1024 * 1024) })
    assert.lengthOf(lines, 1)
    assert.isBelow(lines[0].length, 512)
  })

  test('charges metadata against the byte budget', async () => {
    setupLogger(true, false, undefined, { maxLineBytes: 0, maxLinesPerSecond: 0, maxBytesPerSecond: 100 })
    console.log('m', { payload: 'x'.repeat(200) })
    console.log('small')
    await new Promise((resolve) => setTimeout(resolve, 1100))
    const messages = lines.map((l) => JSON.parse(l).message as string)
    assert.lengthOf(messages, 2, lines.join(''))
    assert.equal(messages[0], 'small')
    assert.include(messages[1], 'dropped 1 console log lines')
  })

  test('truncates the error stack too', () => {
    setupLogger(true, false, undefined, { maxLineBytes: 64, maxLinesPerSecond: 0, maxBytesPerSecond: 0 })
    console.error(new Error('e'.repeat(200)))
    assert.lengthOf(lines, 1)
    const entry = JSON.parse(lines[0])
    assert.include(entry.message, 'truncated by sentio runtime')
    assert.include(entry.stack, 'truncated by sentio runtime')
    assert.isBelow(entry.stack.length, 200)
  })
})
