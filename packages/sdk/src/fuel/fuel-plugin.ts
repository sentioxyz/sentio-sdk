import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfig,
  Data_FuelCall,
  DataBinding,
  HandlerType,
  ProcessConfigResponse,
  ProcessResult,
  StartRequest
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'
import { GlobalProcessorState } from '../eth/base-processor.js'
import { TemplateInstanceState } from '../core/template.js'
import { FuelProcessorState } from './fuel-processor.js'

interface Handlers {
  callHandlers: ((trace: Data_FuelCall) => Promise<ProcessResult>)[]
}

export class FuelPlugin extends Plugin {
  name: string = 'FuelPlugin'
  handlers: Handlers = {
    callHandlers: []
  }

  async configure(config: ProcessConfigResponse) {
    const handlers: Handlers = {
      callHandlers: []
    }

    for (const processor of FuelProcessorState.INSTANCE.getValues()) {
      await processor.configure()
      const contractConfig = ContractConfig.fromPartial({
        processorType: USER_PROCESSOR,
        contract: {
          name: processor.config.name,
          chainId: processor.config.chainId.toString(),
          address: processor.config.address,
          abi: ''
        },
        startBlock: processor.config.startBlock,
        endBlock: processor.config.endBlock
      })

      for (const callHandler of processor.callHandlers) {
        const handlerId = handlers.callHandlers.push(callHandler.handler) - 1
        const fetchConfig = {
          handlerId,
          filters: callHandler.fetchConfig.filters || []
        }
        contractConfig.fuelCallConfigs.push(fetchConfig)
      }

      // Finish up a contract
      config.contractConfigs.push(contractConfig)
    }

    for (const processor of GlobalProcessorState.INSTANCE.getValues()) {
      const chainId = processor.getChainId()

      const contractConfig = ContractConfig.fromPartial({
        processorType: USER_PROCESSOR,
        contract: {
          name: processor.config.name,
          chainId: chainId.toString(),
          address: processor.config.address, // can only be *
          abi: ''
        },
        startBlock: processor.config.startBlock,
        endBlock: processor.config.endBlock
      })

      config.contractConfigs.push(contractConfig)
    }

    this.handlers = handlers
  }

  supportedHandlers = [HandlerType.FUEL_CALL]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    // return Promise.resolve(undefined);
    switch (request.handlerType) {
      // case HandlerType.FUEL_LOG:
      //   return this.processLog(request)
      // case HandlerType.FUEL_TRACE:
      //   return this.processTrace(request)
      // case HandlerType.FUEL_BLOCK:
      //   return this.processBlock(request)
      case HandlerType.FUEL_CALL:
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
}

PluginManager.INSTANCE.register(new FuelPlugin())
