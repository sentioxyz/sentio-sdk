import { USER_PROCESSOR } from '@sentio/runtime'
import {
  AccountConfig,
  ContractConfig,
  HandlerType,
  InitResponse,
  MoveCallHandlerConfig,
  MoveEventHandlerConfig,
  MoveResourceChangeConfig,
  ProcessConfigResponse,
  StartRequest
} from '@sentio/protos'

import { PartitionHandlerManager } from '../core/index.js'
import { HandlerRegister } from '../core/handler-register.js'

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

export class SuiPluginPart {
  constructor(
    private handlerRegister: HandlerRegister,
    private partitionManager: PartitionHandlerManager
  ) {}

  async start(request: StartRequest): Promise<void> {
    await initCoinList()

    console.log('total instances:', request.templateInstances.length)
    const allowedChainIds = new Set<string>([SuiChainId.SUI_MAINNET, SuiChainId.SUI_TESTNET])
    for (const instance of request.templateInstances) {
      if (!allowedChainIds.has(instance.contract?.chainId || '')) {
        continue
      }

      console.log('start template instance', instance.templateId)
      const template: SuiObjectOrAddressProcessorTemplate<any, any, any> =
        SuiAccountProcessorTemplateState.INSTANCE.getValues()[instance.templateId]

      template.startInstance(
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

  async init(config: InitResponse) {
    for (const state of [SuiProcessorState.INSTANCE, SuiAccountProcessorState.INSTANCE]) {
      for (const suiProcessor of state.getValues()) {
        config.chainIds.push(suiProcessor.config.network)
      }
    }
  }

  async configure(config: ProcessConfigResponse, forChainId?: string) {
    // this.handlerRegister.clear(forChainId as any)

    for (const suiProcessor of SuiProcessorState.INSTANCE.getValues()) {
      const chainId = suiProcessor.config.network
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
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
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
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
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
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
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
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
      const chainId = processor.getChainId()
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
      const accountConfig = AccountConfig.fromPartial({
        address: processor.config.address,
        chainId: processor.getChainId(),
        startBlock: processor.config.startCheckpoint, // TODO maybe use another field
        endBlock: processor.config.endCheckpoint
      })

      for (const handler of processor.objectChangeHandlers) {
        const handlerId = this.handlerRegister.register(handler.handler, chainId)
        const objectChangeHandler: MoveResourceChangeConfig = {
          type: handler.type,
          handlerId,
          handlerName: handler.handlerName,
          includeDeleted: false
        }
        accountConfig.moveResourceChangeConfigs.push(objectChangeHandler)
      }

      for (const handler of processor.objectHandlers) {
        const handlerId = this.handlerRegister.register(handler.handler, chainId)

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
          const handlerId = this.handlerRegister.register(handler.handler, chainId)
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
  }
}

const NoopContext = new SuiContext('', SuiChainId.SUI_MAINNET, '', new Date(), 0n, {} as any, 0, {})
