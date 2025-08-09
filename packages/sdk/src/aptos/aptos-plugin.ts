import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import { PartitionHandlerManager } from '../core/index.js'
import { HandlerRegister } from '../core/handler-register.js'
import {
  AccountConfig,
  ContractConfig,
  DataBinding,
  HandlerType,
  InitResponse,
  MoveCallHandlerConfig,
  MoveEventHandlerConfig,
  MoveOwnerType,
  ProcessConfigResponse,
  ProcessResult,
  ProcessStreamResponse_Partitions,
  StartRequest
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'

import { AptosProcessorState, AptosResourceProcessorState } from './aptos-processor.js'

import { initTokenList } from './ext/token.js'
import { AptosChainId } from '@sentio/chain'
import { AptosResourcesContext } from './context.js'
import {
  AptosResourceProcessorTemplate,
  AptosResourceProcessorTemplateState
} from './aptos-resource-processor-template.js'
import { AptosNetwork } from './network.js'
import { AptCall, AptEvent, AptResource } from './data.js'

export class AptosPlugin extends Plugin {
  name: string = 'AptosPlugin'
  handlerRegister = new HandlerRegister()
  partitionManager = new PartitionHandlerManager()

  async init(config: InitResponse) {
    for (const state of [AptosProcessorState.INSTANCE, AptosResourceProcessorState.INSTANCE]) {
      for (const aptosProcessor of state.getValues()) {
        config.chainIds.push(aptosProcessor.getChainId())
      }
    }
  }

  async start(request: StartRequest) {
    await initTokenList()

    const allowedChainIds = new Set<string>(Object.values(AptosChainId))
    for (const instance of request.templateInstances) {
      if (!allowedChainIds.has(instance.contract?.chainId || '')) {
        continue
      }

      const template: AptosResourceProcessorTemplate =
        AptosResourceProcessorTemplateState.INSTANCE.getValues()[instance.templateId]

      template.bind(
        {
          address: instance.contract?.address || '',
          network: <AptosNetwork>instance.contract?.chainId || AptosNetwork.MAIN_NET,
          startVersion: instance.startBlock || 0n,
          endVersion: instance.endBlock,
          baseLabels: instance.baseLabels
        },
        NoopContext
      )
    }
  }

  async configure(config: ProcessConfigResponse, forChainId?: string) {
    this.handlerRegister.clear(forChainId as any)
    for (const aptosProcessor of AptosProcessorState.INSTANCE.getValues()) {
      const chainId = aptosProcessor.getChainId()
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
      const contractConfig = ContractConfig.fromPartial({
        processorType: USER_PROCESSOR,
        contract: {
          name: aptosProcessor.moduleName,
          chainId: aptosProcessor.getChainId(),
          address: aptosProcessor.config.address,
          abi: ''
        },
        startBlock: aptosProcessor.config.startVersion,
        endBlock: aptosProcessor.config.endVersion
      })
      // 1. Prepare event handlers
      for (const handler of aptosProcessor.eventHandlers) {
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.APT_EVENT, handlerId, handler.partitionHandler)
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

      // 2. Prepare function handlers
      for (const handler of aptosProcessor.callHandlers) {
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.APT_CALL, handlerId, handler.partitionHandler)
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

      config.contractConfigs.push(contractConfig)
    }

    // Prepare resource handlers
    for (const aptosProcessor of AptosProcessorState.INSTANCE.getValues()) {
      const chainId = aptosProcessor.getChainId()
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
      const accountConfig = AccountConfig.fromPartial({
        address: aptosProcessor.config.address,
        chainId: aptosProcessor.getChainId(),
        startBlock: aptosProcessor.config.startVersion,
        endBlock: aptosProcessor.config.endVersion
      })
      for (const handler of aptosProcessor.resourceChangeHandlers) {
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.APT_RESOURCE, handlerId, handler.partitionHandler)
        accountConfig.moveResourceChangeConfigs.push({
          handlerId: handlerId,
          handlerName: handler.handlerName,
          type: handler.type,
          includeDeleted: false
        })
      }

      //  Prepare interval handlers
      for (const handler of aptosProcessor.transactionIntervalHandlers) {
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.APT_CALL, handlerId, handler.partitionHandler)
        accountConfig.moveIntervalConfigs.push({
          intervalConfig: {
            handlerId: handlerId,
            handlerName: handler.handlerName,
            minutes: 0,
            minutesInterval: handler.timeIntervalInMinutes,
            slot: 0,
            slotInterval: handler.versionInterval,
            fetchConfig: undefined
          },
          ownerType: MoveOwnerType.ADDRESS,
          fetchConfig: handler.fetchConfig,
          resourceFetchConfig: undefined,
          type: ''
        })
      }

      config.accountConfigs.push(accountConfig)
    }

    for (const aptosProcessor of AptosResourceProcessorState.INSTANCE.getValues()) {
      const chainId = aptosProcessor.getChainId()
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
      const accountConfig = AccountConfig.fromPartial({
        address: aptosProcessor.config.address,
        chainId: aptosProcessor.getChainId(),
        startBlock: aptosProcessor.config.startVersion,
        endBlock: aptosProcessor.config.endVersion
      })
      for (const handler of aptosProcessor.resourceIntervalHandlers) {
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.APT_RESOURCE, handlerId, handler.partitionHandler)
        if (handler.timeIntervalInMinutes || handler.versionInterval) {
          accountConfig.moveIntervalConfigs.push({
            intervalConfig: {
              handlerId: handlerId,
              handlerName: handler.handlerName,
              minutes: 0,
              minutesInterval: handler.timeIntervalInMinutes,
              slot: 0,
              slotInterval: handler.versionInterval,
              fetchConfig: undefined
            },
            type: handler.type || '',
            ownerType: MoveOwnerType.ADDRESS,
            resourceFetchConfig: handler.fetchConfig,
            fetchConfig: undefined
          })
        } else if (handler.type) {
          // on resource change
          accountConfig.moveResourceChangeConfigs.push({
            handlerId,
            handlerName: handler.handlerName,
            type: handler.type,
            includeDeleted: false
          })
        }
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

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    let data: any
    switch (request.handlerType) {
      case HandlerType.APT_EVENT:
        if (!request.data?.aptEvent) {
          throw new ServerError(Status.INVALID_ARGUMENT, "aptEvent can't be empty")
        }
        data = new AptEvent(request.data.aptEvent)
        break
      case HandlerType.APT_CALL:
        if (!request.data?.aptCall) {
          throw new ServerError(Status.INVALID_ARGUMENT, "aptCall can't be empty")
        }
        data = new AptCall(request.data.aptCall)
        break
      case HandlerType.APT_RESOURCE:
        if (!request.data?.aptResource) {
          throw new ServerError(Status.INVALID_ARGUMENT, "aptResource can't be empty")
        }
        data = new AptResource(request.data.aptResource)
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

  async processAptosEvent(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.aptEvent) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const promises: Promise<ProcessResult>[] = []
    const event = new AptEvent(binding.data.aptEvent)

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(event)
        .catch((e: any) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing event: ' + JSON.stringify(event) + '\n' + errorString(e)
          )
        })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processAptosResource(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.aptResource) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Resource can't be empty")
    }
    const resource = new AptResource(binding.data.aptResource)

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(resource)
        .catch((e: any) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing resource: ' + JSON.stringify(resource) + '\n' + errorString(e)
          )
        })
      if (GLOBAL_CONFIG.execution.sequential) {
        await promise
      }
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processAptosFunctionCall(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.aptCall) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Call can't be empty")
    }
    const call = new AptCall(binding.data.aptCall)

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      // only support aptos call for now
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(call)
        .catch((e: any) => {
          throw new ServerError(
            Status.INTERNAL,
            'error processing call: ' + JSON.stringify(call) + '\n' + errorString(e)
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

PluginManager.INSTANCE.register(new AptosPlugin())

const NoopContext = new AptosResourcesContext(AptosChainId.APTOS_MAINNET, '', 0n, 1, {})
