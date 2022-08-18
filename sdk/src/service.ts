import { Block, Log } from '@ethersproject/abstract-provider'
import { CallContext, ServerError, Status } from 'nice-grpc'

import {
  HandlerCondition,
  ContractConfig,
  LogHandlerConfig,
  O11yResult,
  ProcessBlockRequest,
  ProcessBlockResponse,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessLogRequest,
  ProcessLogResponse,
  ProcessorServiceImplementation,
  ProcessTransactionRequest,
  ProcessTransactionResponse,
  ProcessInstructionResponse,
  ProcessInstructionRequest,
  TemplateInstance,
  StartRequest,
} from './gen/processor/protos/processor'

import { DeepPartial } from './gen/builtin'
import { Empty } from './gen/google/protobuf/empty'
import Long from 'long'
import { Instruction } from '@project-serum/anchor'

const MAX_BLOCK = new Long(0)

export class ProcessorServiceImpl implements ProcessorServiceImplementation {
  private eventHandlers: ((event: Log) => Promise<O11yResult>)[] = []
  private blockHandlers = new Map<string, ((block: Block) => Promise<O11yResult>)[]>()

  private started = false
  private contractConfigs: ContractConfig[]
  private templateInstances: TemplateInstance[]

  private readonly shutdownHandler?: () => void

  constructor(shutdownHandler?: () => void) {
    this.shutdownHandler = shutdownHandler
  }

  async getConfig(request: ProcessConfigRequest, context: CallContext): Promise<DeepPartial<ProcessConfigResponse>> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }
    return {
      // TODO project setting
      contractConfigs: this.contractConfigs,
      templateInstances: this.templateInstances,
    }
  }

  async configure() {
    this.eventHandlers = []
    this.templateInstances = []
    // copy without reference array
    this.blockHandlers.clear()
    this.contractConfigs = []

    if (globalThis.TemplatesInstances) {
      this.templateInstances = [...globalThis.TemplatesInstances]
    }

    if (globalThis.Processors) {
      for (const processor of globalThis.Processors) {
        // If server favor incremental update this need to change
        // Start basic config for contract
        const chainId = await processor.getChainId()
        const contractConfig: ContractConfig = {
          contract: {
            name: processor.config.name,
            chainId: chainId,
            address: processor.contract._underlineContract.address,
            abi: '',
          },
          blockConfig: {
            numHandlers: processor.blockHandlers.length,
          },
          logConfigs: [],
          startBlock: processor.config.startBlock,
          endBlock: MAX_BLOCK,
          instructionConfig: undefined,
        }
        if (processor.config.endBlock) {
          contractConfig.endBlock = processor.config.endBlock
        }

        // Prepare all the event handlers
        for (const eventsHandler of processor.eventHandlers) {
          // associate id with filter
          const handlerId = this.eventHandlers.push(eventsHandler.handler) - 1
          const logConfig: LogHandlerConfig = {
            handlerId: handlerId,
            conditions: [],
          }

          for (const filter of eventsHandler.filters) {
            if (!filter.topics) {
              throw new ServerError(Status.INVALID_ARGUMENT, 'Topic should not be null')
            }
            const condition: HandlerCondition = {
              topics: [],
            }

            for (const ts of filter.topics) {
              let hashes: string[] = []
              if (Array.isArray(ts)) {
                hashes = hashes.concat(ts)
              } else if (ts) {
                hashes.push(ts)
              }
              condition.topics.push({ hashes: hashes })
            }
            logConfig.conditions.push(condition)
          }
          contractConfig.logConfigs.push(logConfig)
        }

        // Prepare all the block handlers
        let handlersForChain = this.blockHandlers.get(chainId)
        if (handlersForChain === undefined) {
          handlersForChain = []
          this.blockHandlers.set(chainId, handlersForChain)
        }
        for (const blockHandler of processor.blockHandlers) {
          handlersForChain.push(blockHandler)
        }

        // Finish up a contract
        this.contractConfigs.push(contractConfig)
      }
    }

    if (globalThis.SolanaProcessors) {
      for (const solanaProcessor of globalThis.SolanaProcessors) {
        const contractConfig: ContractConfig = {
          contract: {
            name: solanaProcessor.contractName,
            chainId: 'SOL:mainnet', // TODO set in processor
            address: solanaProcessor.address,
            abi: '',
          },
          blockConfig: undefined,
          logConfigs: [],
          startBlock: solanaProcessor.config.startSlot,
          endBlock: MAX_BLOCK,
          instructionConfig: {
            processInnerInstruction: solanaProcessor.processInnerInstruction,
          }
        }
        this.contractConfigs.push(contractConfig)
      }
    }
  }

  async start(request: StartRequest, context: CallContext): Promise<DeepPartial<Empty>> {
    if (this.started) {
      return {}
    }
    for (const instance of request.templateInstances) {
      const template = globalThis.Templates[instance.templateId]
      if (!template) {
        throw new ServerError(Status.INVALID_ARGUMENT, 'Invalid template contract:' + instance)
      }
      if (!instance.contract) {
        throw new ServerError(Status.INVALID_ARGUMENT, 'Contract Empty from:' + instance)
      }
      template.bind({
        name: instance.contract.name,
        address: instance.contract.address,
        network: Number(instance.contract.chainId),
        startBlock: instance.startBlock,
        endBlock: instance.endBlock,
      })
    }
    await this.configure()
    this.started = true
    return {}
  }
  async stop(request: Empty, context: CallContext): Promise<DeepPartial<Empty>> {
    console.log('Server Shutting down in 5 seconds')
    if (this.shutdownHandler) {
      setTimeout(this.shutdownHandler, 5000)
    }
    return {}
  }
  async processLog(request: ProcessLogRequest, context: CallContext): Promise<DeepPartial<ProcessLogResponse>> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const resp: O11yResult = {
      histograms: [],
      counters: [],
    }

    for (const l of request.logs) {
      if (!l.log) {
        throw new ServerError(Status.INVALID_ARGUMENT, "Log can't be null")
      }
      // const jsonString = Buffer.from(l.log.raw.buffer).toString("utf-8")
      // const jsonString = String.fromCharCode.apply(null, l.log.raw)
      const jsonString = Utf8ArrayToStr(l.log.raw)
      const log: Log = JSON.parse(jsonString)
      try {
        const res = await this.eventHandlers[l.handlerId](log)
        resp.counters = resp.counters.concat(res.counters)
        resp.histograms = resp.histograms.concat(res.histograms)
      } catch (e) {
        throw new ServerError(Status.INTERNAL, e)
      }
    }

    let updated = false
    if (global.TemplatesInstances && this.templateInstances.length != global.TemplatesInstances.length) {
      await this.configure()
      updated = true
    }
    return {
      result: resp,
      configUpdated: updated,
    }
  }

  async processTransaction(
    request: ProcessTransactionRequest,
    context: CallContext
  ): Promise<DeepPartial<ProcessTransactionResponse>> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service not started.')
    }

    throw new ServerError(Status.UNIMPLEMENTED, 'Processing transaction is not suppored.')
  }

  async processInstruction(
    request: ProcessInstructionRequest,
    context: CallContext
  ): Promise<ProcessInstructionResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service not started.')
    }

    const result: O11yResult = {
      histograms: [],
      counters: [],
    }

    // Only have instruction handlers for solana processors
    if (globalThis.SolanaProcessors) {
      for (const instruction of request.instructions) {
        if (!instruction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'instruction cannot be null')
        }

        for (const processor of globalThis.SolanaProcessors) {
          if (processor.address === instruction.programAccountId) {
            let decodedIns: Instruction | null
            if (instruction.parsed) {
              decodedIns = processor.fromParsedInstruction(JSON.parse(instruction.parsed.toString()))
            } else {
              decodedIns = processor.decodeInstruction(instruction.instructionData)
            }
            if (decodedIns) {
              const handler = processor.instructionHanlderMap.get(decodedIns.name)
              if (handler !== undefined) {
                try {
                  const res = await handler(decodedIns)
                  res.histograms.forEach((h) => {
                    if (h.metadata) {
                      h.metadata.blockNumber = instruction.slot
                    }
                    result.histograms.push(h)
                  })
                  res.counters.forEach((c) => {
                    if (c.metadata) {
                      c.metadata.blockNumber = instruction.slot
                    }
                    result.counters.push(c)
                  })
                } catch (e) {
                  throw new ServerError(Status.INTERNAL, e)
                }
              }
            } else {
              console.error(
                `Failed to decode the instruction: ${instruction.instructionData} with slot: ${instruction.slot}`
              )
            }
          }
        }
      }
    }

    return {
      result,
    }
  }
  async processBlock(request: ProcessBlockRequest, context: CallContext): Promise<DeepPartial<ProcessBlockResponse>> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    if (!request.block) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Block can't be empty")
    }
    const jsonString = Utf8ArrayToStr(request.block.raw)

    const block: Block = JSON.parse(jsonString)

    const resp: O11yResult = {
      histograms: [],
      counters: [],
    }

    const promises: Promise<O11yResult[]>[] = []
    for (const processor of globalThis.Processors) {
      if (Long.fromNumber(block.number) < processor.config.startBlock) {
        continue
      }

      if (
        processor.config.endBlock &&
        processor.config.endBlock > Long.fromNumber(0) &&
        Long.fromNumber(block.number) > processor.config.endBlock
      ) {
        continue
      }

      // TODO maybe do a map and construct in start
      const chainId = processor.getChainId()
      if (chainId !== request.chainId) {
        continue
      }
      const blockPromises: Promise<O11yResult[]> = Promise.all(
        processor.blockHandlers.map(function (handler) {
          return handler(block)
        })
      )
      promises.push(blockPromises)
    }
    try {
      const allRes = (await Promise.all(promises)).flat()
      for (const res of allRes) {
        resp.counters = resp.counters.concat(res.counters)
        resp.histograms = resp.histograms.concat(res.histograms)
      }
    } catch (e) {
      throw new ServerError(Status.INTERNAL, e.stack.toString())
    }

    return {
      result: resp,
    }
  }
}

// https://ourcodeworld.com/articles/read/164/how-to-convert-an-uint8array-to-string-in-javascript
/* eslint-disable */
function Utf8ArrayToStr(array: Uint8Array) {
  let out, i, len, c
  let char2, char3

  out = ''
  len = array.length
  i = 0
  while (i < len) {
    c = array[i++]
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c)
        break
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++]
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f))
        break
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++]
        char3 = array[i++]
        out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0))
        break
    }
  }

  return out
}
