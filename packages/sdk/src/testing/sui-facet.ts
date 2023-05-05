import { SuiTransactionBlockResponse, MoveCallSuiTransaction } from '@mysten/sui.js'
import { DataBinding, HandlerType } from '@sentio/protos'
import { getChainId } from '../sui/network.js'
import { TestProcessorServer } from './test-processor-server.js'
import { parseMoveType } from '../move/types.js'
import { SuiNetwork } from '../sui/index.js'
import { getMoveCalls } from '../sui/utils.js'
import { SPLITTER } from '../move/index.js'

export class SuiFacet {
  server: TestProcessorServer
  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testEntryFunctionCall(transaction: SuiTransactionBlockResponse, network: SuiNetwork = SuiNetwork.MAIN_NET) {
    return this.testEntryFunctionCalls([transaction], network)
  }

  testEntryFunctionCalls(transactions: SuiTransactionBlockResponse[], network: SuiNetwork = SuiNetwork.MAIN_NET) {
    const bindings = []
    for (const trans of transactions) {
      const binding = this.buildEntryFunctionCallBinding(trans, network)
      if (!binding) {
        throw Error('Invalid test transaction: ' + JSON.stringify(trans))
      }
      bindings.push(binding)
    }
    return this.server.processBindings({
      bindings: bindings,
    })
  }

  private buildEntryFunctionCallBinding(
    transaction: SuiTransactionBlockResponse,
    network: SuiNetwork = SuiNetwork.MAIN_NET
  ): DataBinding | undefined {
    const calls: MoveCallSuiTransaction[] = getMoveCalls(transaction)
    // if (calls.length !== 1) {
    //   throw Error('Transaction has more than one calls')
    // }
    for (const call of calls) {
      const functionType = [call.package, call.module, call.function].join(SPLITTER)

      for (const config of this.server.contractConfigs) {
        if (config.contract?.chainId !== getChainId(network)) {
          continue
        }
        for (const callConfig of config.moveCallConfigs) {
          for (const callFilter of callConfig.filters) {
            if (config.contract.address + '::' + callFilter.function === functionType) {
              return {
                data: {
                  suiCall: {
                    transaction,
                    timestamp: new Date(),
                    slot: 10000n,
                  },
                },
                handlerIds: [callConfig.handlerId],
                handlerType: HandlerType.SUI_CALL,
              }
            }
          }
        }
      }
    }
    return undefined
  }

  testEvent(transaction: SuiTransactionBlockResponse, network: SuiNetwork = SuiNetwork.MAIN_NET) {
    const binding = this.buildEventBinding(transaction, network)
    if (!binding) {
      throw Error('Invalid test event: ' + JSON.stringify(transaction))
    }
    return this.server.processBinding(binding)
  }

  private buildEventBinding(
    transaction: SuiTransactionBlockResponse,
    network: SuiNetwork = SuiNetwork.MAIN_NET
  ): DataBinding | undefined {
    // const allEvents = new Set(transaction.events.map(e => e.type))

    for (const config of this.server.contractConfigs) {
      if (config.contract?.chainId !== getChainId(network)) {
        continue
      }
      for (const eventConfig of config.moveEventConfigs) {
        for (const eventFilter of eventConfig.filters) {
          for (const event of transaction.events || []) {
            if (config.contract.address + '::' + eventFilter.type === parseMoveType(event.type).qname) {
              return {
                data: {
                  suiEvent: {
                    transaction,
                    timestamp: new Date(transaction.timestampMs || 0),
                    slot: 10000n,
                  },
                },
                handlerIds: [eventConfig.handlerId],
                handlerType: HandlerType.SUI_EVENT,
              }
            }
          }
        }
      }
    }
    return undefined
  }
}
