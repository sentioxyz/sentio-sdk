import {
  BaseProcessor,
  BoundContractView,
  ContractView,
  BaseProcessorTemplate,
  SolanaBaseProcessor,
  SuiBaseProcessor,
} from './core'

import { AptosBaseProcessor } from './aptos'

import { BaseContract } from 'ethers'
import { TemplateInstance } from './gen'
import { EventTracker } from './core'
import { Metric } from './core/meter'
import { AptosAccountProcessor } from './aptos/aptos-processor'
import { Exporter } from './core/exporter'

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

  exporters: Exporter[] = []

  metrics: Metric[] = []
}
