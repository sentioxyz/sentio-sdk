import { Subject } from 'rxjs'
import { DBRequest, DBResponse, DeepPartial, ProcessStreamResponse } from '@sentio/protos'

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
    if (defer) {
      if (dbResult.error) {
        defer.reject(dbResult.error)
      } else {
        defer.resolve(dbResult.data)
      }
      this.defers.delete(opId)
    }
  }
}
