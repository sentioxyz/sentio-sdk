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

    // keep receipts order
    const receipts = transaction.status.receipts || []
    for (let i = 0; i < receipts.length; i++) {
      const receipt = receipts[i]
      if (receipt.receiptType != 'LOG' && receipt.receiptType != 'LOG_DATA') {
        continue
      }

      for (const config of this.server.contractConfigs) {
        for (const logConfig of config.fuelReceiptConfigs) {
          const logIds = logConfig.log?.logIds ?? []
          if (logIds.includes(receipt.rb)) {
            const binding = {
              data: {
                fuelLog: {
                  transaction,
                  timestamp: new Date(),
                  receiptIndex: BigInt(i)
                }
              },
              handlerIds: [logConfig.handlerId],
              handlerType: HandlerType.FUEL_RECEIPT
            }
            res.push(binding)
          }
        }
      }
    }

    return res
  }
}
