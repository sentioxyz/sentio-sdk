import { errorString, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  AccountConfig,
  ContractConfig,
  Data_AptCall,
  Data_AptEvent,
  Data_AptResource,
  DataBinding,
  HandlerType,
  MoveCallHandlerConfig,
  MoveEventHandlerConfig,
  ProcessConfigResponse,
  ProcessResult,
  StartRequest,
  MoveOnIntervalConfig_OwnerType,
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'

import { AptosAccountProcessorState, AptosProcessorState } from './aptos-processor.js'

import { initCoinList } from './ext/coin.js'
import { validateAndNormalizeAddress } from './utils.js'

export class AptosPlugin extends Plugin {
  name: string = 'AptosPlugin'

  private aptosEventHandlers: ((event: Data_AptEvent) => Promise<ProcessResult>)[] = []
  private aptosCallHandlers: ((func: Data_AptCall) => Promise<ProcessResult>)[] = []
  private aptosResourceHandlers: ((resourceWithVersion: Data_AptResource) => Promise<ProcessResult>)[] = []

  async start(start: StartRequest) {
    await initCoinList()
  }

  async configure(config: ProcessConfigResponse) {
    for (const aptosProcessor of AptosProcessorState.INSTANCE.getValues()) {
      const contractConfig = ContractConfig.fromPartial({
        processorType: USER_PROCESSOR,
        contract: {
          name: aptosProcessor.moduleName,
          chainId: aptosProcessor.getChainId(),
          address: validateAndNormalizeAddress(aptosProcessor.config.address),
          abi: '',
        },
        startBlock: aptosProcessor.config.startVersion,
      })
      // 1. Prepare event handlers
      for (const handler of aptosProcessor.eventHandlers) {
        const handlerId = this.aptosEventHandlers.push(handler.handler) - 1
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

      // 2. Prepare function handlers
      for (const handler of aptosProcessor.callHandlers) {
        const handlerId = this.aptosCallHandlers.push(handler.handler) - 1
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

    for (const aptosProcessor of AptosAccountProcessorState.INSTANCE.getValues()) {
      const accountConfig = AccountConfig.fromPartial({
        address: validateAndNormalizeAddress(aptosProcessor.config.address),
        chainId: aptosProcessor.getChainId(),
        startBlock: aptosProcessor.config.startVersion,
      })
      for (const handler of aptosProcessor.resourcesHandlers) {
        const handlerId = this.aptosResourceHandlers.push(handler.handler) - 1
        // TODO move to only use moveIntervalConfigs
        accountConfig.aptosIntervalConfigs.push({
          intervalConfig: {
            handlerId: handlerId,
            minutes: 0,
            minutesInterval: handler.timeIntervalInMinutes,
            slot: 0,
            slotInterval: handler.versionInterval,
            fetchConfig: undefined,
          },
          type: handler.type || '',
        })

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
          ownerType: MoveOnIntervalConfig_OwnerType.ADDRESS,
        })
      }
      config.accountConfigs.push(accountConfig)
    }
  }

  supportedHandlers = [HandlerType.APT_CALL, HandlerType.APT_RESOURCE, HandlerType.APT_EVENT]

  async processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.APT_CALL:
        return this.processAptosFunctionCall(request)
      case HandlerType.APT_EVENT:
        return this.processAptosEvent(request)
      case HandlerType.APT_RESOURCE:
        return this.processAptosResource(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async processAptosEvent(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.aptEvent) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const promises: Promise<ProcessResult>[] = []
    const event = binding.data.aptEvent

    for (const handlerId of binding.handlerIds) {
      // only support aptos event for now
      promises.push(
        this.aptosEventHandlers[handlerId](event).catch((e) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing event: ' + JSON.stringify(event) + '\n' + errorString(e)
          )
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processAptosResource(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.aptResource) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Resource can't be empty")
    }
    const resource = binding.data.aptResource

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.aptosResourceHandlers[handlerId](resource).catch((e) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing resource: ' + JSON.stringify(resource) + '\n' + errorString(e)
          )
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processAptosFunctionCall(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.aptCall) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Call can't be empty")
    }
    const call = binding.data.aptCall

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      // only support aptos call for now
      const promise = this.aptosCallHandlers[handlerId](call).catch((e) => {
        throw new ServerError(Status.INTERNAL, 'error processing call: ' + JSON.stringify(call) + '\n' + errorString(e))
      })
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }
}

PluginManager.INSTANCE.register(new AptosPlugin())
