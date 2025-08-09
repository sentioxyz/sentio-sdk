import { before, describe, test } from 'node:test'
import assert from 'assert'
import { ServiceManager } from './service-manager.js'
import { CallContext } from 'nice-grpc-common'
import { DeepPartial, HandlerType, ProcessStreamResponse } from '@sentio/protos'
import { Subject } from 'rxjs'

export const TEST_CONTEXT: CallContext = <CallContext>{}

describe('Test Service Manager with worker without partition', () => {
  const service = new ServiceManager(async () => {}, {
    worker: 1,
    target: './test-processor.test.js',
    ['chains-config']: 'chains-config.json',
    ['enable-partition']: false
  })

  before(async () => {
    await service.start({ templateInstances: [] }, TEST_CONTEXT)
    await service.getConfig({}, TEST_CONTEXT)
  })

  test('should initialize worker pool with correct options', async () => {
    // The pool should be initialized after start and getConfig
    assert.ok(service['pool'], 'Worker pool should be initialized')
    assert.strictEqual(service['options'].worker, 1, 'Worker count should match options')
    assert.strictEqual(service['options']['enable-partition'], false, 'Partitioning should be disabled')
  })

  test('should handle process stream requests', async () => {
    const request1 = {
      processId: 1,
      binding: {
        handlerIds: [0],
        handlerType: HandlerType.ETH_LOG,
        data: {},
        chainId: '1'
      }
    }

    const request2 = {
      processId: 1,
      dbResult: {
        opId: 0n
      }
    }

    const subject = new Subject<DeepPartial<ProcessStreamResponse>>()
    let i = 0
    let result: any = undefined
    subject.subscribe((resp: ProcessStreamResponse) => {
      if (i == 0) {
        assert.ok(resp.dbRequest, 'db request should be present in the response')
        assert.deepEqual(
          resp.dbRequest,
          {
            get: {
              entity: 'Test',
              id: '1'
            },
            opId: 0n
          },
          'DB request should match expected value'
        )
        service.handleSingleRequest(request2, subject)
      }
      if (i == 1) {
        result = resp.result
      }
      i++
    })

    await service.handleSingleRequest(request1, subject)
    await new Promise((resolve) => setTimeout(resolve, 200)) // wait for async processing
    assert.strictEqual(i, 2, 'Should have processed two responses')

    assert.ok(result, 'Result should be present in the response')
    assert.ok(result?.states, 'States should be present in the result')
    assert.ok(result?.states.configUpdated, 'Config should be updated')
  })
})

describe('Test Service Manager with worker with partition', () => {
  const service = new ServiceManager(async () => {}, {
    worker: 1,
    target: './test-processor.test.js',
    ['chains-config']: 'chains-config.json',
    ['enable-partition']: true
  })

  before(async () => {
    await service.start({ templateInstances: [] }, TEST_CONTEXT)
    await service.getConfig({}, TEST_CONTEXT)
  })

  test('should initialize worker pool with correct options', async () => {
    // The pool should be initialized after start and getConfig
    assert.ok(service['pool'], 'Worker pool should be initialized')
    assert.strictEqual(service['options'].worker, 1, 'Worker count should match options')
    assert.strictEqual(service['options']['enable-partition'], true, 'Partitioning should be enabled')
  })

  test('should handle process stream requests', async () => {
    const request1 = {
      processId: 1,
      binding: {
        handlerIds: [0],
        handlerType: HandlerType.ETH_LOG,
        data: {},
        chainId: '1'
      }
    }

    const request2 = {
      processId: 1,
      start: true
    }

    const request3 = {
      processId: 1,
      dbResult: {
        opId: 0n
      }
    }

    const subject = new Subject<DeepPartial<ProcessStreamResponse>>()
    let i = 0
    subject.subscribe((resp: ProcessStreamResponse) => {
      if (i == 0) {
        assert.ok(resp.partitions, 'Partitions should be present in the response')
        assert.strictEqual(Object.keys(resp.partitions).length, 1, 'There should be one partition')
        assert.strictEqual(resp.partitions.partitions[0].userValue, 'test', 'User value should match expected value')
        service.handleSingleRequest(request2, subject)
      }
      if (i == 1) {
        assert.ok(resp.dbRequest, 'db request should be present in the response')
        assert.deepEqual(
          resp.dbRequest,
          {
            get: {
              entity: 'Test',
              id: '1'
            },
            opId: 0n
          },
          'DB request should match expected value'
        )
        service.handleSingleRequest(request3, subject)
      }
      if (i == 2) {
        assert.ok(resp.result, 'Result should be present in the response')
        assert.ok(resp.result.states, 'States should be present in the result')
        assert.ok(resp.result.states.configUpdated, 'Config should be updated')
      }
      i++
    })

    await service.handleSingleRequest(request1, subject)
    await new Promise((resolve) => setTimeout(resolve, 200)) // wait for async processing
    assert.strictEqual(i, 3, 'Should have processed three responses')
  })
})
