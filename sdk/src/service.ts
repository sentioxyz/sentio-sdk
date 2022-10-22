import { Block, Log } from '@ethersproject/abstract-provider'
import { CallContext, ServerError, Status } from 'nice-grpc'
import { SOL_MAINMET_ID, SUI_DEVNET_ID } from './utils/chain'

import {
  AptosCallHandlerConfig,
  AptosEventHandlerConfig,
  BlockBinding,
  ContractConfig,
  DataBinding,
  EventTrackingConfig,
  HandlerType,
  LogFilter,
  LogHandlerConfig,
  MetricConfig,
  ProcessBindingResponse,
  ProcessBindingsRequest,
  ProcessBlocksRequest,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessInstructionsRequest,
  ProcessorServiceImplementation,
  ProcessResult,
  ProcessTransactionsRequest,
  StartRequest,
  TemplateInstance,
} from './gen'

import { Empty } from './gen/google/protobuf/empty'
import Long from 'long'
import { TextDecoder } from 'util'
import { Trace } from './core'
import { Instruction } from '@project-serum/anchor'
import { EventTracker } from './core/event-tracker'

const DEFAULT_MAX_BLOCK = Long.ZERO

const USER_PROCESSOR = 'user_processor'

export class ProcessorServiceImpl implements ProcessorServiceImplementation {
  private eventHandlers: ((event: Log) => Promise<ProcessResult>)[] = []
  private traceHandlers: ((trace: Trace) => Promise<ProcessResult>)[] = []
  private blockHandlers: ((block: Block) => Promise<ProcessResult>)[] = []
  private aptosEventHandlers: ((event: any) => Promise<ProcessResult>)[] = []
  private aptosCallHandlers: ((func: any) => Promise<ProcessResult>)[] = []

  // map from chain id to list of processors
  // private blockHandlers = new Map<string, ((block: Block) => Promise<ProcessResult>)[]>()
  // private processorsByChainId = new Map<string, BaseProcessor<BaseContract, BoundContractView<BaseContract, any>>>()

  private started = false
  private contractConfigs: ContractConfig[]
  private templateInstances: TemplateInstance[]
  private metricConfigs: MetricConfig[]
  private eventTrackingConfigs: EventTrackingConfig[]
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
      eventTrackingConfigs: this.eventTrackingConfigs,
      metricConfigs: this.metricConfigs,
      accountConfigs: [],
    }
  }

  async configure() {
    this.eventHandlers = []
    this.templateInstances = []
    // this.processorsByChainId.clear()
    this.contractConfigs = []

    this.templateInstances = [...global.PROCESSOR_STATE.templatesInstances]
    this.eventTrackingConfigs = []
    this.metricConfigs = []

    // part 0, prepare metrics and event tracking configs
    for (const metric of global.PROCESSOR_STATE.metrics) {
      this.metricConfigs.push({
        ...metric.descriptor,
      })
    }

    for (const eventTracker of global.PROCESSOR_STATE.eventTrackers) {
      this.eventTrackingConfigs.push({
        distinctAggregationByDays: eventTracker.options.distinctByDays || [],
        eventName: eventTracker.eventName,
        retentionConfig: undefined,
        total: eventTracker.options.total || false,
        totalPerEntity: undefined,
        unique: eventTracker.options.unique || false,
      })
    }

    // Part 1, prepare EVM processors
    for (const processor of global.PROCESSOR_STATE.processors) {
      // If server favor incremental update this need to change
      // Start basic config for contract
      const chainId = processor.getChainId()
      // this.processorsByChainId.set(chainId, processor)

      const contractConfig: ContractConfig = {
        processorType: USER_PROCESSOR,
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
        aptosEventConfigs: [],
        aptosCallConfigs: [],
      }
      if (processor.config.endBlock) {
        contractConfig.endBlock = processor.config.endBlock
      }

      // Step 1. Prepare all the block handlers
      for (const blockHandler of processor.blockHandlers) {
        const handlerId = this.blockHandlers.push(blockHandler) - 1
        // TODO wrap the block handler into one

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
        processorType: USER_PROCESSOR,
        contract: {
          name: solanaProcessor.contractName,
          chainId: SOL_MAINMET_ID,
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
        aptosEventConfigs: [],
        aptosCallConfigs: [],
      }
      this.contractConfigs.push(contractConfig)
    }

    // Part 3, prepare sui constractors
    for (const suiProcessor of global.PROCESSOR_STATE.suiProcessors) {
      const contractConfig: ContractConfig = {
        processorType: USER_PROCESSOR,
        contract: {
          name: 'sui contract',
          chainId: SUI_DEVNET_ID,
          address: suiProcessor.address,
          abi: '',
        },
        blockConfigs: [],
        logConfigs: [],
        traceConfigs: [],
        startBlock: suiProcessor.config.startSeqNumber,
        endBlock: DEFAULT_MAX_BLOCK,
        instructionConfig: undefined,
        aptosEventConfigs: [],
        aptosCallConfigs: [],
      }
      this.contractConfigs.push(contractConfig)
    }

    // Part 4, prepare aptos constractors
    for (const aptosProcessor of global.PROCESSOR_STATE.aptosProcessors) {
      const contractConfig: ContractConfig = {
        processorType: USER_PROCESSOR,
        contract: {
          name: aptosProcessor.moduleName,
          chainId: aptosProcessor.getChainId(),
          address: aptosProcessor.config.address,
          abi: '',
        },
        blockConfigs: [],
        logConfigs: [],
        traceConfigs: [],
        startBlock: aptosProcessor.config.startVersion,
        endBlock: DEFAULT_MAX_BLOCK,
        instructionConfig: undefined,
        aptosEventConfigs: [],
        aptosCallConfigs: [],
      }
      // 1. Prepare event handlers
      for (const handler of aptosProcessor.eventHandlers) {
        const handlerId = this.aptosEventHandlers.push(handler.handler) - 1
        const eventHandlerConfig: AptosEventHandlerConfig = {
          filters: handler.filters.map((f) => {
            return {
              type: f.type,
              account: f.account || '',
            }
          }),
          handlerId,
        }
        contractConfig.aptosEventConfigs.push(eventHandlerConfig)
      }

      // 2. Prepare function handlers
      for (const handler of aptosProcessor.callHandlers) {
        const handlerId = this.aptosCallHandlers.push(handler.handler) - 1
        const functionHandlerConfig: AptosCallHandlerConfig = {
          filters: handler.filters.map((filter) => {
            return {
              function: filter.function,
              typeArguments: filter.typeArguments || [],
              withTypeArguments: filter.typeArguments ? true : false,
              includeFailed: filter.includeFailed || false,
            }
          }),
          handlerId,
        }
        contractConfig.aptosCallConfigs.push(functionHandlerConfig)
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

  async processBindings(request: ProcessBindingsRequest, options?: CallContext): Promise<ProcessBindingResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const promises = request.bindings.map((binding) => this.processBinding(binding))
    const result = mergeProcessResults(await Promise.all(promises))

    let updated = false
    if (
      global.PROCESSOR_STATE.templatesInstances &&
      this.templateInstances.length != global.PROCESSOR_STATE.templatesInstances.length
    ) {
      await this.configure()
      updated = true
    }

    return {
      result,
      configUpdated: updated,
    }
  }

  async processBinding(request: DataBinding, options?: CallContext): Promise<ProcessResult> {
    switch (request.handlerType) {
      case HandlerType.APT_CALL:
        return this.processAptosFunctionCall(request)
      case HandlerType.APT_EVENT:
        return this.processAptosEvent(request)
      default:
        throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
    }
  }

  async processLogs(request: ProcessBindingsRequest, context: CallContext): Promise<ProcessBindingResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const promises: Promise<ProcessResult>[] = []
    for (const l of request.bindings) {
      if (!l.data) {
        throw new ServerError(Status.INVALID_ARGUMENT, "Log can't be null")
      }
      // const jsonString = Buffer.from(l.log.raw.buffer).toString("utf-8")
      // const jsonString = String.fromCharCode.apply(null, l.log.raw)

      try {
        const jsonString = Utf8ArrayToStr(l.data.raw)
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

    const result = mergeProcessResults(await Promise.all(promises))

    let updated = false
    if (
      global.PROCESSOR_STATE.templatesInstances &&
      this.templateInstances.length != global.PROCESSOR_STATE.templatesInstances.length
    ) {
      await this.configure()
      updated = true
    }

    recordRuntimeInfo(result, HandlerType.ETH_LOG)
    return {
      result,
      configUpdated: updated,
    }
  }

  async processTransactions(
    request: ProcessTransactionsRequest,
    context: CallContext
  ): Promise<ProcessBindingResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service not started.')
    }

    const result = ProcessResult.fromPartial({})

    if (request.chainId.toLowerCase().startsWith('sui') && global.PROCESSOR_STATE.suiProcessors) {
      const processorPromises: Promise<void>[] = []
      for (const txn of request.transactions) {
        processorPromises.push(
          new Promise((resolve, _) => {
            for (const processor of global.PROCESSOR_STATE.suiProcessors) {
              const res = processor.handleTransaction(
                JSON.parse(new TextDecoder().decode(txn.raw)),
                txn.slot ?? Long.fromNumber(0)
              )
              if (res) {
                res.gauges.forEach((g) => result.gauges.push(g))
                res.counters.forEach((c) => result.counters.push(c))
                res.logs.forEach((l) => result.logs.push(l))
              }
            }
            resolve()
          })
        )
      }
      await Promise.all(processorPromises)
    }

    // if (request.chainId.toLowerCase().startsWith('apt') && global.PROCESSOR_STATE.aptosProcessors) {
    //   const processorPromises: Promise<void>[] = []
    //   for (const txn of request.transactions) {
    //     processorPromises.push(
    //       new Promise((resolve, _) => {
    //         for (const processor of global.PROCESSOR_STATE.aptosProcessors) {
    //           if (processor.address === txn.programAccountId!) {
    //             const res = processor.handleTransaction(
    //               JSON.parse(new TextDecoder().decode(txn.raw)),
    //               txn.slot ?? Long.fromNumber(0)
    //             )
    //             if (res) {
    //               res.gauges.forEach((g) => result.gauges.push(g))
    //               res.counters.forEach((c) => result.counters.push(c))
    //               res.logs.forEach((l) => result.logs.push(l))
    //             }
    //           }
    //         }
    //         resolve()
    //       })
    //     )
    //   }
    //   await Promise.all(processorPromises)
    // }

    recordRuntimeInfo(result, HandlerType.TRANSACTION)
    return {
      result,
      configUpdated: false,
    }
  }

  async processInstructions(
    request: ProcessInstructionsRequest,
    context: CallContext
  ): Promise<ProcessBindingResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service not started.')
    }

    const result = ProcessResult.fromPartial({})

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
                let parsedInstruction: Instruction | null = null
                if (instruction.parsed) {
                  parsedInstruction = processor.getParsedInstruction(
                    JSON.parse(new TextDecoder().decode(instruction.parsed))
                  )
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
                const res = processor.handleInstruction(
                  parsedInstruction,
                  instruction.accounts,
                  insHandler,
                  instruction.slot
                )
                res.gauges.forEach((g) => result.gauges.push(g))
                res.counters.forEach((c) => result.counters.push(c))
                res.logs.forEach((l) => result.logs.push(l))
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
      configUpdated: false,
    }
  }

  async processBlocks(request: ProcessBlocksRequest, context: CallContext): Promise<ProcessBindingResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const promises = request.blockBindings.map((binding) => this.processBlock(binding))
    const result = mergeProcessResults(await Promise.all(promises))

    recordRuntimeInfo(result, HandlerType.BLOCK)
    return {
      result,
      configUpdated: false,
    }
  }

  async processBlock(binding: BlockBinding): Promise<ProcessResult> {
    if (!binding.block) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Block can't be empty")
    }
    const jsonString = Utf8ArrayToStr(binding.block.raw)

    const block: Block = JSON.parse(jsonString)

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      const promise = this.blockHandlers[handlerId](block).catch((e) => {
        throw new ServerError(Status.INTERNAL, 'error processing block: ' + block.number + '\n' + errorString(e))
      })
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processTraces(request: ProcessBindingsRequest, context: CallContext): Promise<ProcessBindingResponse> {
    if (!this.started) {
      throw new ServerError(Status.UNAVAILABLE, 'Service Not started.')
    }

    const promises = request.bindings.map((binding) => this.processTrace(binding))
    const result = mergeProcessResults(await Promise.all(promises))

    recordRuntimeInfo(result, HandlerType.ETH_TRACE)
    return {
      result,
      configUpdated: false,
    }
  }

  async processTrace(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Trace can't be empty")
    }
    const jsonString = Utf8ArrayToStr(binding.data.raw)
    const trace: Trace = JSON.parse(jsonString)

    return this.traceHandlers[binding.handlerId](trace).catch((e) => {
      throw new ServerError(Status.INTERNAL, 'error processing trace: ' + jsonString + '\n' + errorString(e))
    })
  }

  async processAptosEvent(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const jsonString = Utf8ArrayToStr(binding.data.raw)
    const event = JSON.parse(jsonString)
    // only support aptos event for now
    const result = await this.aptosEventHandlers[binding.handlerId](event).catch((e) => {
      throw new ServerError(Status.INTERNAL, 'error processing event: ' + jsonString + '\n' + errorString(e))
    })
    recordRuntimeInfo(result, HandlerType.APT_EVENT)
    return result
  }

  async processAptosFunctionCall(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const jsonString = Utf8ArrayToStr(binding.data.raw)
    const call = JSON.parse(jsonString)
    // only support aptos call for now
    const result = await this.aptosCallHandlers[binding.handlerId](call).catch((e) => {
      throw new ServerError(Status.INTERNAL, 'error processing call: ' + jsonString + '\n' + errorString(e))
    })
    recordRuntimeInfo(result, HandlerType.APT_CALL)
    return result
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

function mergeProcessResults(results: ProcessResult[]): ProcessResult {
  const res = ProcessResult.fromPartial({})

  for (const r of results) {
    res.counters = res.counters.concat(r.counters)
    res.gauges = res.gauges.concat(r.gauges)
    res.logs = res.logs.concat(r.logs)
    res.events = res.events.concat(res.events)
  }
  return res
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

  results.logs.forEach((e) => {
    e.runtimeInfo = {
      from: handlerType,
    }
  })
}

function errorString(e: Error): string {
  return e.stack || e.message
}
