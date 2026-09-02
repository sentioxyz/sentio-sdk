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

// SENTIO_PARTITION_EAGER_START is read when service-v3 loads, so it is set before
// the dynamic imports. node:test runs every file in its own process, so the flag
// does not leak into the eager-start tests.
process.env['SENTIO_PARTITION_EAGER_START'] = 'false'
const { ProcessorServiceImplV3 } = await import('./service-v3.js')
const { PluginManager } = await import('./plugin.js')
const { TestPlugin } = await import('./test-processor.test.js')
const { getTestConfig } = await import('./processor-runner-program.js')

type ProcessStreamResponseV3Init = MessageInitShape<typeof ProcessStreamResponseV3Schema>

const TEST_CONTEXT = {} as HandlerContext

// With eager start off, a binding waits for the driver's start command after its
// partition response, and only a process that was started that way runs.
describe('Test Service V3 with partition: start command (eager start off)', () => {
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

  function record(subject: Subject<ProcessStreamResponseV3Init>, processId: number) {
    const cases: string[] = []
    let partitions: any = undefined
    subject.subscribe((resp: ProcessStreamResponseV3Init) => {
      cases.push(resp.value?.case ?? 'unknown')
      if (resp.value?.case === 'partitions') {
        partitions = resp.value.value
      }
      if (resp.value?.case === 'dbRequest') {
        const dbResult = create(ProcessStreamRequestSchema, {
          processId,
          value: { case: 'dbResult', value: { opId: resp.value.value.opId } }
        })
        void service.handleRequest(dbResult, undefined, subject)
      }
    })
    return { cases, partitions: () => partitions }
  }

  test('a binding runs only after the start command', async () => {
    const binding = create(ProcessStreamRequestSchema, {
      processId: 11,
      value: {
        case: 'binding',
        value: { handlerIds: [0], handlerType: HandlerType.ETH_LOG, data: {}, chainId: '1' }
      }
    })
    const subject = new Subject<ProcessStreamResponseV3Init>()
    const { cases, partitions } = record(subject, 11)

    await service.handleRequest(binding, undefined, subject)
    await new Promise((resolve) => setTimeout(resolve, 100))
    assert.deepStrictEqual(cases, ['partitions'], 'nothing runs before the start command')
    assert.strictEqual(partitions()?.started, false)

    const start = create(ProcessStreamRequestSchema, { processId: 11, value: { case: 'start', value: true } })
    const lastBinding = binding.value.case === 'binding' ? binding.value.value : undefined
    await service.handleRequest(start, lastBinding, subject)
    await new Promise((resolve) => setTimeout(resolve, 200))
    assert.deepStrictEqual(cases, ['partitions', 'dbRequest', 'result'])
  })

  test('an UNKNOWN binding answers the start command with an empty result', async () => {
    const binding = create(ProcessStreamRequestSchema, {
      processId: 12,
      value: {
        case: 'binding',
        value: { handlerIds: [0], handlerType: HandlerType.UNKNOWN, data: {}, chainId: '1' }
      }
    })
    const subject = new Subject<ProcessStreamResponseV3Init>()
    const { cases, partitions } = record(subject, 12)

    await service.handleRequest(binding, undefined, subject)
    await new Promise((resolve) => setTimeout(resolve, 50))
    assert.deepStrictEqual(cases, ['partitions'])
    assert.strictEqual(partitions()?.started, false)

    const start = create(ProcessStreamRequestSchema, { processId: 12, value: { case: 'start', value: true } })
    const lastBinding = binding.value.case === 'binding' ? binding.value.value : undefined
    await service.handleRequest(start, lastBinding, subject)
    await new Promise((resolve) => setTimeout(resolve, 50))
    assert.deepStrictEqual(cases, ['partitions', 'result'], 'the start command is answered, not swallowed')
  })
})
