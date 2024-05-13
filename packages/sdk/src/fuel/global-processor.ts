import { CallHandler, FuelBaseProcessor, FuelProcessorState } from './types.js'
import { Data_FuelCall } from '@sentio/protos'
import { Provider } from '@fuel-ts/account'
import { getRpcEndpoint } from './network.js'
import { decodeFuelTransaction, DEFAULT_FUEL_FETCH_CONFIG, FuelFetchConfig, FuelTransaction } from './transaction.js'
import { FuelContext } from './context.js'
import { FuelProcessorConfig } from './fuel-processor.js'

type GlobalFuelProcessorConfig = Omit<FuelProcessorConfig, 'address' | 'abi'>

export class FuelGlobalProcessor implements FuelBaseProcessor<GlobalFuelProcessorConfig> {
  callHandlers: CallHandler<Data_FuelCall>[] = []

  private provider: Provider

  static bind(config: GlobalFuelProcessorConfig): FuelGlobalProcessor {
    const processor = new FuelGlobalProcessor(config)
    FuelProcessorState.INSTANCE.addValue(processor)
    return processor
  }

  constructor(readonly config: GlobalFuelProcessorConfig) {}

  async configure() {
    const url = getRpcEndpoint(this.config.chainId)
    this.provider = await Provider.create(url)
  }

  public onTransaction(
    handler: (transaction: FuelTransaction, ctx: FuelContext) => void | Promise<void>,
    config: FuelFetchConfig = DEFAULT_FUEL_FETCH_CONFIG
  ) {
    const callHandler = {
      handler: async (call: Data_FuelCall) => {
        const tx = decodeFuelTransaction(call.transaction, this.provider)
        const ctx = new FuelContext(this.config.chainId, '*', this.config.name ?? '*', tx)
        await handler(tx, ctx)
        return ctx.stopAndGetResult()
      },
      fetchConfig: {
        filters: [],
        ...config
      }
    }
    this.callHandlers.push(callHandler)
    return this
  }
}
