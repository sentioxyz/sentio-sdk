import { describe, it } from 'node:test'
import { Subject } from 'rxjs'
import { from } from 'ix/asynciterable'
import {
  type DBResponse,
  ProcessResultSchema,
  ProcessStreamRequestSchema,
  ProcessStreamResponseSchema
} from '@sentio/protos'
import { create, type MessageInitShape } from '@bufbuild/protobuf'
import { withAbort } from 'ix/Ix.asynciterable.operators'

type ProcessStreamRequestInit = MessageInitShape<typeof ProcessStreamRequestSchema>
type ProcessStreamResponseInit = MessageInitShape<typeof ProcessStreamResponseSchema>

class AsyncContext {
  private defers = new Map<bigint, { resolve: (value: any) => void; reject: (reason?: any) => void }>()

  subject = new Subject<ProcessStreamResponseInit>()

  newPromise(opId: bigint) {
    return new Promise((resolve, reject) => {
      this.defers.set(opId, { resolve, reject })
    })
  }

  result(dbResult: DBResponse) {
    const opId = dbResult.opId
    const defer = this.defers.get(opId)
    if (defer) {
      if (dbResult.value.case === 'error') {
        defer.reject(dbResult.value.value)
      } else {
        defer.resolve(dbResult.value.case === 'entityList' ? dbResult.value.value : undefined)
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
      value: {
        case: 'dbRequest',
        value: {
          opId,
          op: {
            case: 'get',
            value: {
              entity: 'test',
              id: id + ''
            }
          }
        }
      }
    })

    return this.context.newPromise(opId)
  }
}

describe('Test generators', () => {
  async function userFunction(db: DB) {
    const result = await db.get(1)
    console.log('db returns ', result)
    const result2 = await db.get(2)
    console.log('db returns ', result2)
    return create(ProcessResultSchema, {})
  }

  function processBinding(binding: { processId: number }, context: AsyncContext) {
    const db = new DB(context)
    userFunction(db).then((result) => {
      db.context.subject.next({
        value: { case: 'result', value: result },
        processId: binding.processId
      })
      db.context.subject.complete()
    })
  }

  async function* processBindingsStream(requests: AsyncIterable<ProcessStreamRequestInit>, signal: AbortSignal) {
    const dbContext = new AsyncContext()
    new Promise(async (resolve, reject) => {
      for await (const request of requests) {
        if (request.value?.case === 'binding') {
          processBinding({ processId: request.processId ?? 0 }, dbContext)
        }
        if (request.value?.case === 'dbResult') {
          dbContext.result(request.value.value as DBResponse)
        }
      }
      resolve(null)
    }).then(() => {
      dbContext.subject.complete()
    })
    yield* from(dbContext.subject).pipe(withAbort(signal))
  }

  function dbServer(request: {
    opId: bigint
    op: { case?: string; value?: any }
  }): MessageInitShape<typeof ProcessStreamRequestSchema>['value'] {
    if (request.op.case === 'get') {
      return {
        case: 'dbResult',
        value: {
          opId: request.opId,
          value: {
            case: 'entityList',
            value: {
              entities: [
                {
                  entity: request.op.value.entity
                }
              ]
            }
          }
        }
      }
    }
    throw 'invalid request'
  }

  it('should generate values', async () => {
    const requests = new Subject<ProcessStreamRequestInit>()
    setTimeout(() => {
      requests.next({
        processId: 0,
        value: {
          case: 'binding',
          value: {
            handlerIds: [],
            handlerType: 0,
            data: {},
            chainId: '1'
          }
        }
      })
    }, 10)
    for await (const v of processBindingsStream(from(requests), new AbortController().signal)) {
      if (v.value?.case === 'dbRequest') {
        console.log('db request', v.value.value)
        requests.next({
          processId: v.processId ?? 0,
          value: dbServer(v.value.value as { opId: bigint; op: { case?: string; value?: any } })
        })
      }
      if (v.value?.case === 'result') {
        console.log('result', v.value.value)
      }
    }
  })
})
