import { Subject } from 'rxjs'
import { DBRequest, DBResponse, DeepPartial, ProcessResult, ProcessStreamResponse } from '@sentio/protos'

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
    const opId = StoreContext.opCounter++
    const promise = this.newPromise(opId)

    const start = Date.now()
    const promises = [promise]
    console.debug('sending db request ', opId, request)
    if (timeoutSecs) {
      const timeoutPromise = new Promise((_r, rej) => (timer = setTimeout(rej, timeoutSecs * 1000, timeoutError)))
      promises.push(timeoutPromise)
    }

    let timer: NodeJS.Timeout | undefined
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
}
