import { before, describe, test } from 'node:test'
import assert from 'assert'
import { type HandlerContext } from '@connectrpc/connect'
import {
  HandlerType,
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

const TEST_CONTEXT = {} as HandlerContext

// With partitioning on, the service answers the partition request and runs the
// binding right away (SENTIO_PARTITION_EAGER_START defaults to true): the driver
// gates the binding's first db read on the previous task of the same partition, so
// waiting for a start command only adds a round trip. The partition response says
// so (`started`), and a start command from a driver that does not read it — which
// can arrive after the binding already finished — is ignored.
describe('Test Service V3 with partition: eager start', () => {
  const service = new ProcessorServiceImplV3(
    async () => {
      PluginManager.INSTANCE.plugins = []
      PluginManager.INSTANCE.typesToPlugin.clear()
      PluginManager.INSTANCE.register(new TestPlugin())
    },
    getTestConfig({ enablePartition: true })
  )

  before(async () => {
    await service.start(create(StartRequestSchema, { templateInstances: [] }), TEST_CONTEXT)
  })

  test('runs the binding after the partition response and ignores a late start command', async () => {
    const binding = create(ProcessStreamRequestSchema, {
      processId: 7,
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

    const subject = new Subject<ProcessStreamResponseV3Init>()
    const cases: string[] = []
    let partitions: any = undefined
    let result: any = undefined
    subject.subscribe((resp: ProcessStreamResponseV3Init) => {
      cases.push(resp.value?.case ?? 'unknown')
      if (resp.value?.case === 'partitions') {
        partitions = resp.value.value
      }
      if (resp.value?.case === 'dbRequest') {
        // answer the test plugin's read so the binding can finish
        const dbResult = create(ProcessStreamRequestSchema, {
          processId: 7,
          value: { case: 'dbResult', value: { opId: resp.value.value.opId } }
        })
        void service.handleRequest(dbResult, undefined, subject)
      }
      if (resp.value?.case === 'result') {
        result = resp.value.value
      }
    })

    await service.handleRequest(binding, undefined, subject)
    await new Promise((resolve) => setTimeout(resolve, 200))

    assert.strictEqual(cases[0], 'partitions', 'the partition response comes first')
    assert.strictEqual(partitions?.started, true, 'the partition response announces the eager start')
    assert.ok(result, 'the binding finished without a start command')
    assert.deepStrictEqual(cases, ['partitions', 'dbRequest', 'result'])

    // A driver that does not read `started` still sends its start command; here it
    // lands after the binding finished. It must not run the binding a second time.
    const start = create(ProcessStreamRequestSchema, { processId: 7, value: { case: 'start', value: true } })
    const lastBinding = binding.value.case === 'binding' ? binding.value.value : undefined
    await service.handleRequest(start, lastBinding, subject)
    await new Promise((resolve) => setTimeout(resolve, 200))
    assert.deepStrictEqual(cases, ['partitions', 'dbRequest', 'result'], 'the late start command is ignored')
  })
})
