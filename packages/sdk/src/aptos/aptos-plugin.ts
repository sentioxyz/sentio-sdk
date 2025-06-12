import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  AccountConfig,
  ContractConfig,
  Data_AptCall,
  Data_AptResource,
  DataBinding,
  HandlerType,
  MoveCallHandlerConfig,
  MoveEventHandlerConfig,
  MoveOwnerType,
  ProcessConfigResponse,
  ProcessResult,
  ProcessStreamResponse_Partitions,
  ProcessStreamResponse_Partitions_Partition,
  ProcessStreamResponse_Partitions_Partition_SysValue,
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
import { AptEvent } from './data.js'

interface Handlers {
  aptosEventHandlers: ((event: AptEvent) => Promise<ProcessResult>)[]
  aptosCallHandlers: ((func: Data_AptCall) => Promise<ProcessResult>)[]
  aptosResourceHandlers: ((resourceWithVersion: Data_AptResource) => Promise<ProcessResult>)[]
  aptosTransactionIntervalHandlers: ((txn: Data_AptCall) => Promise<ProcessResult>)[]
}

export class AptosPlugin extends Plugin {
  name: string = 'AptosPlugin'
  handlers: Handlers = {
    aptosEventHandlers: [],
    aptosCallHandlers: [],
    aptosResourceHandlers: [],
    aptosTransactionIntervalHandlers: []
  }

  partitionHandlers: Record<number, (request: AptEvent) => Promise<string | undefined>> = {}

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

  async configure(config: ProcessConfigResponse) {
    const handlers: Handlers = {
      aptosTransactionIntervalHandlers: [],
      aptosEventHandlers: [],
      aptosCallHandlers: [],
      aptosResourceHandlers: []
    }
    for (const aptosProcessor of AptosProcessorState.INSTANCE.getValues()) {
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
        const handlerId = handlers.aptosEventHandlers.push(handler.handler) - 1
        if (handler.partitionHandler) {
          this.partitionHandlers[handlerId] = handler.partitionHandler
        }
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
        const handlerId = handlers.aptosCallHandlers.push(handler.handler) - 1
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
      const accountConfig = AccountConfig.fromPartial({
        address: aptosProcessor.config.address,
        chainId: aptosProcessor.getChainId(),
        startBlock: aptosProcessor.config.startVersion,
        endBlock: aptosProcessor.config.endVersion
      })
      for (const handler of aptosProcessor.resourceChangeHandlers) {
        const handlerId = handlers.aptosResourceHandlers.push(handler.handler) - 1
        accountConfig.moveResourceChangeConfigs.push({
          handlerId: handlerId,
          handlerName: handler.handlerName,
          type: handler.type,
          includeDeleted: false
        })
      }

      //  Prepare interval handlers
      for (const handler of aptosProcessor.transactionIntervalHandlers) {
        const handlerId = handlers.aptosTransactionIntervalHandlers.push(handler.handler) - 1
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
      const accountConfig = AccountConfig.fromPartial({
        address: aptosProcessor.config.address,
        chainId: aptosProcessor.getChainId(),
        startBlock: aptosProcessor.config.startVersion,
        endBlock: aptosProcessor.config.endVersion
      })
      for (const handler of aptosProcessor.resourceIntervalHandlers) {
        const handlerId = handlers.aptosResourceHandlers.push(handler.handler) - 1
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
    this.handlers = handlers
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
    switch (request.handlerType) {
      case HandlerType.APT_EVENT:
        const result: Record<number, ProcessStreamResponse_Partitions_Partition> = {}
        for (const handlerId of request.handlerIds) {
          const partitionHandler = this.partitionHandlers[handlerId]
          if (partitionHandler && request.data?.aptEvent) {
            const partitionValue = await partitionHandler(new AptEvent(request.data.aptEvent))
            result[handlerId] = {
              userValue: partitionValue
            }
          } else {
            result[handlerId] = {
              sysValue: ProcessStreamResponse_Partitions_Partition_SysValue.UNRECOGNIZED
            }
          }
        }
        return {
          partitions: result
        }

      case HandlerType.APT_RESOURCE:
      case HandlerType.APT_CALL:
        throw new ServerError(Status.INTERNAL, 'not implemented')
    }
    return {
      partitions: request.handlerIds.reduce(
        (acc, id) => ({
          ...acc,
          [id]: {
            sysValue: ProcessStreamResponse_Partitions_Partition_SysValue.UNRECOGNIZED
          }
        }),
        {}
      )
    }
  }

  async processAptosEvent(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data?.aptEvent) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const promises: Promise<ProcessResult>[] = []
    const event = new AptEvent(binding.data.aptEvent)

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.aptosEventHandlers[handlerId](event).catch((e) => {
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
    const resource = binding.data.aptResource

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.handlers.aptosResourceHandlers[handlerId](resource).catch((e) => {
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
    const call = binding.data.aptCall

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      // only support aptos call for now
      const promise = this.handlers.aptosCallHandlers[handlerId](call).catch((e) => {
        throw new ServerError(Status.INTERNAL, 'error processing call: ' + JSON.stringify(call) + '\n' + errorString(e))
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
