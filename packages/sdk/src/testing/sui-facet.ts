import { DataBinding, HandlerType } from '@sentio/protos'
import { getChainId } from '../sui/network.js'
import { TestProcessorServer } from './test-processor-server.js'
import { parseMoveType } from '../move/types.js'
import { SuiNetwork } from '../sui/index.js'
import { MoveEvent, SuiTransactionResponse, MoveCall } from '@mysten/sui.js'
import { getMoveCalls } from '../sui/utils.js'
import { SPLITTER } from '../move/index.js'

export class SuiFacet {
  server: TestProcessorServer
  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testEntryFunctionCall(transaction: SuiTransactionResponse, network: SuiNetwork = SuiNetwork.MAIN_NET) {
    return this.testEntryFunctionCalls([transaction], network)
  }

  testEntryFunctionCalls(transactions: SuiTransactionResponse[], network: SuiNetwork = SuiNetwork.MAIN_NET) {
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
    transaction: SuiTransactionResponse,
    network: SuiNetwork = SuiNetwork.MAIN_NET
  ): DataBinding | undefined {
    const calls: MoveCall[] = getMoveCalls(transaction)
    if (calls.length !== 1) {
      throw Error('Transaction has more than one calls')
    }
    const functionType = [calls[0].package.objectId, calls[0].module, calls[0].function].join(SPLITTER)

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
    return undefined
  }

  testEvent(transaction: SuiTransactionResponse, event: number | MoveEvent, network: SuiNetwork = SuiNetwork.MAIN_NET) {
    if (typeof event !== 'number') {
      const transaction2: SuiTransactionResponse = {} as any
      Object.assign(transaction2, transaction)
      transaction = transaction2
      transaction.effects.events = [event]
      event = 0
    }
    const binding = this.buildEventBinding(transaction, event, network)
    if (!binding) {
      throw Error('Invalid test event: ' + JSON.stringify(transaction))
    }
    return this.server.processBinding(binding)
  }

  private buildEventBinding(
    transaction: SuiTransactionResponse,
    eventIdx: number,
    network: SuiNetwork = SuiNetwork.MAIN_NET
  ): DataBinding | undefined {
    // const allEvents = new Set(transaction.events.map(e => e.type))
    const event = transaction.effects.events?.[eventIdx]
    if (!event || !event.moveEvent) {
      throw Error('Invaild test transaction, no event located')
    }

    for (const config of this.server.contractConfigs) {
      if (config.contract?.chainId !== getChainId(network)) {
        continue
      }
      for (const eventConfig of config.moveEventConfigs) {
        for (const eventFilter of eventConfig.filters) {
          if (config.contract.address + '::' + eventFilter.type === parseMoveType(event.moveEvent.type).qname) {
            transaction.effects.events = [event]
            return {
              data: {
                suiEvent: {
                  transaction,
                  timestamp: new Date(transaction.timestamp_ms || 0),
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
    return undefined
  }
}
