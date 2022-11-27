import { Block, Log } from '@ethersproject/abstract-provider'
import { CallContext, ServerError, Status } from 'nice-grpc'
import { SOL_MAINMET_ID, SUI_DEVNET_ID } from './utils/chain'

import {
  AccountConfig,
  AptosCallHandlerConfig,
  AptosEventHandlerConfig,
  BlockBinding,
  ContractConfig,
  DataBinding,
  EventTrackingConfig,
  ExportConfig,
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
import { MetricState } from './core/meter'
import { ExporterState } from './core/exporter'
import { EventTrackerState } from './core/event-tracker'
import {
  AptosAccountProcessorState,
  AptosProcessorState,
  MoveResourcesWithVersionPayload,
} from './aptos/aptos-processor'
import { AccountProcessorState } from './core/account-processor'
import { SuiProcessorState } from './core/sui-processor'
import { SolanaProcessorState } from './core/solana-processor'
import { ProcessorState } from './binds'

;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

const DEFAULT_MAX_BLOCK = Long.ZERO

const USER_PROCESSOR = 'user_processor'

export class ProcessorServiceImpl implements ProcessorServiceImplementation {
  private eventHandlers: ((event: Log) => Promise<ProcessResult>)[] = []
  private traceHandlers: ((trace: Trace) => Promise<ProcessResult>)[] = []
  private blockHandlers: ((block: Block) => Promise<ProcessResult>)[] = []
  private aptosEventHandlers: ((event: any) => Promise<ProcessResult>)[] = []
  private aptosCallHandlers: ((func: any) => Promise<ProcessResult>)[] = []
  private aptosResourceHandlers: ((resourceWithVersion: MoveResourcesWithVersionPayload) => Promise<ProcessResult>)[] =
    []

  // map from chain id to list of processors
  // private blockHandlers = new Map<string, ((block: Block) => Promise<ProcessResult>)[]>()
  // private processorsByChainId = new Map<string, BaseProcessor<BaseContract, BoundContractView<BaseContract, any>>>()

  private started = false
  private contractConfigs: ContractConfig[]
  private accountConfigs: AccountConfig[]
  private templateInstances: TemplateInstance[]
  private metricConfigs: MetricConfig[]
  private eventTrackingConfigs: EventTrackingConfig[]
  private exportConfigs: ExportConfig[]
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
      accountConfigs: this.accountConfigs,
      templateInstances: this.templateInstances,
      eventTrackingConfigs: this.eventTrackingConfigs,
      metricConfigs: this.metricConfigs,
      exportConfigs: this.exportConfigs,
    }
  }

  async configure() {
    this.eventHandlers = []
    this.templateInstances = []
    // this.processorsByChainId.clear()
    this.contractConfigs = []
    this.accountConfigs = []

    this.templateInstances = [...global.PROCESSOR_STATE.templatesInstances]
    this.eventTrackingConfigs = []
    this.metricConfigs = []
    this.exportConfigs = []

    // part 0, prepare metrics and event tracking configs
    for (const metric of MetricState.INSTANCE.getValues()) {
      this.metricConfigs.push({
        ...metric.descriptor,
      })
    }

    for (const eventTracker of EventTrackerState.INSTANCE.getValues()) {
      this.eventTrackingConfigs.push({
        distinctAggregationByDays: eventTracker.options.distinctByDays || [],
        eventName: eventTracker.name,
        retentionConfig: undefined,
        totalByDay: eventTracker.options.totalByDay || false,
        totalPerEntity: undefined,
        unique: eventTracker.options.unique || false,
      })
    }

    for (const exporter of ExporterState.INSTANCE.getValues()) {
      this.exportConfigs.push({
        name: exporter.name,
        channel: exporter.channel,
      })
    }

    // Part 1.a, prepare EVM processors
    for (const processor of ProcessorState.INSTANCE.getValues()) {
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
        intervalConfigs: [],
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
        const handlerId = this.blockHandlers.push(blockHandler.handler) - 1
        // TODO wrap the block handler into one

        contractConfig.intervalConfigs.push({
          slot: blockHandler.blockInterval || 1,
          minutes: blockHandler.timeIntervalInMinutes || 0,
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
            addressType: undefined,
            address: contractConfig.contract?.address,
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

    // part 1.b prepare EVM account processors
    for (const processor of AccountProcessorState.INSTANCE.getValues()) {
      const accountConfig: AccountConfig = {
        address: processor.config.address,
        chainId: processor.getChainId().toString(),
        startBlock: processor.config.startBlock ? Long.fromValue(processor.config.startBlock) : Long.ZERO,
        aptosIntervalConfigs: [],
        intervalConfigs: [],
        logConfigs: [],
      }
      // TODO add interval
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
            addressType: filter.addressType,
            address: filter.address,
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
        accountConfig.logConfigs.push(logConfig)
      }

      this.accountConfigs.push(accountConfig)
    }

    // Part 2, prepare solana constractors
    for (const solanaProcessor of SolanaProcessorState.INSTANCE.getValues()) {
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
        intervalConfigs: [],
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
    for (const suiProcessor of SuiProcessorState.INSTANCE.getValues()) {
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
        intervalConfigs: [],
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
    for (const aptosProcessor of AptosProcessorState.INSTANCE.getValues()) {
      const contractConfig: ContractConfig = {
        processorType: USER_PROCESSOR,
        contract: {
          name: aptosProcessor.moduleName,
          chainId: aptosProcessor.getChainId(),
          address: aptosProcessor.config.address,
          abi: '',
        },
        blockConfigs: [],
        intervalConfigs: [],
        logConfigs: [],
        traceConfigs: [],
        startBlock: Long.fromString(aptosProcessor.config.startVersion.toString()),
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

    for (const aptosProcessor of AptosAccountProcessorState.INSTANCE.getValues()) {
      const accountConfig: AccountConfig = {
        address: aptosProcessor.config.address,
        chainId: aptosProcessor.getChainId(),
        startBlock: Long.fromValue(aptosProcessor.config.startVersion.toString()),
        aptosIntervalConfigs: [],
        intervalConfigs: [],
        logConfigs: [],
      }
      for (const handler of aptosProcessor.resourcesHandlers) {
        const handlerId = this.aptosResourceHandlers.push(handler.handler) - 1
        accountConfig.aptosIntervalConfigs.push({
          intervalConfig: {
            handlerId: handlerId,
            minutes: handler.timeIntervalInMinutes || 0,
            slot: handler.versionInterval || 0,
          },
          type: handler.type || '',
        })
      }
      this.accountConfigs.push(accountConfig)
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
      case HandlerType.APT_RESOURCE:
        return this.processAptosResource(request)
      case HandlerType.ETH_LOG:
        return this.processLog(request)
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
      promises.push(this.processLog(l))
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

  async processLog(l: DataBinding): Promise<ProcessResult> {
    if (!l.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Log can't be null")
    }

    try {
      const jsonString = Utf8ArrayToStr(l.data.raw)
      const log: Log = JSON.parse(jsonString)
      const handler = this.eventHandlers[l.handlerId]
      return handler(log).catch((e) => {
        throw new ServerError(Status.INTERNAL, 'error processing log: ' + jsonString + '\n' + errorString(e))
      })
    } catch (e) {
      throw new ServerError(Status.INTERNAL, 'error parse log: ' + l)
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

    if (request.chainId.toLowerCase().startsWith('sui') && SuiProcessorState.INSTANCE.getValues()) {
      const processorPromises: Promise<void>[] = []
      for (const txn of request.transactions) {
        processorPromises.push(
          new Promise((resolve, _) => {
            for (const processor of SuiProcessorState.INSTANCE.getValues()) {
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
    if (SolanaProcessorState.INSTANCE.getValues()) {
      const processorPromises: Promise<void>[] = []
      for (const instruction of request.instructions) {
        if (!instruction) {
          throw new ServerError(Status.INVALID_ARGUMENT, 'instruction cannot be null')
        }

        processorPromises.push(
          new Promise((resolve, _) => {
            for (const processor of SolanaProcessorState.INSTANCE.getValues()) {
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

  async processAptosResource(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const jsonString = Utf8ArrayToStr(binding.data.raw)
    const json = JSON.parse(jsonString) as MoveResourcesWithVersionPayload
    const result = await this.aptosResourceHandlers[binding.handlerId](json).catch((e) => {
      throw new ServerError(Status.INTERNAL, 'error processing event: ' + jsonString + '\n' + errorString(e))
    })
    recordRuntimeInfo(result, HandlerType.APT_RESOURCE)
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
    res.events = res.events.concat(r.events)
    res.exports = res.exports.concat(r.exports)
  }
  return res
}

function recordRuntimeInfo(results: ProcessResult, handlerType: HandlerType) {
  for (const list of [results.gauges, results.counters, results.logs, results.events, results.exports]) {
    list.forEach((e) => {
      e.runtimeInfo = {
        from: handlerType,
      }
    })
  }
}

function errorString(e: Error): string {
  return e.stack || e.message
}
