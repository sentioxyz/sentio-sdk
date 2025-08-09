import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfig,
  DataBinding,
  HandlerType,
  InitResponse,
  ProcessConfigResponse,
  ProcessResult,
  ProcessStreamResponse_Partitions,
  StartRequest
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'
import { PartitionHandlerManager } from '../core/index.js'
import { HandlerRegister } from '../core/handler-register.js'
import { TemplateInstanceState } from '../core/template.js'
import { BTCProcessorState } from './btc-processor.js'
import { filters2Proto, TransactionFilter } from './filter.js'

export class BTCPlugin extends Plugin {
  name: string = 'BTCPlugin'
  handlerRegister = new HandlerRegister()
  partitionManager = new PartitionHandlerManager()

  async init(config: InitResponse) {
    for (const aptosProcessor of BTCProcessorState.INSTANCE.getValues()) {
      const chainId = aptosProcessor.config.chainId
      config.chainIds.push(chainId)
    }
  }

  async configure(config: ProcessConfigResponse, forChainId?: string) {
    this.handlerRegister.clear(forChainId as any)

    for (const processor of BTCProcessorState.INSTANCE.getValues()) {
      const chainId = processor.config.chainId
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
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
        const handlerId = this.handlerRegister.register(callHandler.handler, chainId)
        this.partitionManager.registerPartitionHandler(
          HandlerType.BTC_TRANSACTION,
          handlerId,
          callHandler.partitionHandler
        )
        const handlerName = callHandler.handlerName

        if (callHandler.filter) {
          contractConfig.btcTransactionConfigs.push({
            filters: filters2Proto(callHandler.filter),
            handlerId,
            handlerName
          })
        } else if (contractConfig.contract?.address != '*') {
          contractConfig.btcTransactionConfigs.push({
            filters: filters2Proto({
              outputFilter: {
                script_address: processor.config.address
              }
            } as TransactionFilter),
            handlerId,
            handlerName
          })
        }
      }

      for (const blockHandler of processor.blockHandlers) {
        const handlerId = this.handlerRegister.register(blockHandler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.BTC_BLOCK, handlerId, blockHandler.partitionHandler)
        contractConfig.intervalConfigs.push({
          slot: 0,
          slotInterval: blockHandler.blockInterval,
          minutes: 0,
          minutesInterval: blockHandler.timeIntervalInMinutes,
          handlerId,
          handlerName: blockHandler.handlerName,
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
  }

  supportedHandlers = [HandlerType.BTC_TRANSACTION, HandlerType.BTC_BLOCK]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.BTC_TRANSACTION:
        return this.processTransaction(request)
      case HandlerType.BTC_BLOCK:
        return this.processBlock(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    let data: any
    switch (request.handlerType) {
      case HandlerType.BTC_TRANSACTION:
        if (!request.data?.btcTransaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, "btcTransaction can't be empty")
        }
        data = request.data.btcTransaction
        break
      case HandlerType.BTC_BLOCK:
        if (!request.data?.btcBlock) {
          throw new ServerError(Status.INVALID_ARGUMENT, "btcBlock can't be empty")
        }
        data = request.data.btcBlock
        break
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
    const partitions = await this.partitionManager.processPartitionForHandlerType(
      request.handlerType,
      request.handlerIds,
      data
    )
    return {
      partitions
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
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(binding.data?.btcTransaction)
        .catch((e: any) => {
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

  private async processBlock(request: DataBinding) {
    if (!request.data?.btcBlock) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Block can't be empty")
    }

    const block = request.data.btcBlock

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of request.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(
          request.chainId,
          handlerId
        )(block)
        .catch((e: any) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing block: ' + JSON.stringify(block) + '\n' + errorString(e)
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
