import { errorString, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfig,
  DataBinding,
  HandlerType,
  InitResponse,
  ProcessConfigResponse,
  ProcessResult
} from '@sentio/protos'

import { ServerError, Status } from 'nice-grpc'

import { SolanaProcessorState } from './solana-processor.js'
import { Instruction as SolInstruction } from '@coral-xyz/anchor'

export class SolanaPlugin extends Plugin {
  name: string = 'SolanaPlugin'

  async init(config: InitResponse) {
    for (const solanaProcessor of SolanaProcessorState.INSTANCE.getValues()) {
      const chainId = solanaProcessor.network
      config.chainIds.push(chainId)
    }
  }

  async configure(config: ProcessConfigResponse, forChainId?: string) {
    // Part 2, prepare solana constractors
    for (const solanaProcessor of SolanaProcessorState.INSTANCE.getValues()) {
      const chainId = solanaProcessor.network
      if (forChainId !== undefined && forChainId !== chainId.toString()) {
        continue
      }
      const contractConfig = ContractConfig.fromPartial({
        processorType: USER_PROCESSOR,
        contract: {
          name: solanaProcessor.contractName,
          chainId: solanaProcessor.network,
          address: solanaProcessor.address,
          abi: ''
        },
        startBlock: solanaProcessor.config.startSlot,
        instructionConfig: {
          innerInstruction: solanaProcessor.processInnerInstruction,
          parsedInstruction: solanaProcessor.fromParsedInstruction !== null,
          rawDataInstruction: solanaProcessor.decodeInstruction !== null
        }
      })
      config.contractConfigs.push(contractConfig)
    }
  }

  supportedHandlers = [HandlerType.SOL_INSTRUCTION]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.SOL_INSTRUCTION:
        return this.processSolInstruction(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async processSolInstruction(request: DataBinding): Promise<ProcessResult> {
    if (!request.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, 'instruction data cannot be empty')
    }
    if (!request.data.solInstruction) {
      throw new ServerError(Status.INVALID_ARGUMENT, 'instruction data cannot be empty')
    }

    const instruction = request.data.solInstruction
    const promises: Promise<ProcessResult>[] = []

    // Only have instruction handlers for solana processors
    for (const processor of SolanaProcessorState.INSTANCE.getValues()) {
      if (processor.address === instruction.programAccountId) {
        let parsedInstruction: SolInstruction | null = null

        try {
          if (instruction.parsed) {
            parsedInstruction = processor.getParsedInstruction(instruction.parsed as { type: string; info: any })
          } else if (instruction.instructionData) {
            parsedInstruction = processor.getParsedInstruction(instruction.instructionData)
          }
        } catch (e) {
          throw new ServerError(
            Status.INTERNAL,
            'Failed to decode instruction: ' + JSON.stringify(instruction) + errorString(e)
          )
        }
        if (parsedInstruction == null) {
          continue
        }
        const insHandler = processor.getInstructionHandler(parsedInstruction)
        if (insHandler == null) {
          continue
        }
        const res = processor
          .handleInstruction(parsedInstruction, instruction.accounts, insHandler, instruction.slot)
          .catch((e) => {
            throw new ServerError(
              Status.INTERNAL,
              'Error processing instruction: ' + JSON.stringify(instruction) + '\n' + errorString(e)
            )
          })

        promises.push(res)
      }
    }
    return mergeProcessResults(await Promise.all(promises))
  }
}

PluginManager.INSTANCE.register(new SolanaPlugin())
