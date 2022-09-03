import {
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
  ProcessTransactionsRequest,
  ProcessTransactionsResponse,
  setProvider,
  StartRequest,
} from '@sentio/sdk'
import { cleanTest } from './clean-test'
import path from 'path'
import * as fs from 'fs-extra'
import { CallContext } from 'nice-grpc-common'
import { DeepPartial } from '../gen/builtin'
import { Empty } from '../gen/google/protobuf/empty'

const TEST_CONTEXT: CallContext = <CallContext>{}

export class TestProcessorServer implements ProcessorServiceImplementation {
  service = new ProcessorServiceImpl()

  setup(processorPath: string | string[] = []) {
    cleanTest()
    const fullPath = path.resolve('chains-config.json')
    const chainsConfig = fs.readJsonSync(fullPath)
    setProvider(chainsConfig)
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
