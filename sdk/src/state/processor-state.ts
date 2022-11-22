import {
  BaseProcessor,
  BoundContractView,
  ContractView,
  BaseProcessorTemplate,
  SolanaBaseProcessor,
  SuiBaseProcessor,
  EventTracker,
} from '../core'

import { BaseContract } from 'ethers'
import { TemplateInstance } from '../gen'
import { AptosBaseProcessor, AptosAccountProcessor } from '../aptos/aptos-processor'

export class ProcessorState {
  // from abiName_address_chainId => contract wrapper
  contracts = new Map<string, ContractView<BaseContract>>()
  // all evm processors
  processors: BaseProcessor<BaseContract, BoundContractView<BaseContract, any>>[] = []
  // from abiName_options to contracts
  processorMap = new Map<string, BaseProcessor<any, any>>()
  // evm processor templates
  templates: BaseProcessorTemplate<BaseContract, BoundContractView<BaseContract, any>>[] = []
  // evm processor template instances spec
  templatesInstances: TemplateInstance[] = []

  solanaProcessors: SolanaBaseProcessor[] = []

  suiProcessors: SuiBaseProcessor[] = []

  aptosProcessors: AptosBaseProcessor[] = []
  aptosAccountProcessors: AptosAccountProcessor[] = []

  eventTrackers: EventTracker[] = []

  stateMap = new Map<string, any>()
}
