import { BoundContractView, BaseProcessorTemplate } from '../core'

import { BaseContract } from 'ethers'
import { TemplateInstance } from '../gen'

export class ProcessorState {
  // all evm processors
  templates: BaseProcessorTemplate<BaseContract, BoundContractView<BaseContract, any>>[] = []
  // evm processor template instances spec
  templatesInstances: TemplateInstance[] = []

  // TODO move above to state map
  stateMap = new Map<string, any>()
}
