import { BaseContract } from '@ethersproject/contracts'
import { BoundContractView, ContractView } from './context'
import { BindOptions } from './bind-options'
import { BaseProcessor } from './base-processor'
import { getProvider } from './provider'
import { addProcessor, getContractName } from './binds'

export class GenericProcessor extends BaseProcessor<
  BaseContract,
  BoundContractView<BaseContract, ContractView<BaseContract>>
> {
  eventAbi: string[]
  constructor(eventAbi: string[], options: BindOptions) {
    super(options)
    this.eventAbi = eventAbi
  }

  protected CreateBoundContractView(): BoundContractView<BaseContract, ContractView<BaseContract>> {
    const contract = new BaseContract(this.config.address, this.eventAbi, getProvider(this.config.network))
    return new BoundContractView(new ContractView<BaseContract>(contract))
  }

  public static bind(eventAbi: string[] | string, options: BindOptions): GenericProcessor {
    const AbiName = 'Generic'
    if (!Array.isArray(eventAbi)) {
      eventAbi = [eventAbi]
    }

    // let processor = getProcessor(AbiName, options) as GenericProcessor;
    // if (!processor) {
    const finalOptions = Object.assign({}, options)
    finalOptions.name = getContractName(AbiName, options.name, options.address, options.network)
    const processor = new GenericProcessor(eventAbi, finalOptions)
    addProcessor(AbiName, options, processor)
    // }
    return processor
  }
}
