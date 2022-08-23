import { Block, Log } from '@ethersproject/abstract-provider'
import { CallContext, ServerError, Status } from 'nice-grpc'

import {
  ContractConfig,
  HandlerCondition,
  HandlerType,
  LogHandlerConfig,
  O11yResult,
  ProcessBlockRequest,
  ProcessBlockResponse,
  ProcessBlocksRequest,
  ProcessBlocksResponse,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessInstructionRequest,
  ProcessInstructionResponse,
  ProcessLogRequest,
  ProcessLogResponse,
  ProcessorServiceImplementation,
  ProcessTransactionRequest,
  ProcessTransactionResponse,
  StartRequest,
  TemplateInstance,
} from './gen/processor/protos/processor'

import { DeepPartial } from './gen/builtin'
import { Empty } from './gen/google/protobuf/empty'
import Long from 'long'
import { BaseProcessor } from './base-processor'
import { BaseContract } from 'ethers'
import { ContractWrapper } from './context'

const DEFAULT_MAX_BLOCK = Long.ZERO

export class ProcessorServiceImpl implements ProcessorServiceImplementation {
  private eventHandlers: ((event: Log) => Promise<O11yResult>)[] = []
  // map from chain id to list of processors
  // private blockHandlers = new Map<string, ((block: Block) => Promise<O11yResult>)[]>()
  private processorsByChainId = new Map<string, BaseProcessor<BaseContract, ContractWrapper<BaseContract>>>()

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
    this.processorsByChainId.clear()
    this.contractConfigs = []

    if (global.PROCESSOR_STATE.templatesInstances) {
      this.templateInstances = [...global.PROCESSOR_STATE.templatesInstances]
    }

    if (global.PROCESSOR_STATE.processors) {
      for (const processor of global.PROCESSOR_STATE.processors) {
        // If server favor incremental update this need to change
        // Start basic config for contract
        const chainId = processor.getChainId()
        this.processorsByChainId.set(chainId, processor)

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
          endBlock: DEFAULT_MAX_BLOCK,
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

        // Finish up a contract
        this.contractConfigs.push(contractConfig)
      }
    }

    if (global.PROCESSOR_STATE.solanaProcessors) {
      for (const solanaProcessor of global.PROCESSOR_STATE.solanaProcessors) {
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
          endBlock: DEFAULT_MAX_BLOCK,
          instructionConfig: {
            innerInstruction: solanaProcessor.processInnerInstruction,
            parsedInstruction: solanaProcessor.fromParsedInstruction != null ? true : false,
            rawDataInstruction: solanaProcessor.decodeInstruction != null ? true : false,
          },
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
      const template = global.PROCESSOR_STATE.templates[instance.templateId]
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
      gauges: [],
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
        resp.gauges = resp.gauges.concat(res.gauges)
      } catch (e) {
        throw new ServerError(Status.INTERNAL, e)
      }
    }

    let updated = false
    if (
      global.PROCESSOR_STATE.templatesInstances &&
      this.templateInstances.length != global.PROCESSOR_STATE.templatesInstances.length
    ) {
      await this.configure()
      updated = true
    }

    resp.gauges?.forEach((e) => (e.from = HandlerType.LOG))
    resp.counters?.forEach((e) => (e.from = HandlerType.LOG))
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
      gauges: [],
      counters: [],
    }

    // Only have instruction handlers for solana processors
    if (global.PROCESSOR_STATE.solanaProcessors) {
      for (const instruction of request.instructions) {
        if (!instruction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'instruction cannot be null')
        }

        for (const processor of global.PROCESSOR_STATE.solanaProcessors) {
          if (processor.address === instruction.programAccountId) {
            let res: O11yResult | null
            if (instruction.parsed) {
              res = processor.handleInstruction(JSON.parse(instruction.parsed.toString()))
            } else {
              res = processor.handleInstruction(instruction.instructionData)
            }
            if (res) {
              try {
                res.gauges.forEach((g) => {
                  if (g.metadata) {
                    g.metadata.blockNumber = instruction.slot
                  }
                  result.gauges.push(g)
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
            } else {
              console.error(
                `Failed to decode the instruction: ${instruction.instructionData} with slot: ${instruction.slot}`
              )
            }
          }
        }
      }
    }

    result.gauges?.forEach((e) => (e.from = HandlerType.INSTRUCTION))
    result.counters?.forEach((e) => (e.from = HandlerType.INSTRUCTION))
    return {
      result,
    }
  }

  async processBlocks(
    request: ProcessBlocksRequest,
    context: CallContext
  ): Promise<DeepPartial<ProcessBlocksResponse>> {
    const promises = request.requests.map((req) => this.processBlock(req, context))
    const resp = await Promise.all(promises)

    return {
      response: resp,
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
      gauges: [],
      counters: [],
    }

    const promises: Promise<O11yResult[]>[] = []
    for (const processor of global.PROCESSOR_STATE.processors) {
      if (Long.fromNumber(block.number) < processor.config.startBlock) {
        continue
      }

      if (
        processor.config.endBlock &&
        processor.config.endBlock > Long.ZERO &&
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
        resp.gauges = resp.gauges.concat(res.gauges)
      }
    } catch (e) {
      throw new ServerError(Status.INTERNAL, e.stack.toString())
    }

    resp.gauges?.forEach((e) => (e.from = HandlerType.BLOCK))
    resp.counters?.forEach((e) => (e.from = HandlerType.BLOCK))
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
