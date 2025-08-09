import { describe, it } from 'node:test'
import { Subject } from 'rxjs'
import { from } from 'ix/asynciterable'
import {
  DBRequest,
  DBResponse,
  DeepPartial,
  ProcessResult,
  ProcessStreamRequest,
  ProcessStreamResponse
} from '@sentio/protos'
import { withAbort } from 'ix/Ix.asynciterable.operators'

class AsyncContext {
  private defers = new Map<bigint, { resolve: (value: any) => void; reject: (reason?: any) => void }>()

  subject = new Subject<DeepPartial<ProcessStreamResponse>>()

  newPromise(opId: bigint) {
    return new Promise((resolve, reject) => {
      this.defers.set(opId, { resolve, reject })
    })
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

class DB {
  private opCounter = 0n

  constructor(readonly context: AsyncContext) {}

  async get(id: number): Promise<any> {
    const opId = this.opCounter++
    this.context.subject.next({
      dbRequest: {
        opId,
        get: {
          entity: 'test',
          id: id + ''
        }
      }
    })

    return this.context.newPromise(opId)
  }
}

describe('Test generators', () => {
  async function userFunction(db: DB): Promise<ProcessResult> {
    const result = await db.get(1)
    console.log('db returns ', result)
    const result2 = await db.get(2)
    console.log('db returns ', result2)
    return ProcessResult.fromPartial({})
  }

  function processBinding(binding: ProcessStreamRequest, context: AsyncContext) {
    const db = new DB(context)
    userFunction(db).then((result) => {
      db.context.subject.next({
        result,
        processId: binding.processId
      })
      db.context.subject.complete()
    })
  }

  async function* processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, signal: AbortSignal) {
    const dbContext = new AsyncContext()
    new Promise(async (resolve, reject) => {
      for await (const request of requests) {
        if (request.binding) {
          processBinding(request, dbContext)
        }
        if (request.dbResult) {
          dbContext.result(request.dbResult)
        }
      }
      resolve(null)
    }).then(() => {
      dbContext.subject.complete()
    })
    yield* from(dbContext.subject).pipe(withAbort(signal))
  }

  function dbServer(request: DeepPartial<DBRequest>): DBResponse {
    if (request.get) {
      return {
        opId: request.opId!,
        data: {
          id: request.get.id,
          name: request.get.entity
        }
      }
    }
    throw 'invalid request'
  }

  it('should generate values', async () => {
    const requests = new Subject<ProcessStreamRequest>()
    setTimeout(() => {
      requests.next({
        processId: 0,
        binding: {
          handlerIds: [],
          handlerType: 0,
          data: {},
          chainId: '1'
        }
      })
    }, 10)
    for await (const v of processBindingsStream(from(requests), new AbortController().signal)) {
      if (v.dbRequest) {
        console.log('db request', v.dbRequest)
        if (v.dbRequest) {
          requests.next({
            processId: v.processId!,
            dbResult: dbServer(v.dbRequest)
          })
        }
      }
      if (v.result) {
        console.log('result', v.result)
      }
    }
  })
})
