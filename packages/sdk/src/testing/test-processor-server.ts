import {
  type AccountConfig,
  type ContractConfig,
  type DataBinding,
  type Empty,
  EmptySchema,
  type PreprocessStreamRequest,
  type ProcessBindingResponse,
  ProcessBindingResponseSchema,
  ProcessBindingsRequestSchema,
  type ProcessConfigRequest,
  ProcessConfigRequestSchema,
  type ProcessConfigResponse,
  type ProcessStreamRequest,
  ProcessStreamResponseSchema,
  StartRequestSchema,
  type TemplateInstance,
  type TimeseriesResult,
  UpdateTemplatesRequestSchema
} from '@sentio/protos'
import { create, type MessageInitShape } from '@bufbuild/protobuf'
import { type HandlerContext } from '@connectrpc/connect'
import {
  Endpoints,
  IDataBindingContext,
  PluginManager,
  ProcessorServiceImpl,
  State,
  StoreContext
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

type ProcessStreamResponseInit = MessageInitShape<typeof ProcessStreamResponseSchema>

export const TEST_CONTEXT = {} as HandlerContext

export function cleanTest() {
  // retain the DatabaseSchemaState
  const state = State.INSTANCE.stateMap.get(DatabaseSchemaState.INSTANCE.key())
  State.reset()
  State.INSTANCE.stateMap.set(DatabaseSchemaState.INSTANCE.key(), state)
}

export class TestProcessorServer {
  service: ProcessorServiceImpl
  contractConfigs: ContractConfig[]
  accountConfigs: AccountConfig[]
  storeContext: TestStoreContext

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

    this.service = new ProcessorServiceImpl(loader)
    this.aptos = new AptosFacet(this)
    this.solana = new SolanaFacet(this)
    this.eth = new EthFacet(this)
    this.sui = new SuiFacet(this)
    this.iota = new IotaFacet(this)
    this.fuel = new FuelFacet(this)
    this.cosmos = new CosmosFacet(this)

    for (const k of Object.keys(ChainInfo)) {
      const http = httpEndpoints[k] || ''
      Endpoints.INSTANCE.chainServer.set(k, http)
    }

    // start a memory database for testing
    const subject = new Subject<ProcessStreamResponseInit>()
    this.storeContext = new TestStoreContext(subject, 1)
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
    return this.service.stop(request, context)
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
    return PluginManager.INSTANCE.dbContextLocalStorage.run(this.storeContext, async () => {
      const ret = await this.service.processBindings(req, context)
      if (ret.result?.states?.configUpdated) {
        // template may changed
        await PluginManager.INSTANCE.updateTemplates(
          create(UpdateTemplatesRequestSchema, {
            chainId: req.bindings[0].chainId,
            templateInstances: this.storeContext.templateInstances
          })
        )
      }
      return create(ProcessBindingResponseSchema, ret)
    })
  }

  async processBinding(request: DataBinding, context: HandlerContext = TEST_CONTEXT): Promise<ProcessBindingResponse> {
    const ret = await PluginManager.INSTANCE.dbContextLocalStorage.run(this.storeContext, () => {
      return this.service.processBindings(create(ProcessBindingsRequestSchema, { bindings: [request] }), context)
    })
    if (ret.result?.states?.configUpdated) {
      // template may changed
      await PluginManager.INSTANCE.updateTemplates(
        create(UpdateTemplatesRequestSchema, {
          chainId: request.chainId,
          templateInstances: this.storeContext.templateInstances
        })
      )
    }
    return create(ProcessBindingResponseSchema, ret)
  }

  processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: HandlerContext): never {
    throw new Error('Method not implemented.')
  }

  preprocessBindingsStream(requests: AsyncIterable<PreprocessStreamRequest>, context: HandlerContext): never {
    throw new Error('Method not implemented.')
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

class TestStoreContext extends StoreContext implements IDataBindingContext {
  constructor(
    readonly subject: Subject<ProcessStreamResponseInit>,
    processId: number
  ) {
    super(subject, processId)
  }

  templateInstances: TemplateInstance[] = []

  sendTemplateRequest(templates: Array<TemplateInstance>, remove: boolean): void {
    if (remove) {
      this.templateInstances = this.templateInstances.filter(
        (i) => !templates.find((t) => t.templateId === i.templateId && t.contract?.address === i.contract?.address)
      )
    } else {
      this.templateInstances.push(...templates)
    }
  }
  sendTimeseriesRequest(timeseries: Array<TimeseriesResult>): void {
    throw new Error('Method not implemented.')
  }
}
