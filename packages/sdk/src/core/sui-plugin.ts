import { Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import { ContractConfig, DataBinding, HandlerType, ProcessConfigResponse, ProcessResult } from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'

import { CHAIN_IDS } from '../utils/chain'
import { SuiProcessorState } from './sui-processor'

export class SuiPlugin extends Plugin {
  name: string = 'SuiPlugin'

  configure(config: ProcessConfigResponse): void {
    for (const suiProcessor of SuiProcessorState.INSTANCE.getValues()) {
      const contractConfig: ContractConfig = {
        transactionConfig: [],
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

  supportedHandlers = []

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
