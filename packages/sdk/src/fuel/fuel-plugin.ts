import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import { PartitionHandlerManager } from '../core/index.js'
import { HandlerRegister } from '../core/handler-register.js'
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
import { TemplateInstanceState } from '../core/template.js'
import { FuelAssetProcessor } from './asset-processor.js'
import { FuelProcessorState } from './types.js'
import { FuelProcessor } from './fuel-processor.js'
import { FuelGlobalProcessor } from './global-processor.js'

export class FuelPlugin extends Plugin {
  name: string = 'FuelPlugin'
  handlerRegister = new HandlerRegister()
  partitionManager = new PartitionHandlerManager()

  async init(config: InitResponse) {
    for (const fuelProcessor of FuelProcessorState.INSTANCE.getValues()) {
      const chainId = fuelProcessor.config.chainId
      config.chainIds.push(chainId)
    }
  }

  async configure(config: ProcessConfigResponse, forChainId?: string) {
    this.handlerRegister.clear(forChainId as any)

    for (const processor of FuelProcessorState.INSTANCE.getValues()) {
      const chainId = processor.config.chainId
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
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
        const handlerId = this.handlerRegister.register(txHandler.handler, chainId)
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
        const handlerId = this.handlerRegister.register(receiptHandler.handler, chainId)
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
        const handlerId = this.handlerRegister.register(blockHandler.handler, chainId)
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
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(receipt)
        .catch((e: any) => {
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
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(fuelTransaction)
        .catch((e: any) => {
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
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(ethBlock)
        .catch((e: any) => {
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
