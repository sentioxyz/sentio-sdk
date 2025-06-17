import { errorString, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  AccountConfig,
  ContractConfig,
  Data_SuiCall,
  Data_SuiEvent,
  Data_SuiObject,
  Data_SuiObjectChange,
  DataBinding,
  HandlerType,
  MoveCallHandlerConfig,
  MoveEventHandlerConfig,
  MoveResourceChangeConfig,
  ProcessConfigResponse,
  ProcessResult,
  ProcessStreamResponse_Partitions,
  StartRequest
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'
import { PartitionHandlerManager } from '../core/index.js'

import { SuiProcessorState } from './sui-processor.js'
import { SuiAccountProcessorState, SuiAddressProcessor } from './sui-object-processor.js'
import { initCoinList } from './ext/coin.js'
import { SuiChainId } from '@sentio/chain'
import {
  SuiAccountProcessorTemplateState,
  SuiObjectOrAddressProcessorTemplate
} from './sui-object-processor-template.js'
import { SuiNetwork } from './network.js'
import { SuiContext } from './context.js'

interface Handlers {
  suiEventHandlers: ((event: Data_SuiEvent) => Promise<ProcessResult>)[]
  suiCallHandlers: ((func: Data_SuiCall) => Promise<ProcessResult>)[]
  suiObjectHandlers: ((object: Data_SuiObject) => Promise<ProcessResult>)[]
  suiObjectChangeHandlers: ((object: Data_SuiObjectChange) => Promise<ProcessResult>)[]
}

export class SuiPlugin extends Plugin {
  name: string = 'SuiPlugin'
  handlers: Handlers = {
    suiCallHandlers: [],
    suiEventHandlers: [],
    suiObjectHandlers: [],
    suiObjectChangeHandlers: []
  }

  partitionManager = new PartitionHandlerManager()
  async start(request: StartRequest): Promise<void> {
    await initCoinList()

    console.log('total instances:', request.templateInstances.length)
    const allowedChainIds = new Set<string>(Object.values(SuiChainId))
    for (const instance of request.templateInstances) {
      if (!allowedChainIds.has(instance.contract?.chainId || '')) {
        continue
      }

      console.log('start template instance', instance.templateId)
      const template: SuiObjectOrAddressProcessorTemplate<any, any, any> =
        SuiAccountProcessorTemplateState.INSTANCE.getValues()[instance.templateId]

      template.bind(
        {
          address: instance.contract?.address || '',
          objectId: instance.contract?.address || '',
          network: <SuiNetwork>instance.contract?.chainId || SuiNetwork.MAIN_NET,
          startCheckpoint: instance.startBlock || 0n,
          endCheckpoint: instance.endBlock || 0n,
          baseLabels: instance.baseLabels
        },
        NoopContext
      )
    }
  }

  async configure(config: ProcessConfigResponse) {
    const handlers: Handlers = {
      suiCallHandlers: [],
      suiEventHandlers: [],
      suiObjectHandlers: [],
      suiObjectChangeHandlers: []
    }
    for (const suiProcessor of SuiProcessorState.INSTANCE.getValues()) {
      const contractConfig = ContractConfig.fromPartial({
        transactionConfig: [],
        processorType: USER_PROCESSOR,
        contract: {
          name: suiProcessor.moduleName,
          chainId: suiProcessor.config.network,
          address: suiProcessor.config.address,
          abi: ''
        },
        startBlock: suiProcessor.config.startCheckpoint,
        endBlock: suiProcessor.config.endCheckpoint
      })
      for (const handler of suiProcessor.eventHandlers) {
        const handlerId = handlers.suiEventHandlers.push(handler.handler) - 1
        this.partitionManager.registerPartitionHandler(HandlerType.SUI_EVENT, handlerId, handler.partitionHandler)
        const eventHandlerConfig: MoveEventHandlerConfig = {
          filters: handler.filters.map((f) => {
            return {
              type: f.type,
              account: f.account || '',
              eventAccount: f.eventAccount || ''
            }
          }),
          fetchConfig: handler.fetchConfig,
          handlerId,
          handlerName: handler.handlerName
        }
        contractConfig.moveEventConfigs.push(eventHandlerConfig)
      }
      for (const handler of suiProcessor.callHandlers) {
        const handlerId = handlers.suiCallHandlers.push(handler.handler) - 1
        this.partitionManager.registerPartitionHandler(HandlerType.SUI_CALL, handlerId, handler.partitionHandler)
        const functionHandlerConfig: MoveCallHandlerConfig = {
          filters: handler.filters.map((filter) => {
            return {
              function: filter.function,
              typeArguments: filter.typeArguments || [],
              withTypeArguments: !!filter.typeArguments,
              includeFailed: filter.includeFailed || false,
              publicKeyPrefix: filter.publicKeyPrefix || '',
              fromAndToAddress: filter.fromAndToAddress
            }
          }),
          fetchConfig: handler.fetchConfig,
          handlerId,
          handlerName: handler.handlerName
        }
        contractConfig.moveCallConfigs.push(functionHandlerConfig)
      }
      // deprecated, use objectType processor instead
      for (const handler of suiProcessor.objectChangeHandlers) {
        const handlerId = handlers.suiObjectChangeHandlers.push(handler.handler) - 1
        const objectChangeHandler: MoveResourceChangeConfig = {
          type: handler.type,
          handlerId,
          handlerName: handler.handlerName,
          includeDeleted: false
        }
        contractConfig.moveResourceChangeConfigs.push(objectChangeHandler)
      }
      config.contractConfigs.push(contractConfig)
    }

    for (const processor of SuiAccountProcessorState.INSTANCE.getValues()) {
      const accountConfig = AccountConfig.fromPartial({
        address: processor.config.address,
        chainId: processor.getChainId(),
        startBlock: processor.config.startCheckpoint, // TODO maybe use another field
        endBlock: processor.config.endCheckpoint
      })

      for (const handler of processor.objectChangeHandlers) {
        const handlerId = handlers.suiObjectChangeHandlers.push(handler.handler) - 1
        const objectChangeHandler: MoveResourceChangeConfig = {
          type: handler.type,
          handlerId,
          handlerName: handler.handlerName,
          includeDeleted: false
        }
        accountConfig.moveResourceChangeConfigs.push(objectChangeHandler)
      }

      for (const handler of processor.objectHandlers) {
        const handlerId = handlers.suiObjectHandlers.push(handler.handler) - 1

        accountConfig.moveIntervalConfigs.push({
          intervalConfig: {
            handlerId: handlerId,
            handlerName: handler.handlerName,
            minutes: 0,
            minutesInterval: handler.timeIntervalInMinutes,
            slot: 0,
            slotInterval: handler.checkPointInterval,
            fetchConfig: undefined
          },
          type: handler.type || '',
          ownerType: processor.ownerType,
          resourceFetchConfig: handler.fetchConfig,
          fetchConfig: undefined
        })
      }

      if (processor instanceof SuiAddressProcessor) {
        for (const handler of processor.callHandlers) {
          const handlerId = handlers.suiCallHandlers.push(handler.handler) - 1
          const functionHandlerConfig: MoveCallHandlerConfig = {
            filters: handler.filters.map((filter) => {
              return {
                function: filter.function,
                typeArguments: filter.typeArguments || [],
                withTypeArguments: !!filter.typeArguments,
                includeFailed: filter.includeFailed || false,
                publicKeyPrefix: filter.publicKeyPrefix || '',
                fromAndToAddress: filter.fromAndToAddress
              }
            }),
            fetchConfig: handler.fetchConfig,
            handlerId,
            handlerName: handler.handlerName
          }
          accountConfig.moveCallConfigs.push(functionHandlerConfig)
        }
      }

      config.accountConfigs.push(accountConfig)
    }
    this.handlers = handlers
  }

  supportedHandlers = [
    HandlerType.SUI_EVENT,
    HandlerType.SUI_CALL,
    HandlerType.SUI_OBJECT,
    HandlerType.SUI_OBJECT_CHANGE
  ]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.SUI_EVENT:
        return this.processSuiEvent(request)
      case HandlerType.SUI_CALL:
        return this.processSuiFunctionCall(request)
      case HandlerType.SUI_OBJECT:
        return this.processSuiObject(request)
      case HandlerType.SUI_OBJECT_CHANGE:
        return this.processSuiObjectChange(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    let data: any
    switch (request.handlerType) {
      case HandlerType.SUI_EVENT:
        if (!request.data?.suiEvent) {
          throw new ServerError(Status.INVALID_ARGUMENT, "suiEvent can't be empty")
        }
        data = request.data.suiEvent
        break
      case HandlerType.SUI_CALL:
        if (!request.data?.suiCall) {
          throw new ServerError(Status.INVALID_ARGUMENT, "suiCall can't be empty")
        }
        data = request.data.suiCall
        break
      case HandlerType.SUI_OBJECT:
        if (!request.data?.suiObject) {
          throw new ServerError(Status.INVALID_ARGUMENT, "suiObject can't be empty")
        }
        data = request.data.suiObject
        break
      case HandlerType.SUI_OBJECT_CHANGE:
        if (!request.data?.suiObjectChange) {
          throw new ServerError(Status.INVALID_ARGUMENT, "suiObjectChange can't be empty")
        }
        data = request.data.suiObjectChange
        break
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
    const partitions = await this.partitionManager.processPartitionForHandlerType(
      request.handlerType,
      request.handlerIds,
      data
    )
    return {
      partitions
    }
  }

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

  async processSuiObjectChange(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.suiObjectChange) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Object change can't be empty")
    }
    const objectChange = binding.data.suiObjectChange

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.handlers.suiObjectChangeHandlers[handlerId](objectChange).catch((e) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing object change: ' + JSON.stringify(objectChange) + '\n' + errorString(e)
          )
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }
}

PluginManager.INSTANCE.register(new SuiPlugin())

const NoopContext = new SuiContext('', SuiChainId.SUI_MAINNET, '', new Date(), 0n, {} as any, 0, {})
