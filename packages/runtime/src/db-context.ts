import { Subject } from 'rxjs'
import { DBRequest, DBResponse, DeepPartial, ProcessResult, ProcessStreamResponse } from '@sentio/protos'

type Request = Omit<DBRequest, 'opId'>

export class StoreContext {
  private opCounter = 0n

  private defers = new Map<bigint, { resolve: (value: any) => void; reject: (reason?: any) => void }>()

  subject = new Subject<DeepPartial<ProcessStreamResponse>>()

  newPromise<T>(opId: bigint) {
    return new Promise<T>((resolve, reject) => {
      this.defers.set(opId, { resolve, reject })
    })
  }

  sendRequest(request: DeepPartial<Request>) {
    const opId = this.opCounter++
    const promise = this.newPromise(opId)
    console.debug('sending db request ', opId, request)
    this.subject.next({
      dbRequest: {
        ...request,
        opId
      }
    })
    return promise
  }

  result(dbResult: DBResponse) {
    const opId = dbResult.opId
    const defer = this.defers.get(opId)
    console.debug('received db result ', opId, dbResult)
    if (defer) {
      if (dbResult.error) {
        defer.reject(dbResult.error)
      } else if (dbResult.list) {
        defer.reject(dbResult.list)
      } else {
        defer.resolve(dbResult.data)
      }
      this.defers.delete(opId)
    }
  }

  error(processId: number, e: any) {
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
