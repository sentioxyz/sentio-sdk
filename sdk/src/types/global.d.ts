import { BaseContract } from 'ethers'
import { BaseProcessor, BaseProcessorTemplate, SolanaBaseProcessor, TemplateInstance, ProcessorState } from '..'
import { Provider } from '@ethersproject/providers'
import { ContractWrapper } from 'context'

declare global {
  // var Processors: BaseProcessor<BaseContract, ContractWrapper<BaseContract>>[]
  // var Templates: BaseProcessorTemplate<BaseContract, ContractWrapper<BaseContract>>[]
  // var TemplatesInstances: TemplateInstance[]
  // var SentioProvider: Map<number, Provider>
  // var SolanaProcessors: SolanaBaseProcessor[]

  var PROCESSOR_STATE: ProcessorState
  var sentio_sdk: any
}

// processorState = new ProcessorState()