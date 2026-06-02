import { CallContext } from 'nice-grpc'
// Different than the simple one which
import {
  ExecutionConfig,
  PreprocessStreamRequest,
  ProcessBindingsRequest,
  ProcessConfigRequest,
  ProcessConfigResponse,
  ProcessorServiceImplementation,
  ProcessStreamRequest,
  StartRequest
} from './gen/processor/protos/processor.js'

import { DeepPartial, Empty, ProcessorV3ServiceImplementation, UpdateTemplatesRequest } from '@sentio/protos'
import { GLOBAL_CONFIG } from './global-config.js'

export class FullProcessorServiceImpl implements ProcessorServiceImplementation {
  constructor(instance: ProcessorServiceImplementation) {
    this.instance = instance
  }

  instance: ProcessorServiceImplementation

  async getConfig(request: ProcessConfigRequest, context: CallContext) {
    const config = await this.instance.getConfig(request, context)
    config.executionConfig = ExecutionConfig.fromPartial(GLOBAL_CONFIG.execution)
    return config
  }

  async start(request: StartRequest, context: CallContext) {
    return await this.instance.start(request, context)
  }

  async stop(request: Empty, context: CallContext) {
    return await this.instance.stop(request, context)
  }

  async processBindings(request: ProcessBindingsRequest, options: CallContext) {
    return await this.instance.processBindings(request, options)
  }

  async *processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: CallContext) {
    yield* this.instance.processBindingsStream(requests, context)
  }

  async *preprocessBindingsStream(requests: AsyncIterable<PreprocessStreamRequest>, context: CallContext) {
    yield* this.instance.preprocessBindingsStream(requests, context)
  }
}

export class FullProcessorServiceV3Impl implements ProcessorV3ServiceImplementation {
  constructor(readonly instance: ProcessorV3ServiceImplementation) {}

  async start(request: StartRequest, context: CallContext): Promise<DeepPartial<Empty>> {
    return this.instance.start(request, context)
  }

  async getConfig(request: ProcessConfigRequest, context: CallContext): Promise<DeepPartial<ProcessConfigResponse>> {
    const config = await this.instance.getConfig(request, context)
    config.executionConfig = ExecutionConfig.fromPartial(GLOBAL_CONFIG.execution)
    return config
  }

  async *processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: CallContext) {
    yield* this.instance.processBindingsStream(requests, context)
  }

  async updateTemplates(request: UpdateTemplatesRequest, context: CallContext): Promise<DeepPartial<Empty>> {
    return this.instance.updateTemplates(request, context)
  }
}
