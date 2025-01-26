import { TestProcessorServer } from './test-processor-server.js'
import { FuelChainId } from '@sentio/chain'
import { DataBinding, HandlerType } from '@sentio/protos'
import { FuelNetwork } from '../fuel/index.js'

export class FuelFacet {
  server: TestProcessorServer

  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testOnTransaction(transaction: any, network: FuelNetwork = FuelNetwork.TEST_NET) {
    const bindings = this.buildBinding(transaction, network)
    if (!bindings) {
      throw Error('Invalid test transaction: ' + JSON.stringify(transaction))
    }

    return this.server.processBindings({
      bindings
    })
  }

  private buildBinding(transaction: any, network: FuelChainId): DataBinding[] {
    const res: DataBinding[] = []
    for (const config of this.server.contractConfigs) {
      if (config.contract?.chainId !== network) {
        continue
      }
      for (const callConfig of config.fuelTransactionConfigs) {
        const binding = {
          data: {
            fuelTransaction: {
              transaction,
              timestamp: new Date()
            }
          },
          handlerIds: [callConfig.handlerId],
          handlerType: HandlerType.FUEL_TRANSACTION
        }

        res.push(binding)
      }

      for (const logConfig of config.fuelReceiptConfigs) {
        const binding = {
          data: {
            fuelLog: {
              transaction,
              timestamp: new Date(),
              receiptIndex: BigInt(transaction.status.receipts.findIndex((r: any) => r.rb == logConfig.log?.logIds[0]))
            }
          },
          handlerIds: [logConfig.handlerId],
          handlerType: HandlerType.FUEL_RECEIPT
        }

        const logIds = logConfig.log?.logIds ?? []
        for (const receipt of transaction.status.receipts || []) {
          if ((receipt.receiptType == 'LOG' || receipt.receiptType == 'LOG_DATA') && logIds.includes(receipt.rb)) {
            res.push(binding)
            break
          }
        }
      }

      for (const assetConfig of config.assetConfigs) {
        const binding = {
          data: {
            fuelTransaction: {
              transaction,
              timestamp: new Date()
            }
          },
          handlerIds: [assetConfig.handlerId],
          handlerType: HandlerType.FUEL_TRANSACTION
        }

        res.push(binding)
      }
    }

    return res
  }
}
