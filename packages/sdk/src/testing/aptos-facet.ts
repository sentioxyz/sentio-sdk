import { UserTransactionResponse, EntryFunctionPayloadResponse } from '@aptos-labs/ts-sdk'
import { DataBinding, HandlerType } from '@sentio/protos'
import { TestProcessorServer } from './test-processor-server.js'
import { AptosNetwork } from '../aptos/index.js'
import { parseMoveType, accountTypeString } from '../move/index.js'

export class AptosFacet {
  server: TestProcessorServer
  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testEntryFunctionCall(transaction: UserTransactionResponse, network: AptosNetwork = AptosNetwork.MAIN_NET) {
    return this.testEntryFunctionCalls([transaction], network)
  }

  testEntryFunctionCalls(transactions: UserTransactionResponse[], network: AptosNetwork = AptosNetwork.MAIN_NET) {
    const bindings = []
    for (const trans of transactions) {
      const binding = this.buildEntryFunctionCallBinding(trans, network)
      if (!binding) {
        throw Error('Invalid test transaction: ' + JSON.stringify(trans))
      }
      bindings.push(binding)
    }
    return this.server.processBindings({
      bindings: bindings
    })
  }

  private buildEntryFunctionCallBinding(
    transaction: UserTransactionResponse,
    network: AptosNetwork = AptosNetwork.MAIN_NET
  ): DataBinding | undefined {
    const payload = transaction.payload as EntryFunctionPayloadResponse
    for (const config of this.server.contractConfigs) {
      if (config.contract?.chainId !== network) {
        continue
      }
      for (const callConfig of config.moveCallConfigs) {
        for (const callFilter of callConfig.filters) {
          if (accountTypeString(config.contract.address) + '::' + callFilter.function === payload.function) {
            return {
              data: {
                aptCall: {
                  rawTransaction: JSON.stringify(transaction)
                }
              },
              handlerIds: [callConfig.handlerId],
              handlerType: HandlerType.APT_CALL,
              chainId: network
            }
          }
        }
      }
    }
    return undefined
  }

  testEvent(transaction: UserTransactionResponse, network: AptosNetwork = AptosNetwork.MAIN_NET) {
    const binding = this.buildEventBinding(transaction, network)
    if (!binding) {
      throw Error('Invalid test event: ' + JSON.stringify(transaction))
    }
    return this.server.processBinding(binding)
  }

  private buildEventBinding(
    transaction: UserTransactionResponse,
    network: AptosNetwork = AptosNetwork.MAIN_NET
  ): DataBinding | undefined {
    // const allEvents = new Set(transaction.events.map(e => e.type))
    for (const config of this.server.contractConfigs) {
      if (config.contract?.chainId !== network) {
        continue
      }
      for (const eventConfig of config.moveEventConfigs) {
        for (const eventFilter of eventConfig.filters) {
          for (const [idx, event] of transaction.events.entries()) {
            if (
              accountTypeString(config.contract.address) + '::' + eventFilter.type ===
              parseMoveType(event.type).qname
            ) {
              return {
                data: {
                  aptEvent: {
                    rawEvent: JSON.stringify(event),
                    eventIndex: idx,
                    rawTransaction: JSON.stringify(transaction)
                  }
                },
                handlerIds: [eventConfig.handlerId],
                handlerType: HandlerType.APT_EVENT,
                chainId: network
              }
            }
          }
        }
      }
    }
    return undefined
  }
}
