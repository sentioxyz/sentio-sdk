import { Plugin, PluginManager } from '@sentio/base'
import {
  ContractConfig,
  Data_SolInstruction,
  DataBinding,
  HandlerType,
  ProcessConfigResponse,
  ProcessResult,
} from '@sentio/protos'
import { mergeProcessResults, USER_PROCESSOR } from '@sentio/base'

import { ServerError, Status } from 'nice-grpc'

import { SolanaProcessorState } from './solana-processor'
import { Instruction as SolInstruction } from '@project-serum/anchor/dist/cjs/coder/borsh/instruction'

export class SolanaPlugin implements Plugin {
  name: string = 'SolanaPlugin'

  configure(config: ProcessConfigResponse): void {
    // Part 2, prepare solana constractors
    for (const solanaProcessor of SolanaProcessorState.INSTANCE.getValues()) {
      const contractConfig: ContractConfig = {
        processorType: USER_PROCESSOR,
        contract: {
          name: solanaProcessor.contractName,
          chainId: solanaProcessor.network,
          address: solanaProcessor.address,
          abi: '',
        },
        logConfigs: [],
        traceConfigs: [],
        intervalConfigs: [],
        startBlock: solanaProcessor.config.startSlot,
        endBlock: 0n,
        instructionConfig: {
          innerInstruction: solanaProcessor.processInnerInstruction,
          parsedInstruction: solanaProcessor.fromParsedInstruction !== null,
          rawDataInstruction: solanaProcessor.decodeInstruction !== null,
        },
        aptosEventConfigs: [],
        aptosCallConfigs: [],
      }
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

    const instruction = request.data.solInstruction || Data_SolInstruction.decode(request.data.raw) // JSON.parse(jsonString)
    const promises: Promise<ProcessResult>[] = []

    // Only have instruction handlers for solana processors
    for (const processor of SolanaProcessorState.INSTANCE.getValues()) {
      if (processor.address === instruction.programAccountId) {
        let parsedInstruction: SolInstruction | null = null
        if (instruction.parsed) {
          parsedInstruction = processor.getParsedInstruction(instruction.parsed as { type: string; info: any })
        } else if (instruction.instructionData) {
          parsedInstruction = processor.getParsedInstruction(instruction.instructionData)
        }
        if (parsedInstruction == null) {
          continue
        }
        const insHandler = processor.getInstructionHandler(parsedInstruction)
        if (insHandler == null) {
          continue
        }
        const res = await processor.handleInstruction(
          parsedInstruction,
          instruction.accounts,
          insHandler,
          instruction.slot
        )

        promises.push(Promise.resolve(res))
      }
    }
    return mergeProcessResults(await Promise.all(promises))
  }
}

PluginManager.INSTANCE.register(new SolanaPlugin())
