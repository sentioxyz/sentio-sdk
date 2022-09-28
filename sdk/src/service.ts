import { Block, Log } from '@ethersproject/abstract-provider'
import { CallContext, ServerError, Status } from 'nice-grpc'

import {
  BlockBinding,
  ContractConfig,
  HandlerType,
  LogFilter,
  LogHandlerConfig,
  ProcessResult,
  ProcessBlocksRequest,
  ProcessBlocksResponse,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessInstructionsRequest,
  ProcessInstructionsResponse,
  ProcessLogsRequest,
  ProcessLogsResponse,
  ProcessorServiceImplementation,
  ProcessTracesRequest,
  ProcessTracesResponse,
  ProcessTransactionsRequest,
  ProcessTransactionsResponse,
  StartRequest,
  TemplateInstance,
  TraceBinding,
} from './gen/processor/protos/processor'

import { Empty } from './gen/google/protobuf/empty'
import Long from 'long'
import { TextDecoder } from 'util'
import { Trace } from './trace'

const DEFAULT_MAX_BLOCK = Long.ZERO

export class ProcessorServiceImpl implements ProcessorServiceImplementation {
  private eventHandlers: ((event: Log) => Promise<ProcessResult>)[] = []
  private traceHandlers: ((trace: Trace) => Promise<ProcessResult>)[] = []
  private blockHandlers: ((block: Block) => Promise<ProcessResult>)[] = []

  // map from chain id to list of processors
  // private blockHandlers = new Map<string, ((block: Block) => Promise<ProcessResult>)[]>()
  // private processorsByChainId = new Map<string, BaseProcessor<BaseContract, BoundContractView<BaseContract, any>>>()

  private started = false
  private contractConfigs: ContractConfig[]
  private templateInstances: TemplateInstance[]
  private readonly loader: () => void

  private readonly shutdownHandler?: () => void

  constructor(loader: () => void, shutdownHandler?: () => void) {
    this.loader = loader
    this.shutdownHandler = shutdownHandler
  }

  async getConfig(request: ProcessConfigRequest, context: CallContext): Promise<ProcessConfigResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }
    return {
      // TODO project setting
      config: undefined,
      contractConfigs: this.contractConfigs,
      templateInstances: this.templateInstances,
    }
  }

  async configure() {
    this.eventHandlers = []
    this.templateInstances = []
    // this.processorsByChainId.clear()
    this.contractConfigs = []

    this.templateInstances = [...global.PROCESSOR_STATE.templatesInstances]

    // Part 1, prepare EVM processors
    for (const processor of global.PROCESSOR_STATE.processors) {
      // If server favor incremental update this need to change
      // Start basic config for contract
      const chainId = processor.getChainId()
      // this.processorsByChainId.set(chainId, processor)

      const contractConfig: ContractConfig = {
        processorType: 'user_processor',
        contract: {
          name: processor.config.name,
          chainId: chainId.toString(),
          address: processor.config.address,
          abi: '',
        },
        blockConfigs: [],
        logConfigs: [],
        traceConfigs: [],
        startBlock: processor.config.startBlock,
        endBlock: DEFAULT_MAX_BLOCK,
        instructionConfig: undefined,
      }
      if (processor.config.endBlock) {
        contractConfig.endBlock = processor.config.endBlock
      }

      // Step 1. Prepare all the block handlers
      for (const blockHandler of processor.blockHandlers) {
        const handlerId = this.blockHandlers.push(blockHandler) - 1
        contractConfig.blockConfigs.push({
          handlerId: handlerId,
        })
      }

      // Step 2. Prepare all trace handlers
      for (const traceHandler of processor.traceHandlers) {
        const handlerId = this.traceHandlers.push(traceHandler.handler) - 1
        contractConfig.traceConfigs.push({
          signature: traceHandler.signature,
          handlerId: handlerId,
        })
      }

      // Step 3. Prepare all the event handlers
      for (const eventsHandler of processor.eventHandlers) {
        // associate id with filter
        const handlerId = this.eventHandlers.push(eventsHandler.handler) - 1
        const logConfig: LogHandlerConfig = {
          handlerId: handlerId,
          filters: [],
        }

        for (const filter of eventsHandler.filters) {
          if (!filter.topics) {
            throw new ServerError(Status.INVALID_ARGUMENT, 'Topic should not be null')
          }
          const logFilter: LogFilter = {
            topics: [],
          }

          for (const ts of filter.topics) {
            let hashes: string[] = []
            if (Array.isArray(ts)) {
              hashes = hashes.concat(ts)
            } else if (ts) {
              hashes.push(ts)
            }
            logFilter.topics.push({ hashes: hashes })
          }
          logConfig.filters.push(logFilter)
        }
        contractConfig.logConfigs.push(logConfig)
      }

      // Finish up a contract
      this.contractConfigs.push(contractConfig)
    }

    // Part 2, prepare solana constractors
    for (const solanaProcessor of global.PROCESSOR_STATE.solanaProcessors) {
      const contractConfig: ContractConfig = {
        processorType: 'user_processor',
        contract: {
          name: solanaProcessor.contractName,
          chainId: 'SOL_mainnet', // TODO set in processor
          address: solanaProcessor.address,
          abi: '',
        },
        blockConfigs: [],
        logConfigs: [],
        traceConfigs: [],
        startBlock: solanaProcessor.config.startSlot,
        endBlock: DEFAULT_MAX_BLOCK,
        instructionConfig: {
          innerInstruction: solanaProcessor.processInnerInstruction,
          parsedInstruction: solanaProcessor.fromParsedInstruction !== null,
          rawDataInstruction: solanaProcessor.decodeInstruction !== null,
        },
      }
      this.contractConfigs.push(contractConfig)
    }

    // Part 3, prepare sui constractors
    for (const suiProcessor of global.PROCESSOR_STATE.suiProcessors) {
      const contractConfig: ContractConfig = {
        processorType: 'user_processor',
        contract: {
          name: 'sui processor',
          chainId: 'SUI_devnet',
          address: suiProcessor.address,
          abi: '',
        },
        blockConfigs: [],
        logConfigs: [],
        traceConfigs: [],
        startBlock: suiProcessor.config.startSeqNumber,
        endBlock: DEFAULT_MAX_BLOCK,
        instructionConfig: undefined,
      }
      this.contractConfigs.push(contractConfig)
    }
  }

  async start(request: StartRequest, context: CallContext): Promise<Empty> {
    if (this.started) {
      return {}
    }

    try {
      this.loader()
    } catch (e) {
      throw new ServerError(Status.INVALID_ARGUMENT, 'Failed to load processor: ' + errorString(e))
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
    try {
      await this.configure()
    } catch (e) {
      throw new ServerError(Status.INTERNAL, 'Failed to start processor : ' + errorString(e))
    }
    this.started = true
    return {}
  }

  async stop(request: Empty, context: CallContext): Promise<Empty> {
    console.log('Server Shutting down in 5 seconds')
    if (this.shutdownHandler) {
      setTimeout(this.shutdownHandler, 5000)
    }
    return {}
  }

  async processLogs(request: ProcessLogsRequest, context: CallContext): Promise<ProcessLogsResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const resp: ProcessResult = {
      gauges: [],
      counters: [],
      logs: [],
    }

    const promises: Promise<ProcessResult>[] = []
    for (const l of request.logBindings) {
      if (!l.log) {
        throw new ServerError(Status.INVALID_ARGUMENT, "Log can't be null")
      }
      // const jsonString = Buffer.from(l.log.raw.buffer).toString("utf-8")
      // const jsonString = String.fromCharCode.apply(null, l.log.raw)

      try {
        const jsonString = Utf8ArrayToStr(l.log.raw)
        const log: Log = JSON.parse(jsonString)
        const handler = this.eventHandlers[l.handlerId]
        const promise = handler(log).catch((e) => {
          throw new ServerError(Status.INTERNAL, 'error processing log: ' + jsonString + '\n' + errorString(e))
        })

        promises.push(promise)
      } catch (e) {
        throw new ServerError(Status.INTERNAL, 'error parse log: ' + l)
      }
    }

    const results = await Promise.all(promises)
    for (const res of results) {
      resp.counters = resp.counters.concat(res.counters)
      resp.gauges = resp.gauges.concat(res.gauges)
    }

    let updated = false
    if (
      global.PROCESSOR_STATE.templatesInstances &&
      this.templateInstances.length != global.PROCESSOR_STATE.templatesInstances.length
    ) {
      await this.configure()
      updated = true
    }

    recordRuntimeInfo(resp, HandlerType.LOG)
    return {
      result: resp,
      configUpdated: updated,
    }
  }

  async processTransactions(
    request: ProcessTransactionsRequest,
    context: CallContext
  ): Promise<ProcessTransactionsResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service not started.')
    }

    const result: ProcessResult = {
      gauges: [],
      counters: [],
      logs: [],
    }

    if (request.chainId.toLowerCase().startsWith('sui') && global.PROCESSOR_STATE.suiProcessors) {
      const processorPromises: Promise<void>[] = []
      for (const txn of request.transactions) {
        processorPromises.push(
          new Promise((resolve, _) => {
            for (const processor of global.PROCESSOR_STATE.suiProcessors) {
              const res = processor.handleTransaction(JSON.parse(new TextDecoder().decode(txn.raw)))
              if (res) {
                res.gauges.forEach((g) => {
                  if (g.metadata && txn.slot) {
                    g.metadata.blockNumber = txn.slot
                  }
                  result.gauges.push(g)
                })
                res.counters.forEach((c) => {
                  if (c.metadata && txn.slot) {
                    c.metadata.blockNumber = txn.slot
                  }
                  result.counters.push(c)
                })
              }
            }
            resolve()
          })
        )
      }
      await Promise.all(processorPromises)
    }

    recordRuntimeInfo(result, HandlerType.TRANSACTION)
    return {
      result,
    }
  }

  async processInstructions(
    request: ProcessInstructionsRequest,
    context: CallContext
  ): Promise<ProcessInstructionsResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service not started.')
    }

    const result: ProcessResult = {
      gauges: [],
      counters: [],
      logs: [],
    }

    // Only have instruction handlers for solana processors
    if (global.PROCESSOR_STATE.solanaProcessors) {
      const processorPromises: Promise<void>[] = []
      for (const instruction of request.instructions) {
        if (!instruction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'instruction cannot be null')
        }

        processorPromises.push(
          new Promise((resolve, _) => {
            for (const processor of global.PROCESSOR_STATE.solanaProcessors) {
              if (processor.address === instruction.programAccountId) {
                let res: ProcessResult | null
                if (instruction.parsed) {
                  res = processor.handleInstruction(JSON.parse(new TextDecoder().decode(instruction.parsed)))
                } else if (instruction.instructionData) {
                  res = processor.handleInstruction(instruction.instructionData)
                } else {
                  continue
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
                    console.error('error processing instruction ' + errorString(e))
                  }
                } else {
                  console.warn(
                    `Failed to decode the instruction: ${instruction.instructionData} with slot: ${instruction.slot}`
                  )
                }
              }
            }
            resolve()
          })
        )
      }

      await Promise.all(processorPromises)
    }

    recordRuntimeInfo(result, HandlerType.INSTRUCTION)
    return {
      result,
    }
  }

  async processBlocks(request: ProcessBlocksRequest, context: CallContext): Promise<ProcessBlocksResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const promises = request.blockBindings.map((binding) => this.processBlock(binding))
    const results = await Promise.all(promises)

    const res = ProcessResult.fromPartial({})

    for (const r of results) {
      res.counters = res.counters.concat(r.counters)
      res.gauges = res.gauges.concat(r.gauges)
    }

    recordRuntimeInfo(res, HandlerType.BLOCK)
    return {
      result: res,
    }
  }

  async processBlock(binding: BlockBinding): Promise<ProcessResult> {
    if (!binding.block) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Block can't be empty")
    }
    const jsonString = Utf8ArrayToStr(binding.block.raw)

    const block: Block = JSON.parse(jsonString)

    const resp: ProcessResult = {
      gauges: [],
      counters: [],
      logs: [],
    }

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.blockHandlers[handlerId](block).catch((e) => {
        throw new ServerError(Status.INTERNAL, 'error processing block: ' + block.number + '\n' + errorString(e))
      })
      promises.push(promise)
    }
    const allRes = await Promise.all(promises)
    for (const res of allRes) {
      resp.counters = resp.counters.concat(res.counters)
      resp.gauges = resp.gauges.concat(res.gauges)
    }
    return resp
  }

  async processTraces(request: ProcessTracesRequest, context: CallContext): Promise<ProcessTracesResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const promises = request.traceBindings.map((binding) => this.processTrace(binding))
    const results = await Promise.all(promises)

    const res = ProcessResult.fromPartial({})

    for (const r of results) {
      res.counters = res.counters.concat(r.counters)
      res.gauges = res.gauges.concat(r.gauges)
    }

    recordRuntimeInfo(res, HandlerType.TRACE)
    return {
      result: res,
    }
  }

  async processTrace(binding: TraceBinding): Promise<ProcessResult> {
    if (!binding.trace) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Trace can't be empty")
    }
    const jsonString = Utf8ArrayToStr(binding.trace.raw)
    const trace: Trace = JSON.parse(jsonString)

    return this.traceHandlers[binding.handlerId](trace).catch((e) => {
      throw new ServerError(Status.INTERNAL, 'error processing trace: ' + jsonString + '\n' + errorString(e))
    })
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

function recordRuntimeInfo(results: ProcessResult, handlerType: HandlerType) {
  results.gauges.forEach((e) => {
    e.runtimeInfo = {
      from: handlerType,
    }
  })

  results.counters.forEach((e) => {
    e.runtimeInfo = {
      from: handlerType,
    }
  })
}

function errorString(e: Error): string {
  return e.stack || e.message
}
