import { describe, test } from 'node:test'
import assert from 'assert'
import { Subject } from 'rxjs'
import { create } from '@bufbuild/protobuf'
import { RichStructSchema } from '@sentio/protos'

// STORE_UPSERT_NO_ACK is read when the module loads, so it is set before the
// dynamic import. node:test runs every file in its own process, so the flag does
// not leak into db-context.test.ts.
process.env['STORE_UPSERT_NO_ACK'] = 'true'
const { DataBindingContext } = await import('./db-context.js')

// With STORE_UPSERT_NO_ACK an upsert is sent with no_response and the context
// never waits for its DBResponse: neither the caller nor awaitPendings() before the
// final result. The stream applies ops in order, so the write still lands before
// the result; the round trip for the acknowledgement is what goes away.

function upsertReq(id: string) {
  return {
    case: 'upsert' as const,
    value: { entity: ['E'], id: [id], entityData: [create(RichStructSchema, {})] }
  }
}

function collect(subject: Subject<any>) {
  const messages: any[] = []
  subject.subscribe((msg: any) => messages.push(msg))
  return messages
}

async function resolvesWithin(promise: Promise<unknown>, ms: number): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined
  const timeout = new Promise<boolean>((resolve) => (timer = setTimeout(() => resolve(false), ms)))
  const done = promise.then(() => true)
  const outcome = await Promise.race([done, timeout])
  clearTimeout(timer)
  return outcome
}

describe('DataBindingContext with STORE_UPSERT_NO_ACK', () => {
  test('a batched upsert goes out flagged no_response and reads stay acknowledged', async () => {
    const subject = new Subject<any>()
    const messages = collect(subject)
    const ctx = new DataBindingContext(1, subject)

    const upsert = ctx.sendRequest(upsertReq('1'))
    assert.strictEqual(await resolvesWithin(upsert, 100), true, 'the caller does not wait for an acknowledgement')

    // the read flushes the batch ahead of itself (read-your-writes)
    void ctx.sendRequest({ case: 'get', value: { entity: 'E', id: '1' } })
    const ops = messages.map((m) => m.value?.value?.op?.case)
    assert.deepStrictEqual(ops, ['upsert', 'get'])
    assert.strictEqual(messages[0].value.value.noResponse, true, 'the upsert asks for no response')
    assert.ok(!messages[1].value.value.noResponse, 'the get still expects its response')
  })

  test('awaitPendings() flushes the batch and returns without any DBResponse', async () => {
    const subject = new Subject<any>()
    const messages = collect(subject)
    const ctx = new DataBindingContext(2, subject)

    void ctx.sendRequest(upsertReq('1'))
    void ctx.sendRequest(upsertReq('2'))
    assert.strictEqual(messages.length, 0, 'nothing is sent before the flush')

    const pending = ctx.awaitPendings()
    assert.strictEqual(await resolvesWithin(pending, 100), true, 'no acknowledgement is awaited')
    assert.strictEqual(messages.length, 1, 'both upserts left in one batch')
    assert.strictEqual(messages[0].value.value.noResponse, true)
    assert.deepStrictEqual(messages[0].value.value.op.value.id, ['1', '2'])
  })
})
