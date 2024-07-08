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

type Request = Omit<DBRequest, 'opId'>
type RequestType = keyof Request

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
    if (STORE_BATCH_IDLE > 0 && STORE_BATCH_SIZE > 1 && request.upsert) {
      // batch upsert if possible
      return this.sendUpsertInBatch(request.upsert as DBRequest_DBUpsert)
    }

    const requestType = Object.keys(request)[0] as RequestType
    const opId = StoreContext.opCounter++
    const promise = this.newPromise(opId, requestType)

    const start = Date.now()
    const promises = [promise]
    // console.debug('sending db request ', opId, request)
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
        if (timeoutSecs) {
          console.debug('db request', requestType, 'op', opId, ' took', Date.now() - start, 'ms')
        }
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
      const { request, promise } = this.upsertBatch
      request.entity = this.upsertBatch.request.entity.concat(req.entity)
      request.entityData = this.upsertBatch.request.entityData.concat(req.entityData)
      request.id = this.upsertBatch.request.id.concat(req.id)
      if (request.entity.length >= STORE_BATCH_SIZE) {
        this.sendBatch()
      }
      return promise
    } else {
      const opId = StoreContext.opCounter++
      const promise = this.newPromise<DBResponse>(opId, 'upsert')
      const timeout = setTimeout(() => {
        this.sendBatch()
      }, STORE_BATCH_IDLE)

      this.upsertBatch = {
        opId,
        request: req,
        promise,
        timer: timeout
      }

      return promise
    }
  }

  private sendBatch() {
    if (this.upsertBatch) {
      const { request, opId, timer } = this.upsertBatch
      console.debug('sending batch upsert', opId, 'batch size', request?.entity.length)
      clearTimeout(timer)
      this.upsertBatch = undefined
      this.subject.next({
        dbRequest: {
          upsert: request,
          opId
        },
        processId: this.processId
      })
      send_counts['upsert']?.add(1)
      batched_request_count.add(1)
      batched_total_count.add(request.entity.length)
    }
  }
}
