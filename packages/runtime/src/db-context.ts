import { Subject } from 'rxjs'
import {
  DBRequest,
  DBRequest_DBUpsert,
  DBResponse,
  DeepPartial,
  ProcessResult,
  ProcessStreamResponse,
  ProcessStreamResponseV3,
  TemplateInstance,
  TimeseriesResult
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
const STORE_UPSERT_NO_WAIT = process.env['STORE_UPSERT_NO_WAIT'] === 'true'

type Request = Omit<DBRequest, 'opId'>
type RequestType = keyof Request

export const timeoutError = new Error('timeout')

export interface IStoreContext {
  sendRequest(request: DeepPartial<Request>, timeoutSecs?: number): Promise<DBResponse>

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

  constructor(readonly processId: number) {}

  newPromise<T>(opId: bigint, requestType?: RequestType) {
    return new Promise<T>((resolve, reject) => {
      this.defers.set(opId, { resolve, reject, requestType })
      unsolved_requests.record(this.defers.size, { processId: this.processId })
    })
  }

  abstract doSend(resp: DeepPartial<ProcessStreamResponse>): void

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

    this.doSend({
      dbRequest: {
        ...request,
        opId
      }
    })

    send_counts[requestType]?.add(1)

    if (requestType === 'upsert' && STORE_UPSERT_NO_WAIT) {
      this.pendings.push(promise)
      return Promise.resolve({
        opId
      } as DBResponse)
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
    const stack = e.stack
    console.error('process error', processId, e, stack)
    const errorResult = ProcessResult.create({
      states: {
        error: e?.toString() + (stack ? `\n${stack}` : '')
      }
    })
    this.doSend({ result: errorResult, processId })
  }

  close() {
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
      const { request, promise } = this.upsertBatch
      request.entity = this.upsertBatch.request.entity.concat(req.entity)
      request.entityData = this.upsertBatch.request.entityData.concat(req.entityData)
      request.id = this.upsertBatch.request.id.concat(req.id)
      if (request.entity.length >= STORE_BATCH_SIZE) {
        this.sendBatch()
      }
      if (STORE_UPSERT_NO_WAIT) {
        return {
          opId: this.upsertBatch.opId
        }
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
        return {
          opId: this.upsertBatch.opId
        }
      } else {
        return promise
      }
    }
  }

  private sendBatch() {
    if (this.upsertBatch) {
      const { request, opId, timer } = this.upsertBatch
      // console.debug('sending batch upsert', opId, 'batch size', request?.entity.length)
      clearTimeout(timer)
      this.upsertBatch = undefined
      this.doSend({
        dbRequest: {
          upsert: request,
          opId
        }
      })
      send_counts['upsert']?.add(1)
      batched_request_count.add(1)
      batched_total_count.add(request.entity.length)
    }
  }

  async awaitPendings() {
    await Promise.all(this.pendings)
  }
}

export class StoreContext extends AbstractStoreContext {
  constructor(
    readonly subject: Subject<DeepPartial<ProcessStreamResponse>>,
    processId: number
  ) {
    super(processId)
  }

  doSend(resp: DeepPartial<ProcessStreamResponse>) {
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
    readonly subject: Subject<DeepPartial<ProcessStreamResponseV3>>
  ) {
    super(processId)
  }

  sendTemplateRequest(templates: Array<TemplateInstance>, unbind: boolean) {
    this.subject.next({
      processId: this.processId,
      tplRequest: {
        templates,
        remove: unbind
      }
    })
  }
  sendTimeseriesRequest(timeseries: Array<TimeseriesResult>) {
    this.subject.next({
      processId: this.processId,
      tsRequest: {
        data: timeseries
      }
    })
  }

  doSend(resp: DeepPartial<ProcessStreamResponseV3>) {
    this.subject.next({
      ...resp,
      processId: this.processId
    })
  }
}
