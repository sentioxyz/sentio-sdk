import { Block, Log } from '@ethersproject/abstract-provider'
import { CallContext, ServerError, Status } from 'nice-grpc'
import { SOL_MAINMET_ID, SUI_DEVNET_ID } from './utils/chain'

import {
  AccountConfig,
  AptosCallHandlerConfig,
  AptosEventHandlerConfig,
  ContractConfig,
  Data_SolInstruction,
  DataBinding,
  EventTrackingConfig,
  ExportConfig,
  HandlerType,
  LogFilter,
  LogHandlerConfig,
  MetricConfig,
  ProcessBindingResponse,
  ProcessBindingsRequest,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessorServiceImplementation,
  ProcessResult,
  StartRequest,
  TemplateInstance,
} from './gen'

import { Empty } from './gen/google/protobuf/empty'
import Long from 'long'
import { TextDecoder } from 'util'
import { Trace } from './core'
import { Instruction as SolInstruction } from '@project-serum/anchor'
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
import { ProcessorTemplateProcessorState, TemplateInstanceState } from './core/base-processor-template'
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

const DEFAULT_MAX_BLOCK = Long.ZERO

const USER_PROCESSOR = 'user_processor'

export class ProcessorServiceImpl implements ProcessorServiceImplementation {
  // eth handlers
  private eventHandlers: ((event: Log) => Promise<ProcessResult>)[] = []
  private traceHandlers: ((trace: Trace) => Promise<ProcessResult>)[] = []
  private blockHandlers: ((block: Block) => Promise<ProcessResult>)[] = []

  // aptos handlers
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

    // This syntax is to copy values instead of using references
    this.templateInstances = [...TemplateInstanceState.INSTANCE.getValues()]
    this.eventTrackingConfigs = []
    this.metricConfigs = []
    this.exportConfigs = []

    // part 0, prepare metrics and event tracking configs
    for (const metric of MetricState.INSTANCE.getValues()) {
      this.metricConfigs.push({
        ...metric.config,
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
          slot: 0,
          slotInterval: blockHandler.blockInterval,
          minutes: 0,
          minutesInterval: blockHandler.timeIntervalInMinutes,
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
            minutes: 0,
            minutesInterval: handler.timeIntervalInMinutes,
            slot: 0,
            slotInterval: handler.versionInterval,
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
      const template = ProcessorTemplateProcessorState.INSTANCE.getValues()[instance.templateId]
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
    const t = TemplateInstanceState.INSTANCE.getValues()
    if (TemplateInstanceState.INSTANCE.getValues().length !== this.templateInstances.length) {
      await this.configure()
      updated = true
    }

    return {
      result,
      configUpdated: updated,
    }
  }

  async processBinding(request: DataBinding, options?: CallContext): Promise<ProcessResult> {
    const processBindingInternal = (request: DataBinding) => {
      switch (request.handlerType) {
        case HandlerType.APT_CALL:
          return this.processAptosFunctionCall(request)
        case HandlerType.APT_EVENT:
          return this.processAptosEvent(request)
        case HandlerType.APT_RESOURCE:
          return this.processAptosResource(request)
        case HandlerType.ETH_LOG:
          return this.processLog(request)
        case HandlerType.ETH_TRACE:
          return this.processTrace(request)
        case HandlerType.ETH_BLOCK:
          return this.processBlock(request)
        case HandlerType.SOL_INSTRUCTION:
          return this.processSolInstruction(request)
        // TODO migrate SUI cases
        // case HandlerType.INSTRUCTION:
        //   return this.processInstruction(request)
        default:
          throw new ServerError(Status.INVALID_ARGUMENT, 'No handle type registered ' + request.handlerType)
      }
    }

    const result = await processBindingInternal(request)
    recordRuntimeInfo(result, request.handlerType)
    return result
  }

  async *processBindingsStream(requests: AsyncIterable<DataBinding>, context: CallContext) {
    for await (const request of requests) {
      const result = await this.processBinding(request)
      let updated = false
      if (TemplateInstanceState.INSTANCE.getValues().length !== this.templateInstances.length) {
        await this.configure()
        updated = true
      }
      yield {
        result,
        configUpdated: updated,
      }
    }
  }

  async processLog(request: DataBinding): Promise<ProcessResult> {
    if (!request.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Log can't be null")
    }

    const promises: Promise<ProcessResult>[] = []
    const jsonString = Utf8ArrayToStr(request.data.ethLog?.data || request.data.raw)
    const log: Log = JSON.parse(jsonString)

    for (const handlerId of request.handlerIds) {
      const handler = this.eventHandlers[handlerId]
      promises.push(
        handler(log).catch((e) => {
          throw new ServerError(Status.INTERNAL, 'error processing log: ' + jsonString + '\n' + errorString(e))
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
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
          const a1 = JSON.parse(new TextDecoder().decode(instruction.parsed))
          parsedInstruction = processor.getParsedInstruction(a1)
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

  async processBlock(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Block can't be empty")
    }

    const jsonString = Utf8ArrayToStr(binding.data.ethBlock?.data || binding.data.raw)

    const block: Block = JSON.parse(jsonString)

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.blockHandlers[handlerId](block).catch((e) => {
          throw new ServerError(Status.INTERNAL, 'error processing block: ' + block.number + '\n' + errorString(e))
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processTrace(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Trace can't be empty")
    }
    const jsonString = Utf8ArrayToStr(binding.data.ethTrace?.data || binding.data.raw)
    const trace: Trace = JSON.parse(jsonString)

    const promises: Promise<ProcessResult>[] = []

    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.traceHandlers[handlerId](trace).catch((e) => {
          throw new ServerError(Status.INTERNAL, 'error processing trace: ' + jsonString + '\n' + errorString(e))
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processAptosEvent(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const promises: Promise<ProcessResult>[] = []
    const jsonString = Utf8ArrayToStr(binding.data.aptEvent?.data || binding.data.raw)
    const event = JSON.parse(jsonString)

    for (const handlerId of binding.handlerIds) {
      // only support aptos event for now
      promises.push(
        this.aptosEventHandlers[handlerId](event).catch((e) => {
          throw new ServerError(Status.INTERNAL, 'error processing event: ' + jsonString + '\n' + errorString(e))
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processAptosResource(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const jsonString = Utf8ArrayToStr(binding.data.aptResource?.data || binding.data.raw)
    const json = JSON.parse(jsonString) as MoveResourcesWithVersionPayload
    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      promises.push(
        this.aptosResourceHandlers[handlerId](json).catch((e) => {
          throw new ServerError(Status.INTERNAL, 'error processing event: ' + jsonString + '\n' + errorString(e))
        })
      )
    }
    return mergeProcessResults(await Promise.all(promises))
  }

  async processAptosFunctionCall(binding: DataBinding): Promise<ProcessResult> {
    if (!binding.data) {
      throw new ServerError(Status.INVALID_ARGUMENT, "Event can't be empty")
    }
    const jsonString = Utf8ArrayToStr(binding.data.aptCall?.data || binding.data.raw)
    const call = JSON.parse(jsonString)

    const promises: Promise<ProcessResult>[] = []
    for (const handlerId of binding.handlerIds) {
      // only support aptos call for now
      const promise = this.aptosCallHandlers[handlerId](call).catch((e) => {
        throw new ServerError(Status.INTERNAL, 'error processing call: ' + jsonString + '\n' + errorString(e))
      })
      promises.push(promise)
    }
    return mergeProcessResults(await Promise.all(promises))
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
