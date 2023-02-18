import { Transaction_UserTransaction, TransactionPayload_EntryFunctionPayload } from '../aptos/index.js'
import { DataBinding, HandlerType } from '@sentio/protos'
import { getChainId } from '../aptos/network.js'
import { TestProcessorServer } from './test-processor-server.js'
import { AptosNetwork, Event } from '@sentio/sdk/aptos'
import { parseMoveType } from '../aptos/types.js'

export class AptosFacet {
  server: TestProcessorServer
  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testEntryFunctionCall(transaction: Transaction_UserTransaction, network: AptosNetwork = AptosNetwork.MAIN_NET) {
    return this.testEntryFunctionCalls([transaction], network)
  }

  testEntryFunctionCalls(transactions: Transaction_UserTransaction[], network: AptosNetwork = AptosNetwork.MAIN_NET) {
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
    transaction: Transaction_UserTransaction,
    network: AptosNetwork = AptosNetwork.MAIN_NET
  ): DataBinding | undefined {
    const payload = transaction.payload as TransactionPayload_EntryFunctionPayload
    for (const config of this.server.contractConfigs) {
      if (config.contract?.chainId !== getChainId(network)) {
        continue
      }
      for (const callConfig of config.moveCallConfigs) {
        for (const callFilter of callConfig.filters) {
          if (config.contract.address + '::' + callFilter.function === payload.function) {
            return {
              data: {
                aptCall: {
                  transaction,
                },
              },
              handlerIds: [callConfig.handlerId],
              handlerType: HandlerType.APT_CALL,
            }
          }
        }
      }
    }
    return undefined
  }

  testEvent(
    transaction: Transaction_UserTransaction,
    event: number | Event,
    network: AptosNetwork = AptosNetwork.MAIN_NET
  ) {
    if (typeof event !== 'number') {
      const transaction2: Transaction_UserTransaction = {} as any
      Object.assign(transaction2, transaction)
      transaction = transaction2
      transaction.events = [event]
      event = 0
    }
    const binding = this.buildEventBinding(transaction, event, network)
    if (!binding) {
      throw Error('Invalid test event: ' + JSON.stringify(transaction))
    }
    return this.server.processBinding(binding)
  }

  private buildEventBinding(
    transaction: Transaction_UserTransaction,
    eventIdx: number,
    network: AptosNetwork = AptosNetwork.MAIN_NET
  ): DataBinding | undefined {
    // const allEvents = new Set(transaction.events.map(e => e.type))
    for (const config of this.server.contractConfigs) {
      if (config.contract?.chainId !== getChainId(network)) {
        continue
      }
      for (const eventConfig of config.moveEventConfigs) {
        for (const eventFilter of eventConfig.filters) {
          if (
            config.contract.address + '::' + eventFilter.type ===
            parseMoveType(transaction.events[eventIdx].type).qname
          ) {
            transaction.events = [transaction.events[eventIdx]]
            return {
              data: {
                aptEvent: {
                  transaction,
                },
              },
              handlerIds: [eventConfig.handlerId],
              handlerType: HandlerType.APT_EVENT,
            }
          }
        }
      }
    }
    return undefined
  }
}
