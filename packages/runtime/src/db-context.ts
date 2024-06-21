import { Subject } from 'rxjs'
import { DBRequest, DBResponse, DeepPartial, ProcessResult, ProcessStreamResponse } from '@sentio/protos'

type Request = Omit<DBRequest, 'opId'>

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

  sendRequest(request: DeepPartial<Request>) {
    const opId = StoreContext.opCounter++
    const promise = this.newPromise(opId)
    console.debug('sending db request ', opId, request)
    this.subject.next({
      dbRequest: {
        ...request,
        opId
      },
      processId: this.processId
    })
    return promise
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
}
