import { FuelProcessor, FuelProcessorConfig } from './fuel-processor.js'
import { JsonAbi } from '@fuel-ts/abi-coder'
import { FuelCall } from './context.js'
import { FuelChainId } from '@sentio/chain'
import { FuelLog, FuelProcessorState } from './types.js'

export abstract class FuelAbstractProcessor extends FuelProcessor {
  protected constructor(abi: JsonAbi, config?: FuelProcessorConfig) {
    if (!config) {
      config = {
        chainId: FuelChainId.FUEL_MAINNET,
        address: '*'
      }
    }
    config.abi = abi
    super(config)
    FuelProcessorState.INSTANCE.addValue(this)
  }
}

export class TypedCall<T extends Array<any>, R> {
  args: T
  returnValue: R
  argsObject?: Record<string, any>
  logs?: FuelLog<unknown>[]

  constructor(call: FuelCall) {
    this.args = call.functionScopes[0].getCallConfig().args as T
    this.returnValue = call.value as R
    this.argsObject = call.args
    this.logs = call.logs
  }
}
