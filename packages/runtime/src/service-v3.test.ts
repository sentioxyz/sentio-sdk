import { before, describe, test } from 'node:test'
import assert from 'assert'
import { type HandlerContext } from '@connectrpc/connect'
import {
  HandlerType,
  ProcessConfigRequestSchema,
  type ProcessConfigResponse,
  ProcessConfigResponseSchema,
  ProcessResultSchema,
  ProcessStreamRequestSchema,
  ProcessStreamResponseV3Schema,
  StartRequestSchema
} from '@sentio/protos'
import { create, type MessageInitShape } from '@bufbuild/protobuf'
import { Subject } from 'rxjs'
import { ProcessorServiceImplV3 } from './service-v3.js'
import { PluginManager } from './plugin.js'
import { TestPlugin } from './test-processor.test.js'
import { getTestConfig } from './processor-runner-program.js'

type ProcessStreamResponseV3Init = MessageInitShape<typeof ProcessStreamResponseV3Schema>

export const TEST_CONTEXT = {} as HandlerContext

describe('Test Service V3 with worker without partition', () => {
  const service = new ProcessorServiceImplV3(
    async () => {
      PluginManager.INSTANCE.plugins = []
      PluginManager.INSTANCE.typesToPlugin.clear()
      PluginManager.INSTANCE.register(new TestPlugin())
    },
    getTestConfig({
      enablePartition: false
    })
  )

  let processConfigResponse: ProcessConfigResponse = create(ProcessConfigResponseSchema, {})

  before(async () => {
    try {
      await service.start(create(StartRequestSchema, { templateInstances: [] }), TEST_CONTEXT)
      processConfigResponse = await service.getConfig(create(ProcessConfigRequestSchema, {}), TEST_CONTEXT)
    } catch (e) {
      console.error('Error during initialization:', e)
    }
  })

  test('should initialize with correct chain IDs', () => {
    assert.ok(processConfigResponse.accountConfigs, 'Account configs should be present in the response')
  })

  test('should handle process stream requests', async () => {
    const request1 = create(ProcessStreamRequestSchema, {
      processId: 1,
      value: {
        case: 'binding',
        value: {
          handlerIds: [0],
          handlerType: HandlerType.ETH_LOG,
          data: {},
          chainId: '1'
        }
      }
    })

    const request2 = create(ProcessStreamRequestSchema, {
      processId: 1,
      value: {
        case: 'dbResult',
        value: {
          opId: 0n
        }
      }
    })

    const subject = new Subject<ProcessStreamResponseV3Init>()
    let i = 0
    let result: any = undefined
    subject.subscribe((resp: ProcessStreamResponseV3Init) => {
      if (resp.value?.case === 'dbRequest') {
        const dbRequest = resp.value.value
        assert.ok(dbRequest, 'db request should be present in the response')
        assert.strictEqual(dbRequest.opId, 0n, 'opId should match')
        assert.strictEqual(dbRequest.op?.case, 'get', 'op should be a get request')
        if (dbRequest.op?.case === 'get') {
          assert.strictEqual(dbRequest.op.value.entity, 'Test', 'entity should match')
          assert.strictEqual(dbRequest.op.value.id, '1', 'id should match')
        }
        service.handleRequest(request2, undefined, subject)
      }
      if (resp.value?.case === 'tplRequest') {
        // ignore
      }
      if (resp.value?.case === 'tsRequest') {
      }
      if (resp.value?.case === 'result') {
        result = resp.value.value
      }

      i++
    })

    await service.handleRequest(request1, undefined, subject)
    await new Promise((resolve) => setTimeout(resolve, 200)) // wait for async processing
    assert.strictEqual(i, 2, 'Should have processed two responses')

    assert.ok(result, 'Result should be present in the response')
    assert.ok(result?.states, 'States should be present in the result')
    assert.strictEqual(result?.exports?.length, 1, 'Exports should be forwarded in the result')
    assert.strictEqual(result?.exports?.[0]?.payload, '{"test":1}', 'Export payload should be preserved')
  })
})

// The final result must be the last thing a process ever puts on the stream: once
// it is sent, the driver may hand that stream to another process, and anything
// appended afterwards makes the driver fail *that* process with ERR200 "unexpected
// ProcessID". A handler that returns while an un-awaited task is still pending is
// the way this happens in practice, so assert the ordering end-to-end rather than
// only unit-testing the guard — the guard is useless if the context is not marked
// finished until a later microtask.
describe('Test Service V3 does not emit anything after the final result', () => {
  // A plugin whose handler returns immediately while a detached task walks through
  // several microtasks and only then touches the store.
  class FloatingTaskPlugin extends TestPlugin {
    override async processBinding(): Promise<any> {
      const dbContext = PluginManager.INSTANCE.dbContextLocalStorage.getStore()
      // Deliberately not awaited: this is the floating-promise shape.
      void (async () => {
        for (let n = 0; n < 5; n++) {
          await Promise.resolve()
        }
        await dbContext?.sendRequest({ case: 'get', value: { entity: 'Late', id: '1' } }).catch(() => {})
      })()
      return create(ProcessResultSchema, { states: {} })
    }
  }

  test('a detached task cannot append a dbRequest after the result', async () => {
    const service = new ProcessorServiceImplV3(
      async () => {
        PluginManager.INSTANCE.plugins = []
        PluginManager.INSTANCE.typesToPlugin.clear()
        PluginManager.INSTANCE.register(new FloatingTaskPlugin())
      },
      getTestConfig({ enablePartition: false })
    )
    await service.start(create(StartRequestSchema, { templateInstances: [] }), TEST_CONTEXT)

    const subject = new Subject<ProcessStreamResponseV3Init>()
    const order: string[] = []
    subject.subscribe((resp) => order.push(resp.value?.case ?? 'unknown'))

    const originalError = console.error
    console.error = () => {} // the dropped late op logs; keep the test output clean
    await service.handleRequest(
      create(ProcessStreamRequestSchema, {
        processId: 7,
        value: {
          case: 'binding',
          value: { handlerIds: [0], handlerType: HandlerType.ETH_LOG, data: {}, chainId: '1' }
        }
      }),
      undefined,
      subject
    )
    await new Promise((resolve) => setTimeout(resolve, 200))
    console.error = originalError

    const resultAt = order.indexOf('result')
    assert.ok(resultAt >= 0, `expected a result, got ${JSON.stringify(order)}`)
    assert.strictEqual(resultAt, order.length - 1, `nothing may follow the result, got ${JSON.stringify(order)}`)
    assert.ok(!order.includes('dbRequest'), `the late dbRequest must be dropped, got ${JSON.stringify(order)}`)
  })
})
