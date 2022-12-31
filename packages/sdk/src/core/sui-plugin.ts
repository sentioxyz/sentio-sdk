import { Plugin, PluginManager } from '@sentio/base'
import { ContractConfig, DataBinding, HandlerType, ProcessConfigResponse, ProcessResult } from '@sentio/protos'

import { USER_PROCESSOR } from '../service'

import { ServerError, Status } from 'nice-grpc'

import { CHAIN_IDS } from '../utils/chain'
import { SuiProcessorState } from './sui-processor'

export class SuiPlugin implements Plugin {
  name: string = 'SolanaPlugin'

  configure(config: ProcessConfigResponse): void {
    for (const suiProcessor of SuiProcessorState.INSTANCE.getValues()) {
      const contractConfig: ContractConfig = {
        processorType: USER_PROCESSOR,
        contract: {
          name: 'sui contract',
          chainId: CHAIN_IDS.SUI_DEVNET,
          address: suiProcessor.address,
          abi: '',
        },
        logConfigs: [],
        intervalConfigs: [],
        traceConfigs: [],
        startBlock: suiProcessor.config.startSeqNumber,
        endBlock: 0n,
        instructionConfig: undefined,
        aptosEventConfigs: [],
        aptosCallConfigs: [],
      }
      config.contractConfigs.push(contractConfig)
    }
  }

  supportedHandlers = [HandlerType.SUI_TRANSACTION]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.SUI_TRANSACTION:
      // return this.processSolInstruction(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }
}

PluginManager.INSTANCE.register(new SuiPlugin())
