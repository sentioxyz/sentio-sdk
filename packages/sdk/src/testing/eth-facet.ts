import { TestProcessorServer } from './test-processor-server.js'
import { HandlerType, ProcessBindingResponse } from '@sentio/protos'
import { DataBinding } from '@sentio/runtime'
import { Trace } from '../eth/eth.js'
import { BlockParams, LogParams, TransactionResponseParams } from 'ethers/providers'
import { ChainId, EthChainId } from '@sentio/chain'
import { ALL_ADDRESS } from '../index.js'

export class EthFacet {
  server: TestProcessorServer

  constructor(server: TestProcessorServer) {
    this.server = server
  }

  testTrace(trace: Trace, network: EthChainId = EthChainId.ETHEREUM): Promise<ProcessBindingResponse> {
    return this.testTraces([trace], network)
  }

  testTraces(traces: Trace[], network: EthChainId = EthChainId.ETHEREUM): Promise<ProcessBindingResponse> {
    const bindings = []
    for (const trace of traces) {
      const binding = this.buildTraceBinding(trace, network)
      if (!binding) {
        throw Error('Invalid test trace: ' + JSON.stringify(trace))
      }
      bindings.push(binding)
    }
    return this.server.processBindings({
      bindings: bindings
    })
  }

  buildTraceBinding(trace: Trace, network: ChainId = EthChainId.ETHEREUM): DataBinding | undefined {
    if (trace.type !== 'call' || !trace.action.input) {
      throw Error('Invalid test trace: ' + JSON.stringify(trace))
    }
    const signature = trace.action.input.slice(0, 10)

    for (const contract of this.server.contractConfigs) {
      if (contract.contract?.chainId !== network) {
        continue
      }
      if (
        trace.action.to?.toLowerCase() !== contract.contract?.address.toLowerCase() &&
        contract.contract?.address !== ALL_ADDRESS
      ) {
        continue
      }
      for (const config of contract.traceConfigs) {
        if (config.signature == signature) {
          return {
            data: {
              ethTrace: {
                trace,
                timestamp: new Date()
              }
            },
            handlerIds: [config.handlerId],
            handlerType: HandlerType.ETH_TRACE
          }
        }
      }
    }
    return undefined
  }

  testLog(log: LogParams, network: EthChainId = EthChainId.ETHEREUM): Promise<ProcessBindingResponse> {
    return this.testLogs([log], network)
  }

  testLogs(logs: LogParams[], network: EthChainId = EthChainId.ETHEREUM): Promise<ProcessBindingResponse> {
    const bindings = []
    for (const log of logs) {
      const binding = this.buildLogBinding(log, network)
      if (!binding) {
        throw Error('Invalid test log: ' + JSON.stringify(log))
      }
      bindings.push(binding)
    }
    return this.server.processBindings({
      bindings: bindings
    })
  }

  buildLogBinding(log: LogParams, network: EthChainId = EthChainId.ETHEREUM): DataBinding | undefined {
    for (const contract of this.server.contractConfigs) {
      if (contract.contract?.chainId !== network) {
        continue
      }
      if (
        log.address.toLowerCase() !== contract.contract?.address.toLowerCase() &&
        contract.contract?.address !== '*'
      ) {
        continue
      }
      for (const config of contract.logConfigs) {
        for (const filter of config.filters) {
          // if (filter.topics.length != log.topics.length) {
          //   continue
          // }

          let match = true
          for (const topicIdx in filter.topics) {
            const logTopic = log.topics[topicIdx]
            const possibleTopic = filter.topics[topicIdx].hashes
            if (possibleTopic.length === 0) {
              // match all
              continue
            }
            if (possibleTopic.find((e) => e.toLowerCase() === logTopic.toLowerCase())) {
              // find one
              continue
            }
            match = false
            break
          }
          if (match) {
            return {
              data: {
                ethLog: { log, timestamp: new Date(), rawLog: JSON.stringify(log) }
              },
              handlerIds: [config.handlerId],
              handlerType: HandlerType.ETH_LOG
            }
          }
        }
      }
    }
    return undefined
  }
  testAccountLog(
    address: string,
    log: LogParams,
    network: EthChainId = EthChainId.ETHEREUM
  ): Promise<ProcessBindingResponse> {
    return this.testAccountLogs(address, [log], network)
  }

  testAccountLogs(
    address: string,
    logs: LogParams[],
    network: EthChainId = EthChainId.ETHEREUM
  ): Promise<ProcessBindingResponse> {
    const bindings = []
    for (const log of logs) {
      const binding = this.buildAccountLogBinding(address, log, network)
      if (!binding) {
        throw Error('Invalid test log: ' + JSON.stringify(log))
      }
      bindings.push(binding)
    }
    return this.server.processBindings({
      bindings: bindings
    })
  }

  buildAccountLogBinding(
    address: string,
    log: LogParams,
    network: EthChainId = EthChainId.ETHEREUM
  ): DataBinding | undefined {
    for (const account of this.server.accountConfigs) {
      if (account.chainId !== network) {
        continue
      }
      if (address.toLowerCase() !== account.address.toLowerCase()) {
        continue
      }
      for (const config of account.logConfigs) {
        for (const filter of config.filters) {
          // if (filter.topics.length != log.topics.length) {
          //   continue
          // }

          let match = true
          for (const topicIdx in filter.topics) {
            const logTopic = log.topics[topicIdx]
            const possibleTopic = filter.topics[topicIdx].hashes
            if (possibleTopic.length === 0) {
              // match all
              continue
            }
            if (possibleTopic.find((e) => e.toLowerCase() === logTopic.toLowerCase())) {
              // find one
              continue
            }
            match = false
            break
          }
          if (match) {
            return {
              data: {
                ethLog: { log, timestamp: new Date(), rawLog: JSON.stringify(log) }
              },
              handlerIds: [config.handlerId],
              handlerType: HandlerType.ETH_LOG
            }
          }
        }
      }
    }
    return undefined
  }

  testBlock(
    block: Partial<BlockParams> & { number: number },
    network: EthChainId = EthChainId.ETHEREUM
  ): Promise<ProcessBindingResponse> {
    return this.testBlocks([block], network)
  }

  testBlocks(blocks: (Partial<BlockParams> & { number: number })[], network: EthChainId = EthChainId.ETHEREUM) {
    const bindings = []
    for (const block of blocks) {
      const binding = this.buildBlockBinding(block, network)
      if (!binding) {
        throw Error('Invalid test block: ' + JSON.stringify(block))
      }
      bindings.push(binding)
    }
    return this.server.processBindings({
      bindings: bindings
    })
  }

  buildBlockBinding(
    block: Partial<BlockParams> & { number: number },
    network: EthChainId = EthChainId.ETHEREUM
  ): DataBinding {
    const binding: DataBinding = {
      data: {
        ethBlock: { block }
      },
      handlerType: HandlerType.ETH_BLOCK,
      handlerIds: []
    }
    for (const contract of this.server.contractConfigs) {
      if (contract.contract?.chainId !== network) {
        continue
      }
      const longBlockNumber = block.number
      if (longBlockNumber < contract.startBlock) {
        continue
      }
      if (contract.endBlock !== 0n && longBlockNumber >= contract.endBlock) {
        continue
      }

      for (const config of contract.intervalConfigs) {
        binding.handlerIds.push(config.handlerId)
      }
    }
    return binding
  }

  testTransaction(
    transaction: Partial<TransactionResponseParams>,
    network: EthChainId = EthChainId.ETHEREUM
  ): Promise<ProcessBindingResponse> {
    return this.testTransactions([transaction], network)
  }

  testTransactions(transactions: Partial<TransactionResponseParams>[], network: EthChainId = EthChainId.ETHEREUM) {
    const bindings = []
    for (const transaction of transactions) {
      const binding = this.buildTransactionBinding(transaction, network)
      if (!binding) {
        throw Error('Invalid test transaction: ' + JSON.stringify(transaction))
      }
      bindings.push(binding)
    }
    return this.server.processBindings({
      bindings: bindings
    })
  }

  buildTransactionBinding(
    transaction: Partial<TransactionResponseParams>,
    network: EthChainId = EthChainId.ETHEREUM
  ): DataBinding {
    const binding: DataBinding = {
      data: {
        ethTransaction: { transaction, timestamp: new Date(), rawTransaction: JSON.stringify(transaction) }
      },
      handlerType: HandlerType.ETH_TRANSACTION,
      handlerIds: []
    }
    for (const contract of this.server.contractConfigs) {
      if (contract.contract?.chainId !== network) {
        continue
      }
      for (const config of contract.transactionConfig) {
        binding.handlerIds.push(config.handlerId)
      }
    }
    return binding
  }
}
