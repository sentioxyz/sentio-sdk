import {
  AccountConfig,
  ContractConfig,
  DataBinding,
  DeepPartial,
  Empty,
  PreprocessStreamRequest,
  PreprocessStreamResponse,
  ProcessBindingResponse,
  ProcessBindingsRequest,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessorServiceImplementation,
  ProcessStreamRequest,
  ProcessStreamResponse,
  ServerStreamingMethodResult,
  StartRequest
} from '@sentio/protos'
import { CallContext } from 'nice-grpc-common'
import { Endpoints, PluginManager, ProcessorServiceImpl, State, StoreContext } from '@sentio/runtime'
import { CHAIN_MAP } from '@sentio/chain'

import { AptosFacet } from './aptos-facet.js'
import { SolanaFacet } from './solana-facet.js'
import { EthFacet } from './eth-facet.js'
import { SuiFacet } from './sui-facet.js'
import { FuelFacet } from './fuel-facet.js'
import { CosmosFacet } from './cosmos-facet.js'
import { StarknetFacet } from './starknet-facet.js'
import { BTCFacet } from './btc-facet.js'
import { Subject } from 'rxjs'
import { MemoryDatabase } from './memory-database.js'
import { DatabaseSchemaState } from '../core/database-schema.js'
import { IotaFacet } from './iota-facet.js'

export const TEST_CONTEXT: CallContext = <CallContext>{}

export function cleanTest() {
  // retain the DatabaseSchemaState
  const state = State.INSTANCE.stateMap.get(DatabaseSchemaState.INSTANCE.key())
  State.reset()
  State.INSTANCE.stateMap.set(DatabaseSchemaState.INSTANCE.key(), state)
}

export class TestProcessorServer implements ProcessorServiceImplementation {
  service: ProcessorServiceImpl
  contractConfigs: ContractConfig[]
  accountConfigs: AccountConfig[]
  storeContext: StoreContext

  aptos: AptosFacet
  eth: EthFacet
  solana: SolanaFacet
  sui: SuiFacet
  iota: IotaFacet
  fuel: FuelFacet
  cosmos: CosmosFacet
  starknet: StarknetFacet
  btc: BTCFacet
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
    this.starknet = new StarknetFacet(this)
    this.btc = new BTCFacet(this)

    for (const k in CHAIN_MAP) {
      const http = httpEndpoints[k] || ''
      Endpoints.INSTANCE.chainServer.set(k, http)
    }

    // start a memory database for testing
    const subject = new Subject<DeepPartial<ProcessStreamResponse>>()
    this.storeContext = new StoreContext(subject, 1)
    this._db = new MemoryDatabase(this.storeContext)
  }

  async start(request: StartRequest = { templateInstances: [] }, context = TEST_CONTEXT): Promise<Empty> {
    const res = await this.service.start(request, context)
    const config = await this.getConfig({})
    this.contractConfigs = config.contractConfigs
    this.accountConfigs = config.accountConfigs
    this._db.start()
    return res
  }

  stop(request: Empty, context = TEST_CONTEXT): Promise<Empty> {
    return this.service.stop(request, context)
  }

  getConfig(request: ProcessConfigRequest, context = TEST_CONTEXT): Promise<ProcessConfigResponse> {
    return this.service.getConfig(request, context)
  }

  processBindings(
    request: ProcessBindingsRequest,
    context: CallContext = TEST_CONTEXT
  ): Promise<ProcessBindingResponse> {
    return PluginManager.INSTANCE.dbContextLocalStorage.run(this.storeContext, () => {
      return this.service.processBindings(request, context)
    })
  }

  processBinding(request: DataBinding, context: CallContext = TEST_CONTEXT): Promise<ProcessBindingResponse> {
    return PluginManager.INSTANCE.dbContextLocalStorage.run(this.storeContext, () => {
      return this.service.processBindings({ bindings: [request] }, context)
    })
  }

  processBindingsStream(
    requests: AsyncIterable<ProcessStreamRequest>,
    context: CallContext
  ): ServerStreamingMethodResult<DeepPartial<ProcessStreamResponse>> {
    throw new Error('Method not implemented.')
  }

  preprocessBindingsStream(
    requests: AsyncIterable<PreprocessStreamRequest>,
    context: CallContext
  ): ServerStreamingMethodResult<DeepPartial<PreprocessStreamResponse>> {
    throw new Error('Method not implemented.')
  }

  // processBindingsStream(request: AsyncIterable<ProcessStreamRequest>, context: CallContext) {
  //   return this.service.processBindingsStream(request, context)
  // }
  get db() {
    return this._db
  }

  get store() {
    return this._db.store
  }
}
