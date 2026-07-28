import { describe, test } from 'node:test'
import assert from 'assert'
import { Subject } from 'rxjs'
import { create } from '@bufbuild/protobuf'
import { RichStructSchema } from '@sentio/protos'
import { DataBindingContext } from './db-context.js'

// These tests pin the ordering guarantees the driver relies on: with the
// default batching on (STORE_BATCH_MAX_IDLE=1, STORE_BATCH_SIZE=10), a buffered
// upsert must be flushed to the stream before any later read on the same
// context, and must never be emitted once the context is closed.

function upsertReq(id: string) {
  return {
    case: 'upsert' as const,
    value: { entity: ['E'], id: [id], entityData: [create(RichStructSchema, {})] }
  }
}

function collect(subject: Subject<any>) {
  const ops: string[] = []
  subject.subscribe((msg: any) => {
    if (msg?.value?.case === 'dbRequest') {
      ops.push(msg.value.value.op?.case ?? 'unknown')
    } else if (msg?.value?.case) {
      ops.push(msg.value.case)
    }
  })
  return ops
}

describe('DataBindingContext write/read ordering', () => {
  test('a read flushes the pending upsert batch before it (read-your-writes)', () => {
    const subject = new Subject<any>()
    const ops = collect(subject)
    const ctx = new DataBindingContext(1, subject)

    // Fire-and-forget upsert: with batching on this only schedules the batch,
    // nothing is sent yet.
    void ctx.sendRequest(upsertReq('1'))
    assert.deepEqual(ops, [], 'batched upsert must not be sent synchronously')

    // A get on the same context must flush the buffered upsert first, so the
    // upsert dbRequest is on the wire ahead of the get.
    void ctx.sendRequest({ case: 'get', value: { entity: 'E', id: '1' } })
    assert.deepEqual(ops, ['upsert', 'get'], 'read must observe the prior write')
  })

  test('a pending batch is never emitted after close()', async () => {
    const subject = new Subject<any>()
    const ops = collect(subject)
    const ctx = new DataBindingContext(2, subject)

    // close() rejects any still-pending write promise; swallow it here since
    // this test only asserts nothing is *emitted* after close.
    ctx.sendRequest(upsertReq('1')).catch(() => {}) // schedules the batch timer
    ctx.close()

    // Wait well past STORE_BATCH_MAX_IDLE (1ms): the timer must have been
    // cancelled and the closed guard must suppress any emission.
    await new Promise((r) => setTimeout(r, 20))
    assert.deepEqual(ops, [], 'no emission may happen after the context is closed')
  })
})

// An operation *started* after the process finished is a different failure from a
// buffered one escaping: the handler returned while something it never awaited was
// still running (the classic case being a rejected Promise.all sibling). It must not
// reach the stream, because the stream has been recycled and the driver would fail
// whichever process owns it now with ERR200 "unexpected ProcessID".
describe('DataBindingContext rejects messages issued after close', () => {
  function silenceConsoleError() {
    const original = console.error
    const logged: unknown[] = []
    console.error = (...args: unknown[]) => void logged.push(args[0])
    return { logged, restore: () => void (console.error = original) }
  }

  test('a store op issued after close is dropped, rejected, and logged with a stack', async () => {
    const subject = new Subject<any>()
    const ops = collect(subject)
    const ctx = new DataBindingContext(3, subject)
    const { logged, restore } = silenceConsoleError()

    ctx.close()
    await assert.rejects(
      () => ctx.sendRequest({ case: 'get', value: { entity: 'BinanceAlphaPriceEntity', id: '56-0xabc' } }),
      (err: Error) => {
        // The message must name the op, entity and id so the caller can find it,
        // and carry a stack pointing at the late call.
        assert.match(err.message, /get BinanceAlphaPriceEntity 56-0xabc/)
        assert.match(err.message, /after process 3 had already finished/)
        assert.match(err.message, /Promise\.all/)
        // The frames must be in `message`: the datasource log view renders only that
        // field, so a stack left on err.stack alone never reaches the user.
        assert.match(err.message, /Issued at:/)
        assert.ok(err.message.includes('db-context.test'), 'the inlined stack must reach the caller')
        return true
      }
    )
    restore()

    assert.deepEqual(ops, [], 'a late op must never reach the stream')
    assert.equal(logged.length, 1, 'must log too — the caller usually swallows the rejection')
  })

  // A deep stack is trimmed in the middle, never at an end: the top frames are where the
  // late call was made, the bottom ones the entry point that led there.
  test('a deep stack keeps both ends and omits the middle', async () => {
    const subject = new Subject<any>()
    const ctx = new DataBindingContext(6, subject)
    const { restore } = silenceConsoleError()
    ctx.close()

    // Recurse to guarantee more frames than the head+tail budget.
    const deep = async (n: number): Promise<unknown> =>
      n === 0 ? ctx.sendRequest({ case: 'get', value: { entity: 'E', id: '1' } }) : deep(n - 1)
    const err = await deep(40).then(
      () => undefined,
      (e: Error) => e
    )
    restore()

    const message = err!.message
    assert.match(message, /frame\(s\) omitted/, 'the middle must be summarised')
    const frames = message.slice(message.indexOf('Issued at:')).split('\n').slice(1)
    // 8 head + the omission marker + 4 tail.
    assert.equal(frames.length, 13, `unexpected frame layout:\n${frames.join('\n')}`)
    assert.ok(frames[0].includes('db-context.test'), 'the innermost frame must survive')
    // The omission belongs in the middle: a marker at either end would mean that side was
    // truncated away instead.
    assert.ok(!frames[frames.length - 1].includes('omitted'), 'the outer end must be kept, not cut')
    assert.match(frames[frames.length - 1], /^\s+at /, 'and it must be a real frame')
    // Node internals are dropped first so the budget goes to frames the reader can act on.
    // V8 markers like "async Promise.all (index 0)" are not node: frames and are kept —
    // they are often the single most informative line.
    assert.ok(
      !frames.some((frame) => frame.includes('node:')),
      `node internals must not take up the budget:\n${frames.join('\n')}`
    )
  })

  test('late upserts are rejected as well, not silently buffered', async () => {
    const subject = new Subject<any>()
    const ops = collect(subject)
    const ctx = new DataBindingContext(4, subject)
    const { restore } = silenceConsoleError()

    ctx.close()
    await assert.rejects(() => ctx.sendRequest(upsertReq('1')), /upsert E \(1 row\(s\)\)/)
    restore()

    await new Promise((r) => setTimeout(r, 20))
    assert.deepEqual(ops, [], 'a late upsert must not be buffered into a new batch either')
  })

  test('late timeseries and template messages are dropped, not emitted', () => {
    const subject = new Subject<any>()
    const ops = collect(subject)
    const ctx = new DataBindingContext(5, subject)
    const { logged, restore } = silenceConsoleError()

    ctx.close()
    ctx.sendTimeseriesRequest([{} as any])
    ctx.sendTemplateRequest([{} as any], false)
    restore()

    assert.deepEqual(ops, [], 'neither may reach the recycled stream')
    assert.equal(logged.length, 2, 'both must be reported')
  })
})
