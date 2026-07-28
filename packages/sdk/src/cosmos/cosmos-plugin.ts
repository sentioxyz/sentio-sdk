import { errorString, GLOBAL_CONFIG, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfigSchema,
  CosmosLogHandlerConfigSchema,
  DataBinding,
  HandlerType,
  InitResponse,
  ProcessConfigResponse,
  ProcessResult,
  StartRequest
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { ConnectError, Code } from '@connectrpc/connect'
import { HandlerRegister } from '../core/handler-register.js'
import { CosmosProcessorState } from './types.js'

export class CosmosPlugin extends Plugin {
  name: string = 'CosmosPlugin'
  handlerRegister = new HandlerRegister()

  async init(config: InitResponse) {
    for (const aptosProcessor of CosmosProcessorState.INSTANCE.getValues()) {
      const chainId = aptosProcessor.config.chainId
      config.chainIds.push(chainId)
    }
  }

  async configure(config: ProcessConfigResponse, forChainId?: string) {
    this.handlerRegister.clear(forChainId as any)

    for (const processor of CosmosProcessorState.INSTANCE.getValues()) {
      const chainId = processor.config.chainId
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
      const contractConfig = create(ContractConfigSchema, {
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

        contractConfig.cosmosLogConfigs.push(
          create(CosmosLogHandlerConfigSchema, {
            handlerId,
            handlerName: callHandler.handlerName,
            logFilters: callHandler.logConfig?.logFilters || []
          })
        )
      }

      // Finish up a contract
      config.contractConfigs.push(contractConfig)
    }
  }

  supportedHandlers = [HandlerType.COSMOS_CALL]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.COSMOS_CALL:
        return this.processTransaction(request)
      default:
        throw new ConnectError('No handle type registered ' + request.handlerType, Code.InvalidArgument)
    }
  }

  async start(request: StartRequest) {}

  async processTransaction(binding: DataBinding): Promise<ProcessResult> {
    if (binding.data?.value.case !== 'cosmosCall' || !binding.data.value.value.transaction) {
      throw new ConnectError("transaction can't be null", Code.InvalidArgument)
    }
    const call = binding.data.value.value

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      const promise = this.handlerRegister
        .getHandlerById(
          binding.chainId,
          handlerId
        )(call)
        .catch((e) => {
          throw new ConnectError(
            'error processing transaction: ' + JSON.stringify(call.transaction) + '\n' + errorString(e),
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

PluginManager.INSTANCE.register(new CosmosPlugin())
