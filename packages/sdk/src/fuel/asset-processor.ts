import { CallHandler, FuelBaseProcessor, FuelProcessorState } from './types.js'
import { Data_FuelReceipt, Data_FuelTransaction, FuelAssetHandlerConfig_AssetFilter } from '@sentio/protos'
import { FuelNetwork, getProvider } from './network.js'
import { FuelContext } from './context.js'
import { decodeFuelTransaction } from './transaction.js'
import { Provider, InputType, OutputType } from 'fuels'
import { getOptionsSignature } from './fuel-processor.js'
import { getHandlerName, proxyProcessor } from '../utils/metrics.js'

export class FuelAssetProcessor implements FuelBaseProcessor<FuelAssetProcessorConfig> {
  txHandlers: CallHandler<Data_FuelTransaction | Data_FuelReceipt>[] = []
  blockHandlers = []
  private provider: Provider

  static bind(config: FuelAssetProcessorConfig): FuelAssetProcessor {
    const processor = new FuelAssetProcessor(config)
    const sig =
      'assets_' +
      getOptionsSignature({
        ...config,
        address: '*'
      })
    FuelProcessorState.INSTANCE.getOrSetValue(sig, processor)
    return processor
  }

  constructor(readonly config: FuelAssetProcessorConfig) {
    return proxyProcessor(this)
  }

  async configure(): Promise<void> {
    this.provider = await getProvider(this.config.chainId)
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
      handlerName: getHandlerName(),
      handler: async (call: Data_FuelTransaction) => {
        const gqlTransaction = call.transaction
        const tx = await decodeFuelTransaction(gqlTransaction, this.provider)

        const transfer: FuelTransfer = {
          from: [],
          to: []
        }
        let assetId = ''
        for (const input of tx.transaction.inputs || []) {
          if (input.type == InputType.Coin) {
            transfer.from.push({
              address: input.owner,
              assetId: input.assetId,
              amount: BigInt(input.amount.toString(10))
            })
            assetId = input.assetId
          }
        }

        for (const output of tx.transaction.outputs || []) {
          switch (output.type) {
            case OutputType.Change:
            case OutputType.Coin:
            case OutputType.Variable:
              const value = output.amount.toString(10)
              transfer.to.push({
                address: output.to,
                amount: BigInt(value),
                assetId: output.assetId
              })
              if (assetId == '') {
                assetId = output.assetId
              }
          }
        }

        const ctx = new FuelContext(
          this.config.chainId,
          assetId,
          this.config.name ?? '',
          call.timestamp || new Date(0),
          tx,
          null
        )
        await handler(transfer, ctx)
        return ctx.stopAndGetResult()
      },
      assetConfig: {
        filters
      }
    }
    this.txHandlers.push(callHandler)
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
  // The  account address that is sending the asset
  from?: string | string[]
  // The account address that is receiving the asset
  to?: string | string[]
  // The asset id of the asset being transferred
  assetId?: string | string[]
}

export type FuelTransfer = {
  from: {
    assetId: string
    address: string
    amount: bigint
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
