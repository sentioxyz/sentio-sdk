import { Subject } from 'rxjs'
import {
  DBRequestSchema,
  type DBRequest_DBUpsert,
  type DBResponse,
  DBResponseSchema,
  ProcessResultSchema,
  ProcessStreamResponseSchema,
  ProcessStreamResponseV3Schema,
  type TemplateInstance,
  type TimeseriesResult
} from '@sentio/protos'
import { create, type MessageInitShape } from '@bufbuild/protobuf'
import * as process from 'node:process'
import { dbMetrics } from './metrics.js'

const {
  request_errors,
  unsolved_requests,
  request_times,
  batched_request_count,
  batched_total_count,
  send_counts,
  recv_counts
} = dbMetrics
const STORE_BATCH_IDLE = process.env['STORE_BATCH_MAX_IDLE'] ? parseInt(process.env['STORE_BATCH_MAX_IDLE']) : 1
const STORE_BATCH_SIZE = process.env['STORE_BATCH_SIZE'] ? parseInt(process.env['STORE_BATCH_SIZE']) : 10
const STORE_UPSERT_NO_WAIT = process.env['STORE_UPSERT_NO_WAIT'] === 'true'

// Init-shapes carried over the rxjs Subject before being yielded by connect.
type ProcessStreamResponseInit = MessageInitShape<typeof ProcessStreamResponseSchema>
type ProcessStreamResponseV3Init = MessageInitShape<typeof ProcessStreamResponseV3Schema>

// The DBRequest oneof selection (without the op_id), e.g. { case: 'upsert', value: {...} }.
// protobuf-es moved the per-op flat fields under the `op` oneof.
type Request = NonNullable<MessageInitShape<typeof DBRequestSchema>['op']>
type RequestType = NonNullable<Request['case']>

export const timeoutError = new Error('timeout')

// Name the entity and id, not just the op kind: "get BinanceAlphaPriceEntity 56-0x…"
// usually points straight at the call site, while a bare "get" rarely does.
function describeRequest(request: Request): string {
  switch (request.case) {
    case 'get':
      return `get ${request.value.entity} ${request.value.id}`
    case 'list':
      return `list ${request.value.entity}`
    case 'upsert':
    case 'update':
    case 'delete': {
      const entities = [...new Set(request.value.entity ?? [])].join(',')
      return `${request.case} ${entities} (${request.value.id?.length ?? 0} row(s))`
    }
    default:
      // The oneof can be unset, in which case `case` is undefined.
      return request.case ?? 'op'
  }
}

export interface IStoreContext {
  sendRequest(request: Request, timeoutSecs?: number): Promise<DBResponse>

  result(dbResult: DBResponse): void

  error(processId: number, e: any): void

  close(): void
}

export interface IDataBindingContext extends IStoreContext {
  sendTemplateRequest(templates: Array<TemplateInstance>, unbind: boolean): void
  sendTimeseriesRequest(timeseries: Array<TimeseriesResult>): void
}

export abstract class AbstractStoreContext implements IStoreContext {
  private static opCounter = 0n
  protected defers = new Map<
    bigint,
    { resolve: (value: any) => void; reject: (reason?: any) => void; requestType?: RequestType }
  >()
  private statsInterval: NodeJS.Timeout | undefined
  private pendings: Promise<unknown>[] = []
  // Set once the process has finished and the context was closed. Guards
  // against a lingering batch timer emitting after the final result (which
  // would both lose the write and desync the reused processor stream).
  protected closed = false

  constructor(readonly processId: number) {}

  newPromise<T>(opId: bigint, requestType?: RequestType) {
    return new Promise<T>((resolve, reject) => {
      this.defers.set(opId, { resolve, reject, requestType })
      unsolved_requests.record(this.defers.size, { processId: this.processId })
    })
  }

  abstract doSend(resp: ProcessStreamResponseInit | ProcessStreamResponseV3Init): void

  sendRequest(request: Request, timeoutSecs?: number): Promise<DBResponse> {
    if (this.closed) {
      return Promise.reject(this.reportLateMessage(`store ${describeRequest(request)}`, this.sendRequest))
    }

    if (STORE_BATCH_IDLE > 0 && STORE_BATCH_SIZE > 1 && request.case === 'upsert') {
      // batch upsert if possible
      return this.sendUpsertInBatch(request.value as DBRequest_DBUpsert)
    }

    // Read-your-writes: any non-upsert op (get/list/delete) must observe the
    // upserts issued before it. Flush the pending batch first so its dbRequest
    // is sent ahead of this op on the same stream; the driver applies stream
    // ops in arrival order, so the read/delete sees the buffered writes.
    this.sendBatch()

    const requestType = request.case as RequestType
    const opId = StoreContext.opCounter++
    const promise = this.newPromise<DBResponse>(opId, requestType)

    const start = Date.now()
    const promises = [promise]
    // console.debug('sending db request ', opId, request)
    let timer: NodeJS.Timeout | undefined
    if (timeoutSecs) {
      const timeoutPromise = new Promise<DBResponse>(
        (_r, rej) => (timer = setTimeout(rej, timeoutSecs * 1000, timeoutError))
      )
      promises.push(timeoutPromise)
    }

    this.doSend({
      value: {
        case: 'dbRequest',
        value: {
          op: request,
          opId
        }
      }
    })

    send_counts[requestType]?.add(1)

    if (requestType === 'upsert' && STORE_UPSERT_NO_WAIT) {
      this.pendings.push(promise)
      return Promise.resolve(create(DBResponseSchema, { opId }))
    }

    return Promise.race(promises)
      .then((result: DBResponse) => {
        request_times[requestType]?.add(Date.now() - start)
        return result
      })
      .catch((e) => {
        if (e === timeoutError) {
          console.error('db request', requestType, 'op:', opId, ' timeout')
        }
        request_errors[requestType]?.add(1)
        throw e
      })
      .finally(() => {
        if (timer) {
          clearTimeout(timer)
        }
      })
  }

  result(dbResult: DBResponse) {
    const opId = dbResult.opId
    const defer = this.defers.get(opId)
    // console.debug('received db result ', opId, dbResult)
    if (defer) {
      if (defer.requestType) {
        recv_counts[defer.requestType]?.add(1)
      }
      if (dbResult.value.case === 'error') {
        defer.reject(new Error(dbResult.value.value))
      } else {
        defer.resolve(dbResult)
      }
      this.defers.delete(opId)
    }
    unsolved_requests.record(this.defers.size, { processId: this.processId })
  }

  error(processId: number, e: any) {
    const stack = e.stack
    console.error('process error', processId, e, stack)
    const errorResult = create(ProcessResultSchema, {
      states: {
        error: e?.toString() + (stack ? `\n${stack}` : '')
      }
    })
    this.doSend({ value: { case: 'result', value: errorResult }, processId })
  }

  /**
   * Mark the process finished. Must be called synchronously *immediately before*
   * the final result is emitted — not from a later `.finally()`.
   *
   * Once the result is on the stream the driver may hand that stream to another
   * process, so nothing may follow it. The gap between emitting the result and
   * close() running is several microtasks wide, which is more than enough for a
   * detached continuation to wake up and slip a request through: without this the
   * observed outbound order is ["result", "dbRequest"], exactly what the guards
   * exist to prevent. close() still does the teardown afterwards.
   */
  finish() {
    this.closed = true
  }

  close() {
    this.closed = true
    // Drop any un-flushed batch and cancel its timer so it can never emit
    // after close. In the normal path awaitPendings() has already flushed it;
    // reaching here with a pending batch means the process ended without
    // awaiting the write (e.g. a handler error), so emitting it now would be
    // both too late (lost from this checkpoint) and stream-corrupting.
    if (this.upsertBatch) {
      clearTimeout(this.upsertBatch.timer)
      this.upsertBatch = undefined
    }
    for (const [opId, defer] of this.defers) {
      // console.warn('context closed before db response', opId)
      defer.reject(new Error('context closed before db response, processId: ' + this.processId + ' opId: ' + opId))
    }
    this.defers.clear()
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
    }
  }

  upsertBatch:
    | {
        opId: bigint
        request: DBRequest_DBUpsert
        promise: Promise<DBResponse>
        timer: NodeJS.Timeout
      }
    | undefined = undefined

  private async sendUpsertInBatch(req: DBRequest_DBUpsert): Promise<DBResponse> {
    if (this.upsertBatch) {
      // merge the upserts
      const { request, promise, opId } = this.upsertBatch
      request.entity = request.entity.concat(req.entity)
      request.entityData = request.entityData.concat(req.entityData)
      request.id = request.id.concat(req.id)
      if (request.entity.length >= STORE_BATCH_SIZE) {
        this.sendBatch()
      }
      if (STORE_UPSERT_NO_WAIT) {
        return create(DBResponseSchema, { opId })
      }

      return promise
    } else {
      const opId = StoreContext.opCounter++
      const timeout = setTimeout(() => {
        this.sendBatch()
      }, STORE_BATCH_IDLE)
      const start = Date.now()
      const promise = this.newPromise<DBResponse>(opId, 'upsert').finally(() => {
        request_times['upsert'].add(Date.now() - start)
      })

      this.upsertBatch = {
        opId,
        request: req,
        promise,
        timer: timeout
      }

      if (STORE_UPSERT_NO_WAIT) {
        this.pendings.push(promise)
        return create(DBResponseSchema, { opId: this.upsertBatch.opId })
      } else {
        return promise
      }
    }
  }

  private sendBatch() {
    // Never emit once the context is closed: the process already sent its
    // final result and the stream may have been handed to another process.
    if (this.closed) {
      return
    }
    if (this.upsertBatch) {
      const { request, opId, timer } = this.upsertBatch
      // console.debug('sending batch upsert', opId, 'batch size', request?.entity.length)
      clearTimeout(timer)
      this.upsertBatch = undefined
      this.doSend({
        value: {
          case: 'dbRequest',
          value: {
            op: { case: 'upsert', value: request },
            opId
          }
        }
      })
      send_counts['upsert']?.add(1)
      batched_request_count.add(1)
      batched_total_count.add(request.entity.length)
    }
  }

  /**
   * Report a message the process tried to emit after it had already finished, and
   * return the Error describing it.
   *
   * Such a message cannot be delivered: the final result was already sent, and the
   * stream it would go out on has been handed back to the pool and may now belong to
   * another process — writing to it makes the driver fail *that* process with ERR200
   * "unexpected ProcessID". Dropping it is the only safe option.
   *
   * This always logs rather than relying solely on the rejection, because the late
   * call is nearly always on a path that already swallows errors — the classic case
   * being one `Promise.all` branch rejecting while its siblings keep running — so the
   * rejection alone would be invisible. The Error is built here, at the call site, so
   * its stack points into the handler code that failed to await.
   *
   * `boundary` is the runtime entry point the caller came through; its frame and
   * everything below it is trimmed from the stack so the very first line the user
   * reads is their own code rather than two frames of ours.
   */
  protected reportLateMessage(what: string, boundary?: (...args: never[]) => unknown): Error {
    const err = new Error(
      `[sentio] ${what} was issued after process ${this.processId} had already finished, so it was dropped. ` +
        `Something in the handler was still running after the handler returned — every store write, ` +
        `store read and metric must be awaited before the handler completes. A common cause is one ` +
        `Promise.all() branch rejecting while its siblings keep running: Promise.all rejects immediately ` +
        `but does NOT cancel the others, so give each branch its own .catch() (or use Promise.allSettled) ` +
        `to keep them inside the handler. The stack below points at the call that arrived too late.`
    )
    Error.captureStackTrace?.(err, boundary ?? this.reportLateMessage)
    console.error(err)
    return err
  }

  async awaitPendings() {
    // Flush any buffered upsert batch and wait for its ack before returning.
    // Callers use this to guarantee every write has been sent AND applied by
    // the driver before the process emits its final result. Without it the
    // batch's setTimeout could fire after the result — losing the write and
    // leaving a stray message on the pooled processor stream (surfacing to the
    // driver as ERR200 "unexpected ProcessID").
    if (this.upsertBatch) {
      const { promise } = this.upsertBatch
      this.sendBatch()
      this.pendings.push(promise)
    }
    await Promise.all(this.pendings)
  }
}

export class StoreContext extends AbstractStoreContext {
  constructor(
    readonly subject: Subject<ProcessStreamResponseInit>,
    processId: number
  ) {
    super(processId)
  }

  doSend(resp: ProcessStreamResponseInit) {
    this.subject.next({
      ...resp,
      processId: this.processId
    })
  }
}

// for service v3
export class DataBindingContext extends AbstractStoreContext implements IDataBindingContext {
  constructor(
    readonly processId: number,
    readonly subject: Subject<ProcessStreamResponseV3Init>
  ) {
    super(processId)
  }

  sendTemplateRequest(templates: Array<TemplateInstance>, unbind: boolean) {
    if (this.closed) {
      this.reportLateMessage(
        `${unbind ? 'unbind' : 'bind'} of ${templates.length} template instance(s)`,
        this.sendTemplateRequest
      )
      return
    }
    this.subject.next({
      processId: this.processId,
      value: {
        case: 'tplRequest',
        value: {
          templates,
          remove: unbind
        }
      }
    })
  }
  sendTimeseriesRequest(timeseries: Array<TimeseriesResult>) {
    if (this.closed) {
      this.reportLateMessage(`${timeseries.length} timeseries record(s)`, this.sendTimeseriesRequest)
      return
    }
    this.subject.next({
      processId: this.processId,
      value: {
        case: 'tsRequest',
        value: {
          data: timeseries
        }
      }
    })
  }

  doSend(resp: ProcessStreamResponseV3Init) {
    this.subject.next({
      ...resp,
      processId: this.processId
    })
  }
}
