import {
  type AccountConfig,
  type ContractConfig,
  type DataBinding,
  type DBResponse,
  type Empty,
  EmptySchema,
  type ProcessBindingResponse,
  ProcessBindingResponseSchema,
  ProcessBindingsRequestSchema,
  ProcessConfigRequestSchema,
  type ProcessConfigResponse,
  type ProcessResult,
  type ProcessStreamRequest,
  ProcessStreamRequestSchema,
  ProcessStreamResponseV3Schema,
  StartRequestSchema,
  type TemplateInstance,
  TemplateInstanceSchema,
  type TimeseriesResult,
  UpdateTemplatesRequestSchema
} from '@sentio/protos'
import { create, type MessageInitShape } from '@bufbuild/protobuf'
import { type HandlerContext } from '@connectrpc/connect'
import {
  DataBindingContext,
  Endpoints,
  IDataBindingContext,
  mergeProcessResults,
  PluginManager,
  State,
  ProcessorServiceImplV3
} from '@sentio/runtime'

import { AptosFacet } from './aptos-facet.js'
import { SolanaFacet } from './solana-facet.js'
import { EthFacet } from './eth-facet.js'
import { SuiFacet } from './sui-facet.js'
import { FuelFacet } from './fuel-facet.js'
import { CosmosFacet } from './cosmos-facet.js'
import { Subject } from 'rxjs'
import { MemoryDatabase } from './memory-database.js'
import { DatabaseSchemaState } from '../core/database-schema.js'
import { IotaFacet } from './iota-facet.js'
import { ChainInfo } from '@sentio/chain'

type ProcessStreamResponseV3Init = MessageInitShape<typeof ProcessStreamResponseV3Schema>

export const TEST_CONTEXT = {} as HandlerContext

export function cleanTest() {
  // retain the DatabaseSchemaState
  const state = State.INSTANCE.stateMap.get(DatabaseSchemaState.INSTANCE.key())
  State.reset()
  State.INSTANCE.stateMap.set(DatabaseSchemaState.INSTANCE.key(), state)
}

export class TestProcessorServer {
  service: ProcessorServiceImplV3
  contractConfigs: ContractConfig[]
  accountConfigs: AccountConfig[]
  storeContext: TestStoreContext
  private nextProcessId = 1

  aptos: AptosFacet
  eth: EthFacet
  solana: SolanaFacet
  sui: SuiFacet
  iota: IotaFacet
  fuel: FuelFacet
  cosmos: CosmosFacet
  _db: MemoryDatabase

  constructor(loader: () => Promise<any>, httpEndpoints: Record<string, string> = {}) {
    cleanTest()

    this.service = new ProcessorServiceImplV3(loader)
    this.aptos = new AptosFacet(this)
    this.solana = new SolanaFacet(this)
    this.eth = new EthFacet(this)
    this.sui = new SuiFacet(this)
    this.iota = new IotaFacet(this)
    this.fuel = new FuelFacet(this)
    this.cosmos = new CosmosFacet(this)

    for (const k of Object.keys(ChainInfo)) {
      const http = httpEndpoints[k] || ''
      Endpoints.INSTANCE.chainRpc.set(k, { url: http })
    }

    // start a memory database for testing
    const subject = new Subject<ProcessStreamResponseV3Init>()
    this.storeContext = new TestStoreContext(subject, 1, this.service)
    this._db = new MemoryDatabase(this.storeContext)
  }

  async start(
    request: MessageInitShape<typeof StartRequestSchema> = { templateInstances: [] },
    context = TEST_CONTEXT
  ) {
    const req = create(StartRequestSchema, request)
    const res = await this.service.start(req, context)
    const config = await this.getConfig(create(ProcessConfigRequestSchema, {}))
    this.contractConfigs = config.contractConfigs
    this.accountConfigs = config.accountConfigs
    this._db.start()
    this.storeContext.templateInstances = req.templateInstances
    return res
  }

  stop(request: Empty = create(EmptySchema), context = TEST_CONTEXT) {
    this._db.stop()
    return request
  }

  async getConfig(
    request: MessageInitShape<typeof ProcessConfigRequestSchema> = {},
    context = TEST_CONTEXT
  ): Promise<ProcessConfigResponse> {
    const config = await this.service.getConfig(create(ProcessConfigRequestSchema, request), context)
    config.templateInstances = this.storeContext.templateInstances
    return config
  }

  processBindings(
    request: MessageInitShape<typeof ProcessBindingsRequestSchema>,
    context: HandlerContext = TEST_CONTEXT
  ): Promise<ProcessBindingResponse> {
    const req = create(ProcessBindingsRequestSchema, request)
    return this.processBindingList(req.bindings, context)
  }

  async processBinding(request: DataBinding, context: HandlerContext = TEST_CONTEXT): Promise<ProcessBindingResponse> {
    return this.processBindingList([request], context)
  }

  private async processBindingList(
    bindings: DataBinding[],
    context: HandlerContext = TEST_CONTEXT
  ): Promise<ProcessBindingResponse> {
    const results: ProcessResult[] = []
    for (const binding of bindings) {
      this.storeContext.templatesUpdated = false
      const result = await this.processBindingV3(binding, context)
      results.push(result)

      if (this.storeContext.templatesUpdated) {
        await PluginManager.INSTANCE.updateTemplates(
          create(UpdateTemplatesRequestSchema, {
            chainId: binding.chainId,
            templateInstances: this.storeContext.templateInstances
          })
        )
      }
    }
    return create(ProcessBindingResponseSchema, {
      result: mergeProcessResults(results)
    })
  }

  private processBindingV3(request: DataBinding, context: HandlerContext): Promise<ProcessResult> {
    const processId = this.nextProcessId++
    const subject = this.storeContext.subject

    return new Promise((resolve, reject) => {
      // The V3 service streams timeseries separately as `tsRequest` batches and clears
      // `timeseriesResult` from the final `result` message. Collect the batches here and fold
      // them back in so test helpers can read metrics/events off `result.timeseriesResult`.
      const collectedTimeseries: TimeseriesResult[] = []
      const subscription = subject.subscribe({
        next: (response) => {
          if (response.processId !== processId) {
            return
          }
          if (response.value?.case === 'tplRequest') {
            this.storeContext.applyTemplateRequest(
              (response.value.value.templates ?? []).map((template) => create(TemplateInstanceSchema, template)),
              response.value.value.remove ?? false
            )
          }
          if (response.value?.case === 'tsRequest') {
            collectedTimeseries.push(...((response.value.value.data ?? []) as TimeseriesResult[]))
          }
          if (response.value?.case === 'result') {
            subscription.unsubscribe()
            // The service always emits a fully-formed ProcessResult message here; use it directly.
            // Do NOT re-`create(ProcessResultSchema, ...)` — that re-validates every field and throws
            // on results carrying loosely-typed values (e.g. a hex string in an int32 field), which
            // the old unary processBindings path passed through untouched.
            const result = response.value.value as ProcessResult
            // The V3 service reports handler failures as a result with `states.error` set (via
            // DataBindingContext.error) rather than erroring the stream. Surface it as a thrown
            // error so tests observe the same behavior as the old unary processBindings path.
            if (result.states?.error) {
              reject(new Error(result.states.error))
            } else {
              result.timeseriesResult = collectedTimeseries
              resolve(result)
            }
          }
        },
        error: (e) => {
          subscription.unsubscribe()
          reject(e)
        }
      })

      this.service
        .handleRequest(
          create(ProcessStreamRequestSchema, {
            processId,
            value: {
              case: 'binding',
              value: request
            }
          }),
          undefined,
          subject
        )
        .catch((e) => {
          subscription.unsubscribe()
          reject(e)
        })
    })
  }

  processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: HandlerContext) {
    return this.service.processBindingsStream(requests, context)
  }

  // processBindingsStream(request: AsyncIterable<ProcessStreamRequest>, context: HandlerContext) {
  //   return this.service.processBindingsStream(request, context)
  // }
  get db() {
    return this._db
  }

  get store() {
    return this._db.store
  }
}

class TestStoreContext extends DataBindingContext implements IDataBindingContext {
  constructor(
    subject: Subject<ProcessStreamResponseV3Init>,
    processId: number,
    private readonly service: ProcessorServiceImplV3
  ) {
    super(processId, subject)
  }

  templateInstances: TemplateInstance[] = []
  // Set whenever a tplRequest is applied while processing a binding. The unary test path
  // uses it to trigger updateTemplates, since the v4 SDK no longer emits the V2-only
  // StateResult.config_updated flag (dynamic templates travel via the tplRequest stream).
  templatesUpdated = false

  result(dbResult: DBResponse, processId = this.processId): void {
    // Resolve a request issued directly from this context (e.g. `service.store.get(...)` in a test,
    // which goes through the TestStoreContext rather than a per-binding context). opIds are globally
    // unique, so this is a no-op when the request originated from the service's per-binding context.
    super.result(dbResult)
    // Forward to the service's per-binding context for requests issued while processing a binding.
    void this.service.handleRequest(
      create(ProcessStreamRequestSchema, {
        processId,
        value: {
          case: 'dbResult',
          value: dbResult
        }
      }),
      undefined,
      this.subject
    )
  }

  applyTemplateRequest(templates: Array<TemplateInstance>, remove: boolean): void {
    this.templatesUpdated = true
    if (remove) {
      this.templateInstances = this.templateInstances.filter(
        (i) => !templates.find((t) => t.templateId === i.templateId && t.contract?.address === i.contract?.address)
      )
    } else {
      this.templateInstances.push(...templates)
    }
  }

  sendTemplateRequest(templates: Array<TemplateInstance>, remove: boolean): void {
    this.applyTemplateRequest(templates, remove)
  }

  sendTimeseriesRequest(timeseries: Array<TimeseriesResult>): void {
    // Test helpers currently expose metric/event/export results through ProcessResult.
  }
}
