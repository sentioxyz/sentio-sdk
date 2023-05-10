import { errorString, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  AccountConfig,
  ContractConfig,
  Data_SuiCall,
  Data_SuiEvent,
  Data_SuiObject,
  DataBinding,
  HandlerType,
  MoveCallHandlerConfig,
  MoveEventHandlerConfig,
  ProcessConfigResponse,
  ProcessResult,
  StartRequest,
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'

import { SuiAccountProcessorState, SuiProcessorState } from './sui-processor.js'
import { validateAndNormalizeAddress } from './utils.js'
import { initCoinList } from './ext/coin.js'

interface Handlers {
  suiEventHandlers: ((event: Data_SuiEvent) => Promise<ProcessResult>)[]
  suiCallHandlers: ((func: Data_SuiCall) => Promise<ProcessResult>)[]
  suiObjectHandlers: ((object: Data_SuiObject) => Promise<ProcessResult>)[]
}

export class SuiPlugin extends Plugin {
  name: string = 'SuiPlugin'
  handlers: Handlers = {
    suiCallHandlers: [],
    suiEventHandlers: [],
    suiObjectHandlers: [],
  }
  async start(start: StartRequest): Promise<void> {
    await initCoinList()
  }

  async configure(config: ProcessConfigResponse) {
    const handlers: Handlers = {
      suiCallHandlers: [],
      suiEventHandlers: [],
      suiObjectHandlers: [],
    }
    for (const suiProcessor of SuiProcessorState.INSTANCE.getValues()) {
      const contractConfig = ContractConfig.fromPartial({
        transactionConfig: [],
        processorType: USER_PROCESSOR,
        contract: {
          name: suiProcessor.moduleName,
          chainId: suiProcessor.config.network,
          address: validateAndNormalizeAddress(suiProcessor.config.address),
          abi: '',
        },
        startBlock: suiProcessor.config.startCheckpoint,
      })
      for (const handler of suiProcessor.eventHandlers) {
        const handlerId = handlers.suiEventHandlers.push(handler.handler) - 1
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
        const handlerId = handlers.suiCallHandlers.push(handler.handler) - 1
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

    for (const processor of SuiAccountProcessorState.INSTANCE.getValues()) {
      const accountConfig = AccountConfig.fromPartial({
        address: validateAndNormalizeAddress(processor.config.address),
        chainId: processor.getChainId(),
        startBlock: processor.config.startCheckpoint, // TODO maybe use another field
      })
      for (const handler of processor.objectHandlers) {
        const handlerId = handlers.suiObjectHandlers.push(handler.handler) - 1
        accountConfig.moveIntervalConfigs.push({
          intervalConfig: {
            handlerId: handlerId,
            minutes: 0,
            minutesInterval: handler.timeIntervalInMinutes,
            slot: 0,
            slotInterval: handler.versionInterval,
            fetchConfig: undefined,
          },
          type: handler.type || '',
          ownerType: processor.ownerType,
        })
      }
      config.accountConfigs.push(accountConfig)
    }
    this.handlers = handlers
  }

  supportedHandlers = [HandlerType.SUI_EVENT, HandlerType.SUI_CALL, HandlerType.SUI_OBJECT]

  async processSuiEvent(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.suiEvent) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const promises: Promise<ProcessResult>[] = []
    const event = binding.data.suiEvent

    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.handlers.suiEventHandlers[handlerId](event).catch((e) => {
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
      const promise = this.handlers.suiCallHandlers[handlerId](call).catch((e) => {
        throw new ServerError(Status.INTERNAL, 'error processing call: ' + JSON.stringify(call) + '\n' + errorString(e))
      })
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processSuiObject(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.suiObject) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Object can't be empty")
    }
    const object = binding.data.suiObject

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.handlers.suiObjectHandlers[handlerId](object).catch((e) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing object: ' + JSON.stringify(object) + '\n' + errorString(e)
          )
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.SUI_EVENT:
        return this.processSuiEvent(request)
      case HandlerType.SUI_CALL:
        return this.processSuiFunctionCall(request)
      case HandlerType.SUI_OBJECT:
        return this.processSuiObject(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }
}

PluginManager.INSTANCE.register(new SuiPlugin())
