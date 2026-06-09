import type { GrpcTypes } from '@mysten/sui/grpc'
import { type DataBinding, DataBindingSchema, HandlerType, timestampNow } from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { TestProcessorServer } from './test-processor-server.js'
import { accountTypeString, parseMoveType, SPLITTER } from '../move/index.js'
import { SuiNetwork } from '../sui/index.js'
import { getMoveCalls } from '../sui/utils.js'

export class SuiFacet {
  server: TestProcessorServer
  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testEntryFunctionCall(transaction: GrpcTypes.ExecutedTransaction, network: SuiNetwork = SuiNetwork.MAIN_NET) {
    return this.testEntryFunctionCalls([transaction], network)
  }

  testEntryFunctionCalls(transactions: GrpcTypes.ExecutedTransaction[], network: SuiNetwork = SuiNetwork.MAIN_NET) {
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
    transaction: GrpcTypes.ExecutedTransaction,
    network: SuiNetwork = SuiNetwork.MAIN_NET
  ): DataBinding | undefined {
    const calls: GrpcTypes.MoveCall[] = getMoveCalls(transaction)
    // if (calls.length !== 1) {
    //   throw Error('Transaction has more than one calls')
    // }
    for (const call of calls) {
      const functionType = [accountTypeString(call.package ?? ''), call.module, call.function].join(SPLITTER)

      for (const config of this.server.contractConfigs) {
        if (config.contract?.chainId !== network) {
          continue
        }
        for (const callConfig of config.moveCallConfigs) {
          for (const callFilter of callConfig.filters) {
            if (accountTypeString(config.contract.address) + '::' + callFilter.function === functionType) {
              return create(DataBindingSchema, {
                data: {
                  value: {
                    case: 'suiCall',
                    value: {
                      rawTransaction: JSON.stringify(transaction),
                      timestamp: timestampNow(),
                      slot: 10000n
                    }
                  }
                },
                handlerIds: [callConfig.handlerId],
                handlerType: HandlerType.SUI_CALL,
                chainId: network
              })
            }
          }
        }
      }
    }
    return undefined
  }

  testEvent(transaction: GrpcTypes.ExecutedTransaction, network: SuiNetwork = SuiNetwork.MAIN_NET) {
    const binding = this.buildEventBinding(transaction, network)
    if (!binding) {
      throw Error('Invalid test event: ' + JSON.stringify(transaction))
    }
    return this.server.processBinding(binding)
  }

  // limitation, can't really do filter logic
  testGlobalTransaction(transaction: GrpcTypes.ExecutedTransaction, network: SuiNetwork = SuiNetwork.MAIN_NET) {
    const handlerIds = []
    for (const config of this.server.contractConfigs) {
      if (config.contract?.address === '*') {
        for (const callConfig of config.moveCallConfigs) {
          if (callConfig.filters.length === 1 && callConfig.filters[0].function === '') {
            handlerIds.push(callConfig.handlerId)
          }
        }
      }
    }
    if (handlerIds.length === 0) {
      throw Error('Invalid test global transaction: ' + JSON.stringify(transaction))
    }

    const binding: DataBinding = create(DataBindingSchema, {
      handlerIds,
      handlerType: HandlerType.SUI_CALL,
      data: {
        value: {
          case: 'suiCall',
          value: {
            rawTransaction: JSON.stringify(transaction),
            timestamp: timestampNow(),
            slot: BigInt(transaction.checkpoint || 0)
          }
        }
      },
      chainId: network
    })
    return this.server.processBinding(binding)
  }

  private buildEventBinding(
    transaction: GrpcTypes.ExecutedTransaction,
    network: SuiNetwork = SuiNetwork.MAIN_NET
  ): DataBinding | undefined {
    // const allEvents = new Set(transaction.events.map(e => e.type))

    for (const config of this.server.contractConfigs) {
      if (config.contract?.chainId !== network) {
        continue
      }
      for (const eventConfig of config.moveEventConfigs) {
        for (const eventFilter of eventConfig.filters) {
          for (const event of transaction.events?.events || []) {
            if (
              accountTypeString(config.contract.address) + '::' + eventFilter.type ===
              parseMoveType(event.eventType ?? '').qname
            ) {
              return create(DataBindingSchema, {
                data: {
                  value: {
                    case: 'suiEvent',
                    value: {
                      rawEvent: JSON.stringify(event),
                      rawTransaction: JSON.stringify(transaction),
                      timestamp: timestampNow(),
                      slot: 10000n
                    }
                  }
                },
                handlerIds: [eventConfig.handlerId],
                handlerType: HandlerType.SUI_EVENT,
                chainId: network
              })
            }
          }
        }
      }
    }
    return undefined
  }
}
