import { after, before, describe, test } from 'node:test'
import assert from 'assert'
import { ChannelStoreContext, ServiceManager } from './service-manager.js'
import { CallContext } from 'nice-grpc-common'
import { DeepPartial, HandlerType, PreprocessStreamResponse } from '@sentio/protos'
import { Subject } from 'rxjs'

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
    const result = await service.process(
      {
        handlerType: HandlerType.UNKNOWN,
        data: {},
        handlerIds: []
      },
      undefined
    )
    assert.equal(result.states?.configUpdated, true)
  })

  test('Check run with db context', async () => {
    const subject = new Subject<DeepPartial<PreprocessStreamResponse>>()
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
      context
    )

    assert(opId >= 0, 'opId should be greater than 0')
  })

  after(async () => {
    await service.stop({}, TEST_CONTEXT)
  })
})
