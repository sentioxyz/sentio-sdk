import { FuelProcessor, FuelProcessorConfig, FuelProcessorState } from './fuel-processor.js'
import { JsonAbi } from 'fuels'
import { FuelCall, FuelContext } from './context.js'
import { FuelFetchConfig } from './transaction.js'
import { FuelChainId } from '@sentio/chain'


export abstract class FuelAbstractProcessor extends FuelProcessor {

  protected constructor(abi: JsonAbi, config?: FuelProcessorConfig) {
    if (!config) {
      config = {
        chainId: FuelChainId.FUEL_MAINNET,
        address: ''
      }
    }
    config.abi = abi
    super(config)
    FuelProcessorState.INSTANCE.addValue(this)
  }

  protected onCallMethod<T extends Array<any>, R>(method: string, fn: (call: TypedCall<T, R>, ctx: FuelContext) => (void | Promise<void>), config: FuelFetchConfig): this {
    const nameFilter = method
    const handler =async (call: FuelCall, ctx: FuelContext) => {
      await fn({
        args: call.functionScopes[0].getCallConfig().args as T,
        returnValue: call.value as R
      }, ctx)
    }
    return super.onCall(nameFilter, handler, config)
  }

}

export type TypedCall<T extends Array<any>, R> = {
  args: T
  returnValue: R
}