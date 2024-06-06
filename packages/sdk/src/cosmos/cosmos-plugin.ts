import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfig,
  Data_CosmosCall,
  DataBinding,
  HandlerType,
  ProcessConfigResponse,
  ProcessResult,
  StartRequest
} from '@sentio/protos'
import { ServerError, Status } from 'nice-grpc'
import { TemplateInstanceState } from '../core/template.js'
import { CosmosProcessorState } from './types.js'

interface Handlers {
  callHandlers: ((trace: Data_CosmosCall) => Promise<ProcessResult>)[]
}

export class CosmosPlugin extends Plugin {
  name: string = 'CosmosPlugin'
  handlers: Handlers = {
    callHandlers: []
  }

  async configure(config: ProcessConfigResponse) {
    const handlers: Handlers = {
      callHandlers: []
    }

    for (const processor of CosmosProcessorState.INSTANCE.getValues()) {
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

        contractConfig.cosmosLogConfigs.push({
          handlerId,
          logFilters: callHandler.logConfig?.logFilters || []
        })
      }

      // Finish up a contract
      config.contractConfigs.push(contractConfig)
    }

    this.handlers = handlers
  }

  supportedHandlers = [HandlerType.COSMOS_CALL]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.COSMOS_CALL:
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
    if (!binding.data?.cosmosCall?.transaction) {
      throw new ServerError(Status.INVALID_ARGUMENT, "transaction can't be null")
    }
    const call = binding.data.cosmosCall

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.callHandlers[handlerId](call).catch((e) => {
        throw new ServerError(
          Status.INTERNAL,
          'error processing transaction: ' + JSON.stringify(call.transaction) + '\n' + errorString(e)
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

PluginManager.INSTANCE.register(new CosmosPlugin())
