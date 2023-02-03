import { BaseContract } from 'ethers'
import { BoundContractView, ContractView } from '../core/context.js'
import { BindOptions } from '../core/bind-options.js'
import { BaseProcessor } from './base-processor.js'
import { getProvider } from './provider.js'
import { addProcessor } from './binds.js'

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
    if (!Array.isArray(eventABI)) {
      eventABI = [eventABI]
    }
    if (!options.name) {
      options.name = 'Generic'
    }
    const processor = new GenericProcessor(eventABI, options)
    addProcessor(options, processor)
    return processor
  }
}
