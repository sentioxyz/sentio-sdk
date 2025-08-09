import { TestProcessorServer } from './test-processor-server.js'
import { DataBinding, HandlerType } from '@sentio/protos'
import { CosmosNetwork } from '../cosmos/network.js'

export class CosmosFacet {
  server: TestProcessorServer

  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testOnTransaction(transaction: any, network: CosmosNetwork = CosmosNetwork.INJECTIVE_TESTNET) {
    const bindings = this.buildBinding(transaction, network)
    if (!bindings) {
      throw Error('Invalid test transaction: ' + JSON.stringify(transaction))
    }

    return this.server.processBindings({
      bindings
    })
  }

  private buildBinding(transaction: any, network: CosmosNetwork): DataBinding[] {
    const res: DataBinding[] = []
    for (const config of this.server.contractConfigs) {
      if (config.contract?.chainId !== network) {
        continue
      }

      for (const logConfig of config.cosmosLogConfigs) {
        const binding = {
          data: {
            cosmosCall: {
              transaction,
              timestamp: new Date()
            }
          },
          handlerIds: [logConfig.handlerId],
          handlerType: HandlerType.COSMOS_CALL,
          chainId: network
        }

        const logFilters = logConfig.logFilters
        for (const log of transaction.logs || []) {
          if (log.events.find((e: any) => logFilters.includes(e.type))) {
            res.push(binding)
            break
          }
        }
      }
    }

    return res
  }
}
