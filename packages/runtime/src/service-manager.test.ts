import { after, before, describe, test } from 'node:test'
import assert from 'assert'
import { ChannelStoreContext, ServiceManager } from './service-manager.js'
import { CallContext } from 'nice-grpc-common'
import { DeepPartial, HandlerType, ProcessResult, ProcessStreamRequest, ProcessStreamResponse } from '@sentio/protos'
import { Subject } from 'rxjs'

class AsyncPushGenerator<T> {
  private queue: T[] = [] // Queue to hold pushed values
  private resolveWait: ((value: T) => void) | null = null // Resolve function for waiting
  private rejectWait: ((reason: any) => void) | null = null // Resolve function for waiting
  private waiting: boolean = false // Flag to track if the generator is waiting for a value
  private isClosed: boolean = false // Flag to track if the generator is closed
  private readonly DONE = Symbol('done') // Symbol to signal generator completion

  constructor() {}

  // Push a new value into the generator
  push(value: T): void {
    if (this.waiting) {
      // If the generator is waiting, resolve the pending promise
      this.resolveWait!(value)
      this.waiting = false
    } else {
      // Otherwise, add the value to the queue
      this.queue.push(value)
    }
  }

  // Close the generator
  close(): void {
    if (this.isClosed) return // Already closed
    this.isClosed = true
    if (this.waiting) {
      // If the generator is waiting, resolve the pending promise with the DONE signal
      this.rejectWait!(this.DONE)
      this.waiting = false
    }
  }

  // The async generator function
  async *generator(): AsyncGenerator<T, void, unknown> {
    while (true) {
      if (this.queue.length > 0) {
        // If there are values in the queue, yield them
        yield this.queue.shift()!
      } else {
        // If the queue is empty, wait for a new value to be pushed
        const value = await new Promise<T>((resolve, reject) => {
          this.resolveWait = resolve
          this.rejectWait = reject
          this.waiting = true
        })
        yield value
      }
    }
  }
}

export const TEST_CONTEXT: CallContext = <CallContext>{}

describe('Test Service Manager with worker', () => {
  const service = new ServiceManager(
    {
      worker: 1,
      target: './test-processor.test.js',
      ['chains-config']: 'chains-config.json'
    },
    async () => {}
  )

  before(async () => {
    await service.start({ templateInstances: [] }, TEST_CONTEXT)
    await service.getConfig({}, TEST_CONTEXT)
  })

  test('Check run processbinding in worker', async () => {
    const result = (await service.process(
      {
        handlerType: HandlerType.UNKNOWN,
        data: {},
        handlerIds: []
      },
      1,
      undefined
    )) as ProcessResult
    assert.equal(result.states?.configUpdated, true)
  })

  test('Check run with db context', async () => {
    const subject = new Subject<DeepPartial<ProcessStreamResponse>>()
    let opId: bigint = -1n
    subject.subscribe((req) => {
      opId = req.dbRequest?.opId ?? -1n
      // response something to unblock the processor
      context.result({
        opId
      })
    })
    const context = new ChannelStoreContext(subject, 1)

    await service.process(
      {
        handlerType: HandlerType.UNKNOWN,
        data: {},
        handlerIds: []
      },
      1,
      context
    )

    assert(opId >= 0, 'opId should be greater than 0')
  })

  test('Check startup flow', async () => {
    const generator = new AsyncPushGenerator<ProcessStreamRequest>()

    const responses = service.processBindingsStream(generator.generator(), TEST_CONTEXT)

    generator.push({
      processId: 1,
      binding: {
        handlerIds: [0],
        handlerType: HandlerType.ETH_LOG,
        data: {}
      }
    })

    let i = 0

    await (async () => {
      for await (const resp of responses) {
        const processId = resp.processId
        assert.equal(processId, 1)
        // first request should be a db request
        if (i === 0) {
          // should match a db request
          assert.equal(resp.dbRequest?.get?.id, 1)
          assert.equal(resp.dbRequest?.get?.entity, 'Test')

          // send db response
          generator.push({
            processId: 1,
            dbResult: {
              opId: resp.dbRequest?.opId ?? -1n
            }
          })
        }
        if (i === 1) {
          // second request should be a process request
          assert.equal(resp.result?.states?.configUpdated, true)
          break
        }
        i++
      }
    })()

    // prevent test from ending before the async generator is done
    await new Promise((resolve) => setTimeout(resolve, 2000))
    assert.equal(i, 1)
  })

  after(async () => {
    await service.stop({}, TEST_CONTEXT)
  })
})
