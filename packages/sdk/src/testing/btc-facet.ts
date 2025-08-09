import { TestProcessorServer } from './test-processor-server.js'
import { DataBinding, HandlerType } from '@sentio/protos'
import { BTCChainId } from '@sentio/chain'
import '../btc/btc-plugin.js'

export class BTCFacet {
  server: TestProcessorServer

  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testOnTransactions(events: any, network: BTCChainId = BTCChainId.BTC_TESTNET) {
    const bindings = this.buildBinding(events, network)
    if (!bindings) {
      throw Error('Invalid test : ' + JSON.stringify(events))
    }

    return this.server.processBindings({
      bindings
    })
  }

  private buildBinding(data: any, network: BTCChainId): DataBinding[] {
    const res: DataBinding[] = []

    for (const config of this.server.contractConfigs) {
      if (config.contract?.chainId !== network) {
        continue
      }

      for (const txConfig of config.btcTransactionConfigs) {
        const binding = {
          data: {
            btcTransaction: data
          },
          handlerIds: [txConfig.handlerId],
          handlerType: HandlerType.BTC_TRANSACTION,
          chainId: network
        } as DataBinding
        res.push(binding)
      }
    }
    return res
  }
}
