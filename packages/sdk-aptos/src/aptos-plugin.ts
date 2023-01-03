import { Plugin, PluginManager } from '@sentio/runtime'
import {
  AccountConfig,
  AptosCallHandlerConfig,
  AptosEventHandlerConfig,
  ContractConfig,
  Data_AptCall,
  Data_AptEvent,
  Data_AptResource,
  DataBinding,
  HandlerType,
  ProcessConfigResponse,
  ProcessResult,
} from '@sentio/protos'

import { errorString, mergeProcessResults, USER_PROCESSOR } from '@sentio/runtime'

import { ServerError, Status } from 'nice-grpc'

import { AptosAccountProcessorState, AptosProcessorState } from './aptos-processor'

export class AptosPlugin extends Plugin {
  name: string = 'AptosPlugin'

  private aptosEventHandlers: ((event: Data_AptEvent) => Promise<ProcessResult>)[] = []
  private aptosCallHandlers: ((func: Data_AptCall) => Promise<ProcessResult>)[] = []
  private aptosResourceHandlers: ((resourceWithVersion: Data_AptResource) => Promise<ProcessResult>)[] = []

  configure(config: ProcessConfigResponse): void {
    for (const aptosProcessor of AptosProcessorState.INSTANCE.getValues()) {
      const contractConfig: ContractConfig = {
        processorType: USER_PROCESSOR,
        contract: {
          name: aptosProcessor.moduleName,
          chainId: aptosProcessor.getChainId(),
          address: aptosProcessor.config.address,
          abi: '',
        },
        intervalConfigs: [],
        logConfigs: [],
        traceConfigs: [],
        startBlock: aptosProcessor.config.startVersion,
        endBlock: 0n,
        instructionConfig: undefined,
        aptosEventConfigs: [],
        aptosCallConfigs: [],
      }
      // 1. Prepare event handlers
      for (const handler of aptosProcessor.eventHandlers) {
        const handlerId = this.aptosEventHandlers.push(handler.handler) - 1
        const eventHandlerConfig: AptosEventHandlerConfig = {
          filters: handler.filters.map((f) => {
            return {
              type: f.type,
              account: f.account || '',
            }
          }),
          handlerId,
        }
        contractConfig.aptosEventConfigs.push(eventHandlerConfig)
      }

      // 2. Prepare function handlers
      for (const handler of aptosProcessor.callHandlers) {
        const handlerId = this.aptosCallHandlers.push(handler.handler) - 1
        const functionHandlerConfig: AptosCallHandlerConfig = {
          filters: handler.filters.map((filter) => {
            return {
              function: filter.function,
              typeArguments: filter.typeArguments || [],
              withTypeArguments: !!filter.typeArguments,
              includeFailed: filter.includeFailed || false,
            }
          }),
          handlerId,
        }
        contractConfig.aptosCallConfigs.push(functionHandlerConfig)
      }
      config.contractConfigs.push(contractConfig)
    }

    for (const aptosProcessor of AptosAccountProcessorState.INSTANCE.getValues()) {
      const accountConfig: AccountConfig = {
        address: aptosProcessor.config.address,
        chainId: aptosProcessor.getChainId(),
        startBlock: aptosProcessor.config.startVersion,
        aptosIntervalConfigs: [],
        intervalConfigs: [],
        logConfigs: [],
      }
      for (const handler of aptosProcessor.resourcesHandlers) {
        const handlerId = this.aptosResourceHandlers.push(handler.handler) - 1
        accountConfig.aptosIntervalConfigs.push({
          intervalConfig: {
            handlerId: handlerId,
            minutes: 0,
            minutesInterval: handler.timeIntervalInMinutes,
            slot: 0,
            slotInterval: handler.versionInterval,
          },
          type: handler.type || '',
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
            'error processing event: ' + JSON.stringify(resource) + '\n' + errorString(e)
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
