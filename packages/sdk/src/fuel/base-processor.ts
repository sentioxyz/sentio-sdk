import { addFuelProcessor, FuelProcessor, FuelProcessorConfig } from './fuel-processor.js'
import { Contract, JsonAbi } from 'fuels'
// import { FuelCall } from './context.js'
import { FuelChainId } from '@sentio/chain'
import { FuelLog } from './types.js'
import { proxyProcessor } from '../utils/metrics.js'

export abstract class FuelAbstractProcessor<TContract extends Contract> extends FuelProcessor<TContract> {
  protected constructor(abi: JsonAbi, config?: Omit<FuelProcessorConfig, 'abi'>) {
    if (!config) {
      config = {
        chainId: FuelChainId.FUEL_MAINNET,
        address: '*'
      }
    }
    super({
      ...config,
      abi
    })
    addFuelProcessor(config, this)
    return proxyProcessor(this)
  }
}

export class TypedCall<T extends Array<any>, R> {
  args: T
  returnValue: R
  argsObject?: Record<string, any>
  logs?: FuelLog<unknown>[]

  // constructor(call: FuelCall) {
  //   this.args = call.args as T
  //   this.returnValue = call.value as R
  //   this.argsObject = call.args
  //   this.logs = call.logs
  // }
}
