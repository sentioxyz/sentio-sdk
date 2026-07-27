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
