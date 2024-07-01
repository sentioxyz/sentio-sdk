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

const STORE_BATCH_IDLE = process.env['STORE_BATCH_IDLE'] ? parseInt(process.env['STORE_BATCH_IDLE']) : 1

type Request = Omit<DBRequest, 'opId'>
export const timeoutError = Symbol()

export class StoreContext {
  private static opCounter = 0n

  private send_counts: Record<string, number> = {}
  private recv_counts: Record<string, number> = {}

  private defers = new Map<
    bigint,
    { resolve: (value: any) => void; reject: (reason?: any) => void; requestType?: string }
  >()
  private statsInterval: NodeJS.Timeout | undefined

  constructor(
    readonly subject: Subject<DeepPartial<ProcessStreamResponse>>,
    readonly processId: number
  ) {}

  newPromise<T>(opId: bigint, requestType?: string) {
    return new Promise<T>((resolve, reject) => {
      this.defers.set(opId, { resolve, reject, requestType })
    })
  }

  sendRequest(request: DeepPartial<Request>, timeoutSecs?: number): Promise<DBResponse> {
    if (STORE_BATCH_IDLE > 0 && request.upsert) {
      // batch upsert if possible
      return this.sendUpsert(request.upsert as DBRequest_DBUpsert, STORE_BATCH_IDLE)
    }

    const opId = StoreContext.opCounter++
    const promise = this.newPromise(opId)

    const start = Date.now()
    const promises = [promise]
    console.debug('sending db request ', opId, request)
    let timer: NodeJS.Timeout | undefined
    if (timeoutSecs) {
      const timeoutPromise = new Promise((_r, rej) => (timer = setTimeout(rej, timeoutSecs * 1000, timeoutError)))
      promises.push(timeoutPromise)
    }

    const requestType = Object.keys(request)[0] as string
    this.subject.next({
      dbRequest: {
        ...request,
        opId
      },
      processId: this.processId
    })

    this.send_counts[requestType] = (this.send_counts[requestType] || 0) + 1

    return Promise.race(promises)
      .then((result: DBResponse) => {
        console.info('db request', requestType, 'op', opId, ' took', Date.now() - start, 'ms')
        return result
      })
      .catch((e) => {
        if (e === timeoutError) {
          console.error('db request', requestType, 'op:', opId, ' timeout')
        }
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
        this.recv_counts[defer.requestType] = (this.recv_counts[defer.requestType] || 0) + 1
      }
      if (dbResult.error) {
        defer.reject(new Error(dbResult.error))
      } else {
        defer.resolve(dbResult)
      }
      this.defers.delete(opId)
    }
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
      req.data = this.queuedUpsert.data.concat(req.data)
      return this.queuedUpsertPromise
    } else {
      this.queuedUpsert = req
      const opId = StoreContext.opCounter++
      const promise = this.newPromise<DBResponse>(opId)
      this.queuedUpsertPromise = promise
      await delay(batchIdleMs)
      this.queuedUpsertPromise = undefined
      this.queuedUpsert = undefined
      console.log('sending upsert', opId, 'batch size', req.entity.length)
      this.subject.next({
        dbRequest: {
          upsert: req,
          opId
        },
        processId: this.processId
      })
      this.send_counts['upsert'] = (this.send_counts['upsert'] || 0) + 1

      return promise
    }
  }

  startPrintStats() {
    this.statsInterval = setInterval(() => {
      console.log('send counts', this.send_counts)
      console.log('recv counts', this.recv_counts)
    }, 10000)
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
