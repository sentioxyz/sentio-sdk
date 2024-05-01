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
      for (const callConfig of config.fuelCallConfigs) {
        const binding = {
          data: {
            fuelCall: {
              transaction,
              timestamp: new Date()
            }
          },
          handlerIds: [callConfig.handlerId],
          handlerType: HandlerType.FUEL_CALL
        }

        const filter = callConfig.filters[0]?.function
        if (filter) {
          // filter out by tx receipt
          for (const receipt of transaction.receipts || []) {
            if (receipt.receiptType == 'CALL' && receipt.param1 == filter) {
              res.push(binding)
            }
          }
        } else {
          res.push(binding)
        }
      }
      for (const assetConfig of config.assetConfigs) {
        const binding = {
          data: {
            fuelCall: {
              transaction,
              timestamp: new Date()
            }
          },
          handlerIds: [assetConfig.handlerId],
          handlerType: HandlerType.FUEL_CALL
        }

        res.push(binding)
      }
    }

    return res
  }
}
