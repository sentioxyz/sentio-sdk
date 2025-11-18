import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfig,
  DataBinding,
  HandlerType,
  InitResponse,
  ProcessConfigResponse,
  ProcessResult,
  StartRequest
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'
import { HandlerRegister } from '../core/handler-register.js'
import { StarknetProcessorState } from './starknet-processor.js'
import { hash } from 'starknet'

export class StarknetPlugin extends Plugin {
  name: string = 'StarknetPlugin'
  handlerRegister = new HandlerRegister()

  async init(config: InitResponse) {
    for (const solanaProcessor of StarknetProcessorState.INSTANCE.getValues()) {
      const chainId = solanaProcessor.config.chainId
      config.chainIds.push(chainId)
    }
  }

  async configure(config: ProcessConfigResponse, forChainId?: string) {
    this.handlerRegister.clear(forChainId as any)

    for (const processor of StarknetProcessorState.INSTANCE.getValues()) {
      const chainId = processor.config.chainId
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
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
        const handlerId = this.handlerRegister.register(callHandler.handler, chainId)

        if (callHandler.eventFilter) {
          contractConfig.starknetEventConfigs.push({
            filters: callHandler.eventFilter.map((e) => ({
              address: processor.config.address,
              keys: [hash.getSelectorFromName(e)]
            })),
            handlerId,
            handlerName: callHandler.handlerName
          })
        }
      }

      // Finish up a contract
      config.contractConfigs.push(contractConfig)
    }
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

  async processEvent(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.starknetEvents?.result) {
      throw new ServerError(Status.INVALID_ARGUMENT, "starknetEvents can't be null")
    }

    const promises: Promise<ProcessResult>[] = []

    const result = binding.data?.starknetEvents?.result

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(binding.data?.starknetEvents)
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
}

PluginManager.INSTANCE.register(new StarknetPlugin())
