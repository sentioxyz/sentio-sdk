import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import { PartitionHandlerManager } from '../core/index.js'
import { HandlerRegister } from '../core/handler-register.js'
import {
  AccountConfigSchema,
  ContractConfigSchema,
  type DataBinding,
  HandlerType,
  type InitResponse,
  type MoveCallHandlerConfig,
  MoveCallHandlerConfigSchema,
  type MoveEventHandlerConfig,
  MoveEventHandlerConfigSchema,
  MoveOnIntervalConfigSchema,
  MoveOwnerType,
  MoveResourceChangeConfigSchema,
  type ProcessConfigResponse,
  type ProcessResult,
  type ProcessStreamResponse_Partitions,
  ProcessStreamResponse_PartitionsSchema,
  type StartRequest
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'

import { ConnectError, Code } from '@connectrpc/connect'

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

      template.startInstance(
        {
          address: instance.contract?.address || '',
          network: <AptosNetwork>instance.contract?.chainId || AptosNetwork.MAIN_NET,
          startVersion: instance.startBlock || 0n,
          endVersion: instance.endBlock,
          baseLabels: instance.baseLabels as { [key: string]: string } | undefined
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
      const contractConfig = create(ContractConfigSchema, {
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
        const eventHandlerConfig: MoveEventHandlerConfig = create(MoveEventHandlerConfigSchema, {
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
        })
        contractConfig.moveEventConfigs.push(eventHandlerConfig)
      }

      // 2. Prepare function handlers
      for (const handler of aptosProcessor.callHandlers) {
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.APT_CALL, handlerId, handler.partitionHandler)
        const functionHandlerConfig: MoveCallHandlerConfig = create(MoveCallHandlerConfigSchema, {
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
        })
        contractConfig.moveCallConfigs.push(functionHandlerConfig)
      }

      // 3. Prepare onInterval handlers
      for (const handler of aptosProcessor.transactionIntervalHandlers) {
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.APT_CALL, handlerId, handler.partitionHandler)
        contractConfig.moveIntervalConfigs.push(
          create(MoveOnIntervalConfigSchema, {
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
        )
      }

      config.contractConfigs.push(contractConfig)
    }

    // Prepare resource change handlers
    for (const aptosProcessor of AptosProcessorState.INSTANCE.getValues()) {
      const chainId = aptosProcessor.getChainId()
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
      const accountConfig = create(AccountConfigSchema, {
        address: aptosProcessor.config.address,
        chainId: aptosProcessor.getChainId(),
        startBlock: aptosProcessor.config.startVersion,
        endBlock: aptosProcessor.config.endVersion
      })
      for (const handler of aptosProcessor.resourceChangeHandlers) {
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.APT_RESOURCE, handlerId, handler.partitionHandler)
        accountConfig.moveResourceChangeConfigs.push(
          create(MoveResourceChangeConfigSchema, {
            handlerId: handlerId,
            handlerName: handler.handlerName,
            types: typeof handler.type === 'string' ? [handler.type] : handler.type,
            includeDeleted: false
          })
        )
      }

      config.accountConfigs.push(accountConfig)
    }

    for (const aptosProcessor of AptosResourceProcessorState.INSTANCE.getValues()) {
      const chainId = aptosProcessor.getChainId()
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
      const accountConfig = create(AccountConfigSchema, {
        address: aptosProcessor.config.address,
        chainId: aptosProcessor.getChainId(),
        startBlock: aptosProcessor.config.startVersion,
        endBlock: aptosProcessor.config.endVersion
      })
      for (const handler of aptosProcessor.resourceIntervalHandlers) {
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
        this.partitionManager.registerPartitionHandler(HandlerType.APT_RESOURCE, handlerId, handler.partitionHandler)
        if (handler.timeIntervalInMinutes || handler.versionInterval) {
          accountConfig.moveIntervalConfigs.push(
            create(MoveOnIntervalConfigSchema, {
              intervalConfig: {
                handlerId: handlerId,
                handlerName: handler.handlerName,
                minutes: 0,
                minutesInterval: handler.timeIntervalInMinutes,
                slot: 0,
                slotInterval: handler.versionInterval,
                fetchConfig: undefined
              },
              type: (Array.isArray(handler.type) ? handler.type[0] : handler.type) || '',
              ownerType: MoveOwnerType.ADDRESS,
              resourceFetchConfig: handler.fetchConfig,
              fetchConfig: undefined
            })
          )
        } else if (handler.type) {
          // on resource change
          accountConfig.moveResourceChangeConfigs.push(
            create(MoveResourceChangeConfigSchema, {
              handlerId,
              handlerName: handler.handlerName,
              types: typeof handler.type == 'string' ? [handler.type] : handler.type,
              includeDeleted: false
            })
          )
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
        throw new ConnectError('No handle type registered ' + request.handlerType, Code.InvalidArgument)
    }
  }

  async partition(request: DataBinding): Promise<ProcessStreamResponse_Partitions> {
    let data: any
    switch (request.handlerType) {
      case HandlerType.APT_EVENT:
        if (request.data?.value.case !== 'aptEvent') {
          throw new ConnectError("aptEvent can't be empty", Code.InvalidArgument)
        }
        data = new AptEvent(request.data.value.value)
        break
      case HandlerType.APT_CALL:
        if (request.data?.value.case !== 'aptCall') {
          throw new ConnectError("aptCall can't be empty", Code.InvalidArgument)
        }
        data = new AptCall(request.data.value.value)
        break
      case HandlerType.APT_RESOURCE:
        if (request.data?.value.case !== 'aptResource') {
          throw new ConnectError("aptResource can't be empty", Code.InvalidArgument)
        }
        data = new AptResource(request.data.value.value)
        break
      default:
        throw new ConnectError('No handle type registered ' + request.handlerType, Code.InvalidArgument)
    }
    const partitions = await this.partitionManager.processPartitionForHandlerType(
      request.handlerType,
      request.handlerIds,
      data
    )
    return create(ProcessStreamResponse_PartitionsSchema, {
      partitions
    })
  }

  async processAptosEvent(binding: DataBinding): Promise<ProcessResult> {
    if (binding.data?.value.case !== 'aptEvent') {
      throw new ConnectError("Event can't be empty", Code.InvalidArgument)
    }
    const promises: Promise<ProcessResult>[] = []
    const event = new AptEvent(binding.data.value.value)

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(event)
        .catch((e: any) => {
          throw new ConnectError(
            'error processing event: ' + JSON.stringify(event) + '\n' + errorString(e),
            Code.Internal
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
    if (binding.data?.value.case !== 'aptResource') {
      throw new ConnectError("Resource can't be empty", Code.InvalidArgument)
    }
    const resource = new AptResource(binding.data.value.value)

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(resource)
        .catch((e: any) => {
          throw new ConnectError(
            'error processing resource: ' + JSON.stringify(resource) + '\n' + errorString(e),
            Code.Internal
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
    if (binding.data?.value.case !== 'aptCall') {
      throw new ConnectError("Call can't be empty", Code.InvalidArgument)
    }
    const call = new AptCall(binding.data.value.value)

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      // only support aptos call for now
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(call)
        .catch((e: any) => {
          throw new ConnectError(
            'error processing call: ' + JSON.stringify(call) + '\n' + errorString(e),
            Code.Internal
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
