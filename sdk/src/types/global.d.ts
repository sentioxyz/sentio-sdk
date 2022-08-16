import { BaseContract } from 'ethers'
import { BaseProcessor, BaseProcessorTemplate, SolanaBaseProcessor, TemplateInstance } from '..'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { ContractWrapper } from 'context'

declare global {
  var Processors: BaseProcessor<BaseContract, ContractWrapper<BaseContract>>[]
  var Templates: BaseProcessorTemplate<BaseContract, ContractWrapper<BaseContract>>[]
  var TemplatesInstances: TemplateInstance[]
  var SentioProvider: Map<number, StaticJsonRpcProvider>
  var SolanaProcessors: SolanaBaseProcessor[]
  var sentio_sdk: any
}
