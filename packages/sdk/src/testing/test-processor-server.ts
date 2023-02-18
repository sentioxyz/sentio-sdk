import {
  AccountConfig,
  ContractConfig,
  DataBinding,
  Empty,
  ProcessBindingResponse,
  ProcessBindingsRequest,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessorServiceImplementation,
  StartRequest,
} from '@sentio/protos'
import { CallContext } from 'nice-grpc-common'
import { Endpoints, ProcessorServiceImpl, State } from '@sentio/runtime'
import { CHAIN_MAP } from '../core/chain.js'

import { AptosFacet } from './aptos-facet.js'
import { SolanaFacet } from './solana-facet.js'
import { EthFacet } from './eth-facet.js'
import { SuiFacet } from './sui-facet.js'

export const TEST_CONTEXT: CallContext = <CallContext>{}

export function cleanTest() {
  State.reset()
}

export class TestProcessorServer implements ProcessorServiceImplementation {
  service: ProcessorServiceImpl
  contractConfigs: ContractConfig[]
  accountConfigs: AccountConfig[]

  aptos: AptosFacet
  eth: EthFacet
  solana: SolanaFacet
  sui: SuiFacet

  constructor(loader: () => Promise<any>, httpEndpoints: Record<string, string> = {}) {
    cleanTest()

    this.service = new ProcessorServiceImpl(loader)
    this.aptos = new AptosFacet(this)
    this.solana = new SolanaFacet(this)
    this.eth = new EthFacet(this)
    this.sui = new SuiFacet(this)

    for (const k in CHAIN_MAP) {
      const http = httpEndpoints[k] || ''
      Endpoints.INSTANCE.chainServer.set(k, http)
    }
  }

  async start(request: StartRequest = { templateInstances: [] }, context = TEST_CONTEXT): Promise<Empty> {
    const res = await this.service.start(request, context)
    const config = await this.getConfig({})
    this.contractConfigs = config.contractConfigs
    this.accountConfigs = config.accountConfigs
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
    return this.service.processBindings(request, context)
  }

  processBinding(request: DataBinding, context: CallContext = TEST_CONTEXT): Promise<ProcessBindingResponse> {
    return this.service.processBindings({ bindings: [request] }, context)
  }

  processBindingsStream(request: AsyncIterable<DataBinding>, context: CallContext) {
    return this.service.processBindingsStream(request, context)
  }
}
