import { Subject } from 'rxjs'
import {
  DBRequest,
  DBRequest_DBUpsert,
  DBResponse,
  DeepPartial,
  ProcessResult,
  ProcessStreamResponse
} from '@sentio/protos'
import * as process from 'node:process'
import { Attributes, Counter, metrics } from '@opentelemetry/api'

const STORE_BATCH_IDLE = process.env['STORE_BATCH_IDLE'] ? parseInt(process.env['STORE_BATCH_IDLE']) : 0

type Request = Omit<DBRequest, 'opId'>
type RequestType = keyof Request

const meter = metrics.getMeter('store')
const send_counts: Record<RequestType, Counter<Attributes>> = {
  get: meter.createCounter('store_get_count'),
  upsert: meter.createCounter('store_upsert_count'),
  list: meter.createCounter('store_list_count'),
  delete: meter.createCounter('store_delete_count')
}
const recv_counts: Record<RequestType, Counter<Attributes>> = {
  get: meter.createCounter('store_get_count'),
  upsert: meter.createCounter('store_upsert_count'),
  list: meter.createCounter('store_list_count'),
  delete: meter.createCounter('store_delete_count')
}
const request_times: Record<RequestType, Counter<Attributes>> = {
  get: meter.createCounter('store_get_time'),
  upsert: meter.createCounter('store_upsert_time'),
  list: meter.createCounter('store_list_time'),
  delete: meter.createCounter('store_delete_time')
}
const request_errors: Record<RequestType, Counter<Attributes>> = {
  get: meter.createCounter('store_get_error'),
  upsert: meter.createCounter('store_upsert_error'),
  list: meter.createCounter('store_list_error'),
  delete: meter.createCounter('store_delete_error')
}

const unsolved_requests = meter.createGauge('store_unsolved_requests')

export const timeoutError = Symbol()

export class StoreContext {
  private static opCounter = 0n

  private defers = new Map<
    bigint,
    { resolve: (value: any) => void; reject: (reason?: any) => void; requestType?: RequestType }
  >()
  private statsInterval: NodeJS.Timeout | undefined

  constructor(
    readonly subject: Subject<DeepPartial<ProcessStreamResponse>>,
    readonly processId: number
  ) {}

  newPromise<T>(opId: bigint, requestType?: RequestType) {
    return new Promise<T>((resolve, reject) => {
      this.defers.set(opId, { resolve, reject, requestType })
      unsolved_requests.record(this.defers.size, { processId: this.processId })
    })
  }

  sendRequest(request: DeepPartial<Request>, timeoutSecs?: number): Promise<DBResponse> {
    if (STORE_BATCH_IDLE > 0 && request.upsert) {
      // batch upsert if possible
      return this.sendUpsert(request.upsert as DBRequest_DBUpsert, STORE_BATCH_IDLE)
    }

    const requestType = Object.keys(request)[0] as RequestType
    const opId = StoreContext.opCounter++
    const promise = this.newPromise(opId, requestType)

    const start = Date.now()
    const promises = [promise]
    console.debug('sending db request ', opId, request)
    let timer: NodeJS.Timeout | undefined
    if (timeoutSecs) {
      const timeoutPromise = new Promise((_r, rej) => (timer = setTimeout(rej, timeoutSecs * 1000, timeoutError)))
      promises.push(timeoutPromise)
    }

    this.subject.next({
      dbRequest: {
        ...request,
        opId
      },
      processId: this.processId
    })

    send_counts[requestType]?.add(1)

    return Promise.race(promises)
      .then((result: DBResponse) => {
        console.debug('db request', requestType, 'op', opId, ' took', Date.now() - start, 'ms')
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
    console.debug('received db result ', opId, dbResult)
    if (defer) {
      if (defer.requestType) {
        recv_counts[defer.requestType]?.add(1)
      }
      if (dbResult.error) {
        defer.reject(new Error(dbResult.error))
      } else {
        defer.resolve(dbResult)
      }
      this.defers.delete(opId)
    }
    unsolved_requests.record(this.defers.size, { processId: this.processId })
  }

  error(processId: number, e: any) {
    console.error('process error', processId, e)
    const errorResult = ProcessResult.create({
      states: {
        error: e?.toString()
      }
    })
    this.subject.next({
      result: errorResult,
      processId
    })
  }

  close() {
    for (const [opId, defer] of this.defers) {
      console.warn('context closed before db response', opId)
      defer.reject(new Error('context closed'))
    }
    this.defers.clear()
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
    }
  }

  queuedUpsert: DBRequest_DBUpsert | undefined
  queuedUpsertPromise: Promise<DBResponse> | undefined

  private async sendUpsert(req: DBRequest_DBUpsert, batchIdleMs: number): Promise<DBResponse> {
    if (this.queuedUpsert && this.queuedUpsertPromise) {
      // merge the upserts
      req.entity = this.queuedUpsert.entity.concat(req.entity)
      req.entityData = this.queuedUpsert.entityData.concat(req.entityData)
      req.id = this.queuedUpsert.id.concat(req.id)

      return this.queuedUpsertPromise
    } else {
      this.queuedUpsert = req
      const opId = StoreContext.opCounter++
      const promise = this.newPromise<DBResponse>(opId, 'upsert')
      this.queuedUpsertPromise = promise
      await delay(batchIdleMs)
      this.queuedUpsertPromise = undefined
      this.queuedUpsert = undefined
      console.debug('sending upsert', opId, 'batch size', req.entity.length)
      this.subject.next({
        dbRequest: {
          upsert: req,
          opId
        },
        processId: this.processId
      })
      send_counts['upsert']?.add(1)

      return promise
    }
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
