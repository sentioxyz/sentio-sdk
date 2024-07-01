import { Subject } from 'rxjs'
import {
  DBRequest,
  DBRequest_DBUpsert,
  DBResponse,
  DeepPartial,
  ProcessResult,
  ProcessStreamResponse
} from '@sentio/protos'

type Request = Omit<DBRequest, 'opId'>
export const timeoutError = Symbol()

export class StoreContext {
  private static opCounter = 0n

  private defers = new Map<bigint, { resolve: (value: any) => void; reject: (reason?: any) => void }>()

  constructor(
    readonly subject: Subject<DeepPartial<ProcessStreamResponse>>,
    readonly processId: number
  ) {}

  newPromise<T>(opId: bigint) {
    return new Promise<T>((resolve, reject) => {
      this.defers.set(opId, { resolve, reject })
    })
  }

  sendRequest(request: DeepPartial<Request>, timeoutSecs?: number): Promise<DBResponse> {
    if (request.upsert) {
      // batch upsert if possible
      return this.sendUpsert(request.upsert as DBRequest_DBUpsert)
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
  }

  queuedUpsert: DBRequest_DBUpsert | undefined
  queuedUpsertPromise: Promise<DBResponse> | undefined

  private async sendUpsert(req: DBRequest_DBUpsert, batchIdleMs = 1): Promise<DBResponse> {
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

      return promise
    }
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
