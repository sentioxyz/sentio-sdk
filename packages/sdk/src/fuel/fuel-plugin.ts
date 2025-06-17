import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import { PartitionHandlerManager } from '../core/index.js'
import {
  ContractConfig,
  Data_FuelBlock,
  Data_FuelReceipt,
  Data_FuelTransaction,
  DataBinding,
  HandlerType,
  ProcessConfigResponse,
  ProcessResult,
  ProcessStreamResponse_Partitions,
  StartRequest
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'
import { TemplateInstanceState } from '../core/template.js'
import { FuelAssetProcessor } from './asset-processor.js'
import { FuelProcessorState } from './types.js'
import { FuelProcessor } from './fuel-processor.js'
import { FuelGlobalProcessor } from './global-processor.js'

interface Handlers {
  transactionHandlers: ((trace: Data_FuelTransaction) => Promise<ProcessResult>)[]
  blockHandlers: ((block: Data_FuelBlock) => Promise<ProcessResult>)[]
  receiptHandlers: ((log: Data_FuelReceipt) => Promise<ProcessResult>)[]
}

export class FuelPlugin extends Plugin {
  name: string = 'FuelPlugin'
  handlers: Handlers = {
    transactionHandlers: [],
    blockHandlers: [],
    receiptHandlers: []
  }

  partitionManager = new PartitionHandlerManager()

  async configure(config: ProcessConfigResponse) {
    const handlers: Handlers = {
      transactionHandlers: [],
      blockHandlers: [],
      receiptHandlers: []
    }

    for (const processor of FuelProcessorState.INSTANCE.getValues()) {
      const processorConfig = processor.config
      const contractConfig = ContractConfig.fromPartial({
        processorType: USER_PROCESSOR,
        contract: {
          name: processorConfig.name,
          chainId: processorConfig.chainId.toString(),
          address: processorConfig.address || '*',
          abi: ''
        },
        startBlock: processorConfig.startBlock,
        endBlock: processorConfig.endBlock
      })
      for (const txHandler of processor.txHandlers) {
        const handlerId = handlers.transactionHandlers.push(txHandler.handler) - 1
        this.partitionManager.registerPartitionHandler(
          HandlerType.FUEL_TRANSACTION,
          handlerId,
          txHandler.partitionHandler
        )
        const handlerName = txHandler.handlerName
        if (processor instanceof FuelProcessor) {
          // on transaction
          const fetchConfig = {
            handlerId,
            handlerName
          }
          contractConfig.fuelTransactionConfigs.push(fetchConfig)
        } else if (processor instanceof FuelAssetProcessor) {
          const assetConfig = txHandler.assetConfig
          contractConfig.assetConfigs.push({
            filters: assetConfig?.filters || [],
            handlerId,
            handlerName
          })
        } else if (processor instanceof FuelGlobalProcessor) {
          const fetchConfig = {
            handlerId,
            handlerName,
            filters: []
          }
          contractConfig.fuelTransactionConfigs.push(fetchConfig)
          contractConfig.contract!.address = '*'
        }
      }

      for (const receiptHandler of processor.receiptHandlers ?? []) {
        const handlerId = handlers.receiptHandlers.push(receiptHandler.handler) - 1
        this.partitionManager.registerPartitionHandler(
          HandlerType.FUEL_RECEIPT,
          handlerId,
          receiptHandler.partitionHandler
        )
        const handlerName = receiptHandler.handlerName
        if (processor instanceof FuelProcessor) {
          contractConfig.fuelReceiptConfigs.push({
            ...receiptHandler.receiptConfig,
            handlerId,
            handlerName
          })
        }
      }

      for (const blockHandler of processor.blockHandlers) {
        const handlerId = handlers.blockHandlers.push(blockHandler.handler) - 1
        this.partitionManager.registerPartitionHandler(HandlerType.FUEL_BLOCK, handlerId, blockHandler.partitionHandler)
        contractConfig.intervalConfigs.push({
          slot: 0,
          slotInterval: blockHandler.blockInterval,
          minutes: 0,
          minutesInterval: blockHandler.timeIntervalInMinutes,
          handlerId: handlerId,
          handlerName: blockHandler.handlerName,
          fetchConfig: undefined
          // fetchConfig: blockHandler.fetchConfig
        })
      }

      config.contractConfigs.push(contractConfig)
    }

    this.handlers = handlers
  }

  supportedHandlers = [
    HandlerType.FUEL_TRANSACTION,
    HandlerType.FUEL_RECEIPT,
    HandlerType.FUEL_CALL,
    HandlerType.FUEL_BLOCK
  ]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.FUEL_TRANSACTION:
        return this.processTransaction(request)
      case HandlerType.FUEL_RECEIPT:
        return this.processReceipt(request)
      case HandlerType.FUEL_BLOCK:
        return this.processBlock(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    let data: any
    switch (request.handlerType) {
      case HandlerType.FUEL_TRANSACTION:
        if (!request.data?.fuelTransaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, "fuelTransaction can't be empty")
        }
        data = request.data.fuelTransaction
        break
      case HandlerType.FUEL_RECEIPT:
        if (!request.data?.fuelLog) {
          throw new ServerError(Status.INVALID_ARGUMENT, "fuelReceipt can't be empty")
        }
        data = request.data.fuelLog
        break
      case HandlerType.FUEL_BLOCK:
        if (!request.data?.fuelBlock) {
          throw new ServerError(Status.INVALID_ARGUMENT, "fuelBlock can't be empty")
        }
        data = request.data.fuelBlock
        break
      case HandlerType.FUEL_CALL:
        // FUEL_CALL uses the same data as FUEL_TRANSACTION
        if (!request.data?.fuelTransaction) {
          throw new ServerError(Status.INVALID_ARGUMENT, "fuelTransaction can't be empty for FUEL_CALL")
        }
        data = request.data.fuelTransaction
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

  async start(request: StartRequest) {
    try {
      for (const processor of FuelProcessorState.INSTANCE.getValues()) {
        await processor.configure()
      }
    } catch (e) {
      throw new ServerError(Status.INTERNAL, 'error starting FuelPlugin: ' + errorString(e))
    }
  }

  stateDiff(config: ProcessConfigResponse): boolean {
    return TemplateInstanceState.INSTANCE.getValues().length !== config.templateInstances.length
  }

  async processReceipt(binding: DataBinding): Promise<ProcessResult> {
    const receipt = binding?.data?.fuelLog

    if (!receipt?.transaction) {
      throw new ServerError(Status.INVALID_ARGUMENT, "transaction can't be null")
    }

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.receiptHandlers[handlerId](receipt).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing transaction: ' + JSON.stringify(receipt) + '\n' + errorString(e)
        )
      })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processTransaction(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.fuelTransaction?.transaction) {
      throw new ServerError(Status.INVALID_ARGUMENT, "transaction can't be null")
    }
    const fuelTransaction = binding.data.fuelTransaction

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.transactionHandlers[handlerId](fuelTransaction).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing transaction: ' + JSON.stringify(fuelTransaction.transaction) + '\n' + errorString(e)
        )
      })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processBlock(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.fuelBlock?.block) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Block can't be empty")
    }
    const ethBlock = binding.data.fuelBlock

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.blockHandlers[handlerId](ethBlock).catch((e) => {
        console.error('error processing block: ', e)
        throw new ServerError(
          Status.INTERNAL,
          'error processing block: ' + ethBlock.block?.height + '\n' + errorString(e)
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

PluginManager.INSTANCE.register(new FuelPlugin())
