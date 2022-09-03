import {
  O11yResult,
  ProcessBlocksRequest,
  ProcessBlocksResponse,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessInstructionsRequest,
  ProcessInstructionsResponse,
  ProcessLogsRequest,
  ProcessLogsResponse,
  ProcessorServiceImpl,
  ProcessorServiceImplementation,
  ProcessorState,
  ProcessTransactionsRequest,
  ProcessTransactionsResponse,
  setProvider,
  StartRequest,
} from '@sentio/sdk'
import { CallContext } from 'nice-grpc-common'
import { Empty } from '../gen/google/protobuf/empty'
import { ChainConfig } from '../chain-config'
import { CHAIN_MAP } from '../utils/chainmap'
import { MetricValueToNumber, Numberish } from '../numberish'

const TEST_CONTEXT: CallContext = <CallContext>{}

function cleanTest() {
  global.PROCESSOR_STATE = new ProcessorState()
}
export class TestProcessorServer implements ProcessorServiceImplementation {
  service = new ProcessorServiceImpl()

  setup(processorPath: string | string[] = [], httpEndpoints: Record<string, string> = {}) {
    cleanTest()
    const dummyConfig: Record<string, ChainConfig> = {}

    for (const k in CHAIN_MAP) {
      const http = httpEndpoints[k] || ''
      dummyConfig[k] = {
        ChainID: k,
        Https: [http],
      }
    }

    setProvider(dummyConfig)
    if (!Array.isArray(processorPath)) {
      processorPath = [processorPath]
    }
    for (const path of processorPath) {
      require(path)
    }
  }

  start(request: StartRequest = { templateInstances: [] }, context = TEST_CONTEXT): Promise<Empty> {
    return this.service.start(request, context)
  }

  stop(request: Empty, context = TEST_CONTEXT): Promise<Empty> {
    return this.service.stop(request, context)
  }

  getConfig(request: ProcessConfigRequest, context = TEST_CONTEXT): Promise<ProcessConfigResponse> {
    return this.service.getConfig(request, context)
  }

  processBlocks(request: ProcessBlocksRequest, context = TEST_CONTEXT): Promise<ProcessBlocksResponse> {
    return this.service.processBlocks(request, context)
  }

  processInstructions(
    request: ProcessInstructionsRequest,
    context = TEST_CONTEXT
  ): Promise<ProcessInstructionsResponse> {
    return this.service.processInstructions(request, context)
  }

  processLogs(request: ProcessLogsRequest, context = TEST_CONTEXT): Promise<ProcessLogsResponse> {
    return this.service.processLogs(request, context)
  }

  processTransactions(
    request: ProcessTransactionsRequest,
    context = TEST_CONTEXT
  ): Promise<ProcessTransactionsResponse> {
    return this.service.processTransactions(request, context)
  }
}

export function firstCounterValue(result: O11yResult | undefined, name: string): Numberish | undefined {
  if (!result) {
    return undefined
  }
  for (const counter of result.counters) {
    if (counter.metadata?.name === name) {
      return MetricValueToNumber(counter.metricValue)
    }
  }
  return undefined
}

export function firstGaugeValue(result: O11yResult | undefined, name: string): Numberish | undefined {
  if (!result) {
    return undefined
  }
  for (const gauge of result.gauges) {
    if (gauge.metadata?.name === name) {
      return MetricValueToNumber(gauge.metricValue)
    }
  }
  return undefined
}
