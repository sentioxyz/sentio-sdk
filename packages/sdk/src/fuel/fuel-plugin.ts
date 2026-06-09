import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import { PartitionHandlerManager } from '../core/index.js'
import { HandlerRegister } from '../core/handler-register.js'
import {
  ContractConfigSchema,
  DataBinding,
  FuelAssetHandlerConfigSchema,
  FuelReceiptHandlerConfigSchema,
  FuelTransactionHandlerConfigSchema,
  HandlerType,
  InitResponse,
  OnIntervalConfigSchema,
  ProcessConfigResponse,
  ProcessResult,
  ProcessStreamResponse_Partitions,
  ProcessStreamResponse_PartitionsSchema,
  StartRequest
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { ConnectError, Code } from '@connectrpc/connect'
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
      const contractConfig = create(ContractConfigSchema, {
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
          const fetchConfig = create(FuelTransactionHandlerConfigSchema, {
            handlerId,
            handlerName
          })
          contractConfig.fuelTransactionConfigs.push(fetchConfig)
        } else if (processor instanceof FuelAssetProcessor) {
          const assetConfig = txHandler.assetConfig
          contractConfig.assetConfigs.push(
            create(FuelAssetHandlerConfigSchema, {
              filters: assetConfig?.filters || [],
              handlerId,
              handlerName
            })
          )
        } else if (processor instanceof FuelGlobalProcessor) {
          const fetchConfig = create(FuelTransactionHandlerConfigSchema, {
            handlerId,
            handlerName
          })
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
          contractConfig.fuelReceiptConfigs.push(
            create(FuelReceiptHandlerConfigSchema, {
              ...receiptHandler.receiptConfig,
              handlerId,
              handlerName
            })
          )
        }
      }

      for (const blockHandler of processor.blockHandlers) {
        const handlerId = this.handlerRegister.register(blockHandler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.FUEL_BLOCK, handlerId, blockHandler.partitionHandler)
        contractConfig.intervalConfigs.push(
          create(OnIntervalConfigSchema, {
            slot: 0,
            slotInterval: blockHandler.blockInterval,
            minutes: 0,
            minutesInterval: blockHandler.timeIntervalInMinutes,
            handlerId: handlerId,
            handlerName: blockHandler.handlerName,
            fetchConfig: undefined
            // fetchConfig: blockHandler.fetchConfig
          })
        )
      }

      config.contractConfigs.push(contractConfig)
    }
  }

  supportedHandlers = [HandlerType.FUEL_TRANSACTION, HandlerType.FUEL_RECEIPT, HandlerType.FUEL_BLOCK]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.FUEL_TRANSACTION:
        return this.processTransaction(request)
      case HandlerType.FUEL_RECEIPT:
        return this.processReceipt(request)
      case HandlerType.FUEL_BLOCK:
        return this.processBlock(request)
      default:
        throw new ConnectError('No handle type registered ' + request.handlerType, Code.InvalidArgument)
    }
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    let data: any
    switch (request.handlerType) {
      case HandlerType.FUEL_TRANSACTION:
        if (request.data?.value.case !== 'fuelTransaction') {
          throw new ConnectError("fuelTransaction can't be empty", Code.InvalidArgument)
        }
        data = request.data.value.value
        break
      case HandlerType.FUEL_RECEIPT:
        if (request.data?.value.case !== 'fuelLog') {
          throw new ConnectError("fuelReceipt can't be empty", Code.InvalidArgument)
        }
        data = request.data.value.value
        break
      case HandlerType.FUEL_BLOCK:
        if (request.data?.value.case !== 'fuelBlock') {
          throw new ConnectError("fuelBlock can't be empty", Code.InvalidArgument)
        }
        data = request.data.value.value
        break
      default:
        throw new ConnectError('No handle type registered ' + request.handlerType, Code.InvalidArgument)
    }
    const partitions = await this.partitionManager.processPartitionForHandlerType(
      request.handlerType,
      request.handlerIds,
      data
    )
    return create(ProcessStreamResponse_PartitionsSchema, {
      partitions
    })
  }

  async start(request: StartRequest) {
    try {
      for (const processor of FuelProcessorState.INSTANCE.getValues()) {
        await processor.configure()
      }
    } catch (e) {
      throw new ConnectError('error starting FuelPlugin: ' + errorString(e), Code.Internal)
    }
  }

  async processReceipt(binding: DataBinding): Promise<ProcessResult> {
    const receipt = binding?.data?.value.case === 'fuelLog' ? binding.data.value.value : undefined

    if (!receipt?.transaction) {
      throw new ConnectError("transaction can't be null", Code.InvalidArgument)
    }

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(receipt)
        .catch((e: any) => {
          throw new ConnectError(
            'error processing transaction: ' + JSON.stringify(receipt) + '\n' + errorString(e),
            Code.Internal
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
    if (binding.data?.value.case !== 'fuelTransaction' || !binding.data.value.value.transaction) {
      throw new ConnectError("transaction can't be null", Code.InvalidArgument)
    }
    const fuelTransaction = binding.data.value.value

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(fuelTransaction)
        .catch((e: any) => {
          throw new ConnectError(
            'error processing transaction: ' + JSON.stringify(fuelTransaction.transaction) + '\n' + errorString(e),
            Code.Internal
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
    if (binding.data?.value.case !== 'fuelBlock' || !binding.data.value.value.block) {
      throw new ConnectError("Block can't be empty", Code.InvalidArgument)
    }
    const ethBlock = binding.data.value.value

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(ethBlock)
        .catch((e: any) => {
          console.error('error processing block: ', e)
          throw new ConnectError(
            'error processing block: ' + (ethBlock.block as any)?.height + '\n' + errorString(e),
            Code.Internal
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
