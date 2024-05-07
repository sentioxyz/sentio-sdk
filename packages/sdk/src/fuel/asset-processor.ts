import { CallHandler, FuelBaseProcessor, FuelProcessorState } from './types.js'
import { Data_FuelCall, FuelAssetHandlerConfig_AssetFilter } from '@sentio/protos'
import { FuelNetwork, getRpcEndpoint } from './network.js'
import { FuelContext } from './context.js'
import { decodeFuelTransaction } from './transaction.js'
import { Provider } from '@fuel-ts/account'
import { InputType, OutputType } from '@fuel-ts/transactions'

export class FuelAssetProcessor implements FuelBaseProcessor<FuelAssetProcessorConfig> {
  callHandlers: CallHandler<Data_FuelCall>[] = []
  private provider: Provider

  static bind(config: FuelAssetProcessorConfig): FuelAssetProcessor {
    const processor = new FuelAssetProcessor(config)
    FuelProcessorState.INSTANCE.addValue(processor)
    return processor
  }

  constructor(readonly config: FuelAssetProcessorConfig) {}

  async configure(): Promise<void> {
    const url = getRpcEndpoint(this.config.chainId)
    this.provider = await Provider.create(url)
  }

  onTransfer(filter: TransferFilter, handler: (transfers: FuelTransfer, ctx: FuelContext) => void | Promise<void>) {
    const filters: FuelAssetHandlerConfig_AssetFilter[] = []

    const assetIds = arrayify(filter.assetId)
    const froms = arrayify(filter.from)
    const tos = arrayify(filter.to)

    for (const assetId of assetIds) {
      for (const from of froms) {
        for (const to of tos) {
          filters.push({
            assetId: assetId,
            fromAddress: from,
            toAddress: to
          })
        }
      }
    }

    const callHandler = {
      handler: async (call: Data_FuelCall) => {
        const gqlTransaction = call.transaction
        const tx = decodeFuelTransaction(gqlTransaction, this.provider)

        const transfer: FuelTransfer = {
          from: [],
          to: []
        }
        for (const input of tx.transaction.inputs || []) {
          if (input.type == InputType.Coin) {
            transfer.from.push({
              address: input.owner,
              assetId: input.assetId
            })
          }
        }

        for (const output of tx.transaction.outputs || []) {
          if (output.type == OutputType.Coin) {
            const value = output.amount.toString(10)
            transfer.to.push({
              address: output.to,
              amount: BigInt(value),
              assetId: output.assetId
            })
          }
        }

        const assetId = transfer.from[0].assetId || ''

        const ctx = new FuelContext(this.config.chainId, assetId, this.config.name ?? '', tx)
        await handler(transfer, ctx)
        return ctx.stopAndGetResult()
      },
      assetConfig: {
        filters
      }
    }
    this.callHandlers.push(callHandler)
    return this
  }
}

export type FuelAssetProcessorConfig = {
  name?: string
  chainId: FuelNetwork
  startBlock?: bigint
  endBlock?: bigint
}

export type TransferFilter = {
  from?: string | string[]
  to?: string | string[]
  assetId?: string | string[]
}

export type FuelTransfer = {
  from: {
    assetId: string
    address: string
  }[]
  to: {
    address: string
    amount: bigint
    assetId: string
  }[]
}

function arrayify(value?: string | string[]): Array<string | undefined> {
  if (value) {
    if (Array.isArray(value)) {
      return value.length > 0 ? value : [undefined]
    }
    return [value]
  }
  return [undefined]
}
