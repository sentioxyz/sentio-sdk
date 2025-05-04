import { CallHandler, FuelBaseProcessor, FuelProcessorState, FuelTransaction } from './types.js'
import { Data_FuelTransaction } from '@sentio/protos'
import { Provider } from 'fuels'
import { getProvider } from './network.js'
import { decodeFuelTransaction, DEFAULT_FUEL_FETCH_CONFIG, FuelFetchConfig } from './transaction.js'
import { FuelContext } from './context.js'
import { FuelProcessorConfig, getOptionsSignature } from './fuel-processor.js'
import { mergeProcessResults } from '@sentio/runtime'
import { ALL_ADDRESS } from '../core/index.js'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'

type GlobalFuelProcessorConfig = Omit<FuelProcessorConfig, 'address' | 'abi'>

export class FuelGlobalProcessor implements FuelBaseProcessor<GlobalFuelProcessorConfig> {
  txHandlers: CallHandler<Data_FuelTransaction>[] = []
  blockHandlers = []

  private provider: Provider

  static bind(config: GlobalFuelProcessorConfig): FuelGlobalProcessor {
    const processor = new FuelGlobalProcessor(config)
    const sig =
      'global_' +
      getOptionsSignature({
        ...config,
        address: ALL_ADDRESS
      })
    FuelProcessorState.INSTANCE.getOrSetValue(sig, processor)
    return processor
  }

  constructor(readonly config: GlobalFuelProcessorConfig) {
    return proxyProcessor(this)
  }

  async configure() {
    this.provider = await getProvider(this.config.chainId)
  }

  public onTransaction(
    handler: (transaction: FuelTransaction, ctx: FuelContext) => void | Promise<void>,
    config: FuelFetchConfig = DEFAULT_FUEL_FETCH_CONFIG
  ) {
    const callHandler = {
      handlerName: getHandlerName(),
      handler: async (call: Data_FuelTransaction) => {
        let tx: FuelTransaction
        try {
          tx = await decodeFuelTransaction(call.transaction, this.provider)
        } catch (e) {
          console.error('error decoding transaction', e)
          return mergeProcessResults([])
        }
        const ctx = new FuelContext(
          this.config.chainId,
          ALL_ADDRESS,
          this.config.name ?? '*',
          call.timestamp || new Date(0),
          tx,
          null
        )
        await handler(tx, ctx)
        return ctx.stopAndGetResult()
      },
      fetchConfig: {
        filters: [],
        ...config
      }
    }
    this.txHandlers.push(callHandler)
    return this
  }
}
