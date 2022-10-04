import { BaseProcessor } from './base-processor'
import { BaseContract } from 'ethers'
import { BoundContractView, ContractView } from './context'
import { BaseProcessorTemplate } from './base-processor-template'
import { TemplateInstance } from './gen/processor/protos/processor'
import { Provider } from '@ethersproject/providers'
import { SolanaBaseProcessor } from './solana-processor'
import { SuiBaseProcessor } from './sui-processor'
import { AptosBaseProcessor } from './aptos-processor'

export class ProcessorState {
  // from abiName_address_chainId => contract wrapper
  contracts = new Map<string, ContractView<BaseContract>>()
  // all evm processors
  processors: BaseProcessor<BaseContract, BoundContractView<BaseContract, any>>[] = []
  // from abiName_options to contracts
  processorMap = new Map<string, BaseProcessor<any, any>>()
  // evm providers
  providers = new Map<number, Provider>()
  // evm processor templates
  templates: BaseProcessorTemplate<BaseContract, BoundContractView<BaseContract, any>>[] = []
  // evm processor template instances spec
  templatesInstances: TemplateInstance[] = []

  solanaProcessors: SolanaBaseProcessor[] = []

  suiProcessors: SuiBaseProcessor[] = []

  aptosProcessors: AptosBaseProcessor[] = []
}
