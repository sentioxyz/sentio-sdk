import { BaseContract } from 'ethers'
import { BaseProcessor, BaseProcessorTemplate, SolanaBaseProcessor, TemplateInstance, ProcessorState } from '..'
import { Provider } from '@ethersproject/providers'
import { ContractView } from 'context'

declare global {
  // var Processors: BaseProcessor<BaseContract, ContractView<BaseContract>>[]
  // var Templates: BaseProcessorTemplate<BaseContract, ContractView<BaseContract>>[]
  // var TemplatesInstances: TemplateInstance[]
  // var SentioProvider: Map<number, Provider>
  // var SolanaProcessors: SolanaBaseProcessor[]

  var PROCESSOR_STATE: ProcessorState
  var sentio_sdk: any
}

// processorState = new ProcessorState()