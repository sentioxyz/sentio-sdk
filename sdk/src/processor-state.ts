import { BaseProcessor } from './base-processor'
import { BaseContract } from 'ethers'
import { ContractWrapper } from './context'
import { BaseProcessorTemplate } from './base-processor-template'
import { TemplateInstance } from './gen/processor/protos/processor'
import { Provider } from '@ethersproject/providers'
import { SolanaBaseProcessor } from './solana-processor'

export class ProcessorState {
  // from abiName_address_chainId => contract wrapper
  contracts = new Map<string, ContractWrapper<BaseContract>>()
  // all evm processors
  processors: BaseProcessor<BaseContract, ContractWrapper<BaseContract>>[] = []
  // from abiName_options to contracts
  processorMap = new Map<string, BaseProcessor<any, any>>()
  // evm providers
  providers = new Map<number, Provider>()
  // evm processor templates
  templates: BaseProcessorTemplate<BaseContract, ContractWrapper<BaseContract>>[] = []
  // evm processor template instances spec
  templatesInstances: TemplateInstance[] = []

  solanaProcessors: SolanaBaseProcessor[] = []
}
