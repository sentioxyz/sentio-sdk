import { errorString, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfig,
  Data_SuiCall,
  Data_SuiEvent,
  DataBinding,
  HandlerType,
  MoveCallHandlerConfig,
  MoveEventHandlerConfig,
  ProcessConfigResponse,
  ProcessResult,
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'

import { SuiProcessorState } from './sui-processor.js'
import { getChainId } from './network.js'

export class SuiPlugin extends Plugin {
  name: string = 'SuiPlugin'

  private suiEventHandlers: ((event: Data_SuiEvent) => Promise<ProcessResult>)[] = []
  private suiCallHandlers: ((func: Data_SuiCall) => Promise<ProcessResult>)[] = []

  async configure(config: ProcessConfigResponse) {
    for (const suiProcessor of SuiProcessorState.INSTANCE.getValues()) {
      const contractConfig = ContractConfig.fromPartial({
        transactionConfig: [],
        processorType: USER_PROCESSOR,
        contract: {
          name: suiProcessor.moduleName,
          chainId: getChainId(suiProcessor.config.network),
          address: suiProcessor.config.address,
          abi: '',
        },
        startBlock: BigInt(suiProcessor.config.startTimestamp),
      })
      for (const handler of suiProcessor.eventHandlers) {
        const handlerId = this.suiEventHandlers.push(handler.handler) - 1
        const eventHandlerConfig: MoveEventHandlerConfig = {
          filters: handler.filters.map((f) => {
            return {
              type: f.type,
              account: f.account || '',
            }
          }),
          fetchConfig: handler.fetchConfig,
          handlerId,
        }
        contractConfig.moveEventConfigs.push(eventHandlerConfig)
      }
      for (const handler of suiProcessor.callHandlers) {
        const handlerId = this.suiCallHandlers.push(handler.handler) - 1
        const functionHandlerConfig: MoveCallHandlerConfig = {
          filters: handler.filters.map((filter) => {
            return {
              function: filter.function,
              typeArguments: filter.typeArguments || [],
              withTypeArguments: !!filter.typeArguments,
              includeFailed: filter.includeFailed || false,
            }
          }),
          fetchConfig: handler.fetchConfig,
          handlerId,
        }
        contractConfig.moveCallConfigs.push(functionHandlerConfig)
      }
      config.contractConfigs.push(contractConfig)
    }
  }

  supportedHandlers = [HandlerType.SUI_EVENT, HandlerType.SUI_CALL]

  async processSuiEvent(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.suiEvent) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const promises: Promise<ProcessResult>[] = []
    const event = binding.data.suiEvent

    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.suiEventHandlers[handlerId](event).catch((e) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing event: ' + JSON.stringify(event) + '\n' + errorString(e)
          )
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processSuiFunctionCall(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.suiCall) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Call can't be empty")
    }
    const call = binding.data.suiCall

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.suiCallHandlers[handlerId](call).catch((e) => {
        throw new ServerError(Status.INTERNAL, 'error processing call: ' + JSON.stringify(call) + '\n' + errorString(e))
      })
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.SUI_EVENT:
        return this.processSuiEvent(request)
      case HandlerType.SUI_CALL:
        return this.processSuiFunctionCall(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }
}

PluginManager.INSTANCE.register(new SuiPlugin())
