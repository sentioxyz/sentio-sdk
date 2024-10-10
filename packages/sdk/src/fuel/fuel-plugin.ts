import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfig,
  Data_FuelBlock,
  Data_FuelCall,
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
  callHandlers: ((trace: Data_FuelCall) => Promise<ProcessResult>)[]
  blockHandlers: ((block: Data_FuelBlock) => Promise<ProcessResult>)[]
}

export class FuelPlugin extends Plugin {
  name: string = 'FuelPlugin'
  handlers: Handlers = {
    callHandlers: [],
    blockHandlers: []
  }

  async configure(config: ProcessConfigResponse) {
    const handlers: Handlers = {
      callHandlers: [],
      blockHandlers: []
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
      for (const callHandler of processor.callHandlers) {
        const handlerId = handlers.callHandlers.push(callHandler.handler) - 1
        if (processor instanceof FuelProcessor) {
          if (callHandler.logConfig?.logIds?.length) {
            contractConfig.fuelLogConfigs.push({
              logIds: callHandler.logConfig.logIds,
              handlerId
            })
          } else {
            const fetchConfig = {
              handlerId,
              filters: callHandler.fetchConfig?.filters || []
            }
            contractConfig.fuelCallConfigs.push(fetchConfig)
          }
        } else if (processor instanceof FuelAssetProcessor) {
          const assetConfig = callHandler.assetConfig
          contractConfig.assetConfigs.push({
            filters: assetConfig?.filters || [],
            handlerId
          })
        } else if (processor instanceof FuelGlobalProcessor) {
          const fetchConfig = {
            handlerId,
            filters: []
          }
          contractConfig.fuelCallConfigs.push(fetchConfig)
          contractConfig.contract!.address = '*'
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
          fetchConfig: undefined
          // fetchConfig: blockHandler.fetchConfig
        })
      }

      // Finish up a contract
      config.contractConfigs.push(contractConfig)
    }

    this.handlers = handlers
  }

  supportedHandlers = [HandlerType.FUEL_CALL, HandlerType.FUEL_BLOCK]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.FUEL_CALL:
        return this.processTransaction(request)
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

  async processTransaction(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.fuelCall?.transaction) {
      throw new ServerError(Status.INVALID_ARGUMENT, "transaction can't be null")
    }
    const fuelTransaction = binding.data.fuelCall

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.callHandlers[handlerId](fuelTransaction).catch((e) => {
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
