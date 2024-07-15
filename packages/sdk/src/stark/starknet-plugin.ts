import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfig,
  Data_StarknetEvent,
  DataBinding,
  HandlerType,
  ProcessConfigResponse,
  ProcessResult,
  StartRequest
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'
import { TemplateInstanceState } from '../core/template.js'
import { StarknetProcessorState } from './starknet-processor.js'
import { hash } from 'starknet'

interface Handlers {
  callHandlers: ((trace: Data_StarknetEvent) => Promise<ProcessResult>)[]
}

export class StarknetPlugin extends Plugin {
  name: string = 'StarknetPlugin'
  handlers: Handlers = {
    callHandlers: []
  }

  async configure(config: ProcessConfigResponse) {
    const handlers: Handlers = {
      callHandlers: []
    }

    for (const processor of StarknetProcessorState.INSTANCE.getValues()) {
      await processor.configure()
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

        if (callHandler.eventFilter) {
          contractConfig.starknetEventConfigs.push({
            filters: callHandler.eventFilter.map((e) => ({
              address: processor.config.address,
              keys: [hash.getSelectorFromName(e)]
            })),
            handlerId
          })
        }
      }

      // Finish up a contract
      config.contractConfigs.push(contractConfig)
    }

    this.handlers = handlers
  }

  supportedHandlers = [HandlerType.STARKNET_EVENT]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.STARKNET_EVENT:
        return this.processEvent(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async start(request: StartRequest) {}

  stateDiff(config: ProcessConfigResponse): boolean {
    return TemplateInstanceState.INSTANCE.getValues().length !== config.templateInstances.length
  }

  async processEvent(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.starknetEvents?.result) {
      throw new ServerError(Status.INVALID_ARGUMENT, "starknetEvents can't be null")
    }

    const promises: Promise<ProcessResult>[] = []

    const result = binding.data?.starknetEvents?.result

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.callHandlers[handlerId](binding.data?.starknetEvents).catch((e) => {
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

PluginManager.INSTANCE.register(new StarknetPlugin())
