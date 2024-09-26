import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfig,
  Data_BTCBlock,
  Data_BTCTransaction,
  DataBinding,
  HandlerType,
  ProcessConfigResponse,
  ProcessResult,
  StartRequest
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'
import { TemplateInstanceState } from '../core/template.js'
import { BTCProcessorState } from './btc-processor.js'
import { filters2Proto, TransactionFilter } from './filter.js'

interface Handlers {
  txHandlers: ((trace: Data_BTCTransaction) => Promise<ProcessResult>)[]
  blockHandlers: ((trace: Data_BTCBlock) => Promise<ProcessResult>)[]
}

export class BTCPlugin extends Plugin {
  name: string = 'BTCPlugin'
  handlers: Handlers = {
    txHandlers: [],
    blockHandlers: []
  }

  async configure(config: ProcessConfigResponse) {
    const handlers: Handlers = {
      txHandlers: [],
      blockHandlers: []
    }

    for (const processor of BTCProcessorState.INSTANCE.getValues()) {
      const contractConfig = ContractConfig.fromPartial({
        processorType: USER_PROCESSOR,
        contract: {
          name: processor.config.name,
          chainId: processor.config.chainId.toString(),
          address: processor.config.address || '*',
          abi: ''
        },
        startBlock: processor.config.startBlock,
        endBlock: processor.config.endBlock
      })
      for (const callHandler of processor.callHandlers) {
        const handlerId = handlers.txHandlers.push(callHandler.handler) - 1

        if (callHandler.filter) {
          contractConfig.btcTransactionConfigs.push({
            filters: filters2Proto(callHandler.filter),
            handlerId
          })
        } else if (contractConfig.contract?.address != '*') {
          contractConfig.btcTransactionConfigs.push({
            filters: filters2Proto({
              outputFilter: {
                script_address: processor.config.address
              }
            } as TransactionFilter),
            handlerId
          })
        }
      }

      for (const blockHandler of processor.blockHandlers) {
        const handlerId = handlers.blockHandlers.push(blockHandler.handler) - 1
        contractConfig.intervalConfigs.push({
          slot: 0,
          slotInterval: blockHandler.blockInterval,
          minutes: 0,
          minutesInterval: blockHandler.timeIntervalInMinutes,
          handlerId,
          fetchConfig: {
            transaction: blockHandler.fetchConfig?.getTransactions ?? false,
            trace: false,
            block: true,
            transactionReceipt: false,
            transactionReceiptLogs: false
          }
        })
      }

      // Finish up a contract
      config.contractConfigs.push(contractConfig)
    }

    this.handlers = handlers
  }

  supportedHandlers = [HandlerType.BTC_TRANSACTION, HandlerType.BTC_BLOCK]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.BTC_TRANSACTION:
        return this.processTransaction(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async start(request: StartRequest) {}

  stateDiff(config: ProcessConfigResponse): boolean {
    return TemplateInstanceState.INSTANCE.getValues().length !== config.templateInstances.length
  }

  async processTransaction(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.btcTransaction) {
      throw new ServerError(Status.INVALID_ARGUMENT, "BTCEvents can't be null")
    }

    const promises: Promise<ProcessResult>[] = []

    const result = binding.data?.btcTransaction

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.txHandlers[handlerId](binding.data?.btcTransaction).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing transaction: ' + JSON.stringify(result) + '\n' + errorString(e)
        )
      })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }
}

PluginManager.INSTANCE.register(new BTCPlugin())
