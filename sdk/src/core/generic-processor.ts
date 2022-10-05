import { BaseContract } from '@ethersproject/contracts'
import { BoundContractView, ContractView } from './context'
import { BindOptions } from './bind-options'
import { BaseProcessor } from './base-processor'
import { getProvider } from '../provider'
import { addProcessor, getContractName } from '../binds'

export class GenericProcessor extends BaseProcessor<
  BaseContract,
  BoundContractView<BaseContract, ContractView<BaseContract>>
> {
  eventABI: string[]
  constructor(eventABI: string[], options: BindOptions) {
    super(options)
    this.eventABI = eventABI
  }

  protected CreateBoundContractView(): BoundContractView<BaseContract, ContractView<BaseContract>> {
    const contract = new BaseContract(this.config.address, this.eventABI, getProvider(this.config.network))
    return new BoundContractView(new ContractView<BaseContract>(contract))
  }

  public static bind(eventABI: string[] | string, options: BindOptions): GenericProcessor {
    const AbiName = 'Generic'
    if (!Array.isArray(eventABI)) {
      eventABI = [eventABI]
    }

    const finalOptions = Object.assign({}, options)
    finalOptions.name = getContractName(AbiName, options.name, options.address, options.network)
    const processor = new GenericProcessor(eventABI, finalOptions)
    addProcessor(AbiName, options, processor)
    return processor
  }
}
