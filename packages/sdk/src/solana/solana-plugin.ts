import { errorString, mergeProcessResults, Plugin, PluginManager, USER_PROCESSOR } from '@sentio/runtime'
import {
  ContractConfigSchema,
  DataBinding,
  HandlerType,
  InitResponse,
  InstructionHandlerConfigSchema,
  OnIntervalConfigSchema,
  ProcessConfigResponse,
  ProcessResult
} from '@sentio/protos'
import { create } from '@bufbuild/protobuf'
import { ConnectError, Code } from '@connectrpc/connect'

import { SolanaProcessorState } from './solana-processor.js'
import { Instruction as SolInstruction } from '@anchor-lang/core'

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

      const contractConfig = create(ContractConfigSchema, {
        processorType: USER_PROCESSOR,
        contract: {
          name: solanaProcessor.contractName,
          chainId: solanaProcessor.network,
          address: solanaProcessor.address,
          abi: ''
        },
        startBlock: solanaProcessor.config.startSlot
      })
      if (solanaProcessor.address && solanaProcessor.address != '*') {
        let fetchTx = false
        for (const fetchConfig of solanaProcessor.instructionHandlerMap.values()) {
          if (fetchConfig.handlerOptions?.fetchTx) {
            fetchTx = true
            break
          }
        }
        contractConfig.instructionConfig = create(InstructionHandlerConfigSchema, {
          innerInstruction: solanaProcessor.processInnerInstruction,
          parsedInstruction: solanaProcessor.fromParsedInstruction !== null,
          rawDataInstruction: solanaProcessor.decodeInstruction !== null,
          fetchTx: fetchTx
        })
      }

      for (const [idx, handler] of solanaProcessor.blockHandlers.entries()) {
        contractConfig.intervalConfigs.push(
          create(OnIntervalConfigSchema, {
            handlerId: idx,
            minutesInterval: handler.timeIntervalInMinutes,
            slotInterval: handler.slotInterval,
            handlerName: handler.handlerName
          })
        )
      }

      config.contractConfigs.push(contractConfig)
    }
  }

  supportedHandlers = [HandlerType.SOL_INSTRUCTION, HandlerType.SOL_BLOCK]

  processBinding(request: DataBinding): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.SOL_INSTRUCTION:
        return this.processSolInstruction(request)
      case HandlerType.SOL_BLOCK:
        return this.processSolBlock(request)
      default:
        throw new ConnectError('No handle type registered ' + request.handlerType, Code.InvalidArgument)
    }
  }

  async processSolInstruction(request: DataBinding): Promise<ProcessResult> {
    if (!request.data) {
      throw new ConnectError('instruction data cannot be empty', Code.InvalidArgument)
    }
    if (request.data.value.case !== 'solInstruction') {
      throw new ConnectError('instruction data cannot be empty', Code.InvalidArgument)
    }

    const instruction = request.data.value.value
    const promises: Promise<ProcessResult>[] = []

    // Only have instruction handlers for solana processors
    for (const processor of SolanaProcessorState.INSTANCE.getValues()) {
      if (processor.address === instruction.programAccountId || processor.address === '*') {
        let parsedInstruction: SolInstruction | null = null

        try {
          if (instruction.rawParsed) {
            parsedInstruction = processor.getParsedInstruction(
              JSON.parse(instruction.rawParsed) as { type: string; info: any }
            )
          } else if (instruction.instructionData) {
            parsedInstruction = processor.getParsedInstruction(instruction.instructionData)
          }
        } catch (e) {
          throw new ConnectError(
            'Failed to decode instruction: ' + JSON.stringify(instruction) + errorString(e),
            Code.Internal
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
          .handleInstruction(parsedInstruction, instruction.accounts, insHandler, instruction)
          .catch((e) => {
            throw new ConnectError(
              'Error processing instruction: ' + JSON.stringify(instruction) + '\n' + errorString(e),
              Code.Internal
            )
          })

        promises.push(res)
      }
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processSolBlock(request: DataBinding): Promise<ProcessResult> {
    if (request.data?.value.case !== 'solBlock') {
      throw new ConnectError('block data cannot be empty', Code.InvalidArgument)
    }
    const block = request.data.value.value
    const promises: Promise<ProcessResult>[] = []
    for (const processor of SolanaProcessorState.INSTANCE.getValues()) {
      for (const handlerId of request.handlerIds) {
        const handler = processor.blockHandlers[handlerId]
        if (handler) {
          promises.push(processor.handleBlock(block, handler))
        }
      }
    }
    return mergeProcessResults(await Promise.all(promises))
  }
}

PluginManager.INSTANCE.register(new SolanaPlugin())
