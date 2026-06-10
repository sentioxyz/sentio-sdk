import { before, describe, test } from 'node:test'
import assert from 'assert'
import { type HandlerContext } from '@connectrpc/connect'
import {
  HandlerType,
  ProcessConfigRequestSchema,
  type ProcessConfigResponse,
  ProcessConfigResponseSchema,
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
    assert.ok(result?.states.configUpdated, 'Config should be updated')
  })
})
