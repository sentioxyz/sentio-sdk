import { before, describe, test } from 'node:test'
import assert from 'assert'
import { CallContext } from 'nice-grpc-common'
import {
  ConfigureHandlersRequest,
  DeepPartial,
  Empty,
  HandlerType,
  InitResponse,
  ProcessConfigResponse,
  ProcessStreamResponseV2
} from '@sentio/protos'
import { Subject } from 'rxjs'
import { ProcessorServiceImplV3 } from './service-v3.js'
import { PluginManager } from './plugin.js'
import { TestPlugin } from './test-processor.test.js'

export const TEST_CONTEXT: CallContext = <CallContext>{}

describe('Test Service V3 with worker without partition', () => {
  const service = new ProcessorServiceImplV3(
    async () => {
      PluginManager.INSTANCE.plugins = []
      PluginManager.INSTANCE.typesToPlugin.clear()
      PluginManager.INSTANCE.register(new TestPlugin())
    },
    {
      ['chains-config']: 'chains-config.json',
      ['enable-partition']: false
    }
  )

  let initResponse: DeepPartial<InitResponse> = InitResponse.fromPartial({})
  let processConfigResponse: DeepPartial<ProcessConfigResponse> = ProcessConfigResponse.fromPartial({})

  before(async () => {
    try {
      initResponse = await service.init(Empty, TEST_CONTEXT)
      processConfigResponse = await service.configureHandlers(ConfigureHandlersRequest.fromPartial({}), TEST_CONTEXT)
    } catch (e) {
      console.error('Error during initialization:', e)
    }
  })

  test('should initialize with correct chain IDs', () => {
    assert.ok(initResponse.chainIds, 'Chain IDs should be present in the response')
    assert.strictEqual(initResponse.chainIds.length, 1, 'Should have one chain ID')
    assert.strictEqual(initResponse.chainIds[0], '1', 'Chain ID should be "1"')

    assert.ok(processConfigResponse.accountConfigs, 'Account configs should be present in the response')
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

    const subject = new Subject<DeepPartial<ProcessStreamResponseV2>>()
    let i = 0
    let result: any = undefined
    subject.subscribe((resp: ProcessStreamResponseV2) => {
      if (resp.dbRequest) {
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
        service.handleRequest(request2, undefined, subject)
      }
      if (resp.tplRequest) {
        // ignore
      }
      if (resp.tsRequest) {
      }
      if (resp.result) {
        result = resp.result
      }

      i++
    })

    await service.handleRequest(request1, undefined, subject)
    await new Promise((resolve) => setTimeout(resolve, 200)) // wait for async processing
    assert.strictEqual(i, 3, 'Should have processed two responses')

    assert.ok(result, 'Result should be present in the response')
    assert.ok(result?.states, 'States should be present in the result')
    assert.ok(result?.states.configUpdated, 'Config should be updated')
  })
})
