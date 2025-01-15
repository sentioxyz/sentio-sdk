import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfig,
  Data_FuelBlock,
  Data_FuelReceipt,
  Data_FuelTransaction,
  DataBinding,
  HandlerType,
  ProcessConfigResponse,
  ProcessResult,
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
  logHandlers: ((log: Data_FuelReceipt) => Promise<ProcessResult>)[]
}

export class FuelPlugin extends Plugin {
  name: string = 'FuelPlugin'
  handlers: Handlers = {
    transactionHandlers: [],
    blockHandlers: [],
    logHandlers: []
  }

  async configure(config: ProcessConfigResponse) {
    const handlers: Handlers = {
      transactionHandlers: [],
      blockHandlers: [],
      logHandlers: []
    }

    for (const processor of FuelProcessorState.INSTANCE.getValues()) {
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
      for (const txHandler of processor.txHandlers) {
        const handlerId = handlers.transactionHandlers.push(txHandler.handler) - 1
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

      for (const logHandler of processor.logHandlers ?? []) {
        const handlerId = handlers.logHandlers.push(logHandler.handler) - 1
        const handlerName = logHandler.handlerName
        if (processor instanceof FuelProcessor) {
          contractConfig.fuelLogConfigs.push({
            logIds: logHandler.logConfig?.logIds || [],
            handlerId,
            handlerName
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
        return this.processLog(request)
      case HandlerType.FUEL_BLOCK:
        return this.processBlock(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
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

  async processLog(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.fuelLog?.transaction) {
      throw new ServerError(Status.INVALID_ARGUMENT, "transaction can't be null")
    }
    const log = binding.data.fuelLog

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.logHandlers[handlerId](log).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing transaction: ' + JSON.stringify(log) + '\n' + errorString(e)
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
