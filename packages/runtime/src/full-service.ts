import { create } from '@bufbuild/protobuf'
import { type HandlerContext, type ServiceImpl } from '@connectrpc/connect'
import {
  type Empty,
  ExecutionConfigSchema,
  type PreprocessStreamRequest,
  type ProcessBindingsRequest,
  type ProcessConfigRequest,
  Processor,
  ProcessorV3,
  type ProcessStreamRequest,
  type StartRequest,
  type UpdateTemplatesRequest
} from '@sentio/protos'
import { ProcessorServiceImpl } from './service.js'
import { ProcessorServiceImplV3 } from './service-v3.js'
import { GLOBAL_CONFIG } from './global-config.js'

export class FullProcessorServiceImpl implements ServiceImpl<typeof Processor> {
  constructor(readonly instance: ProcessorServiceImpl) {}

  async getConfig(request: ProcessConfigRequest, context: HandlerContext) {
    const config = await this.instance.getConfig(request, context)
    config.executionConfig = create(ExecutionConfigSchema, GLOBAL_CONFIG.execution)
    return config
  }

  async start(request: StartRequest, context: HandlerContext) {
    return await this.instance.start(request, context)
  }

  async stop(request: Empty, context: HandlerContext) {
    return await this.instance.stop(request, context)
  }

  async processBindings(request: ProcessBindingsRequest, context: HandlerContext) {
    return await this.instance.processBindings(request, context)
  }

  async *processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: HandlerContext) {
    yield* this.instance.processBindingsStream(requests, context)
  }

  async *preprocessBindingsStream(requests: AsyncIterable<PreprocessStreamRequest>, context: HandlerContext) {
    yield* this.instance.preprocessBindingsStream(requests, context)
  }
}

export class FullProcessorServiceV3Impl implements ServiceImpl<typeof ProcessorV3> {
  constructor(readonly instance: ProcessorServiceImplV3) {}

  async start(request: StartRequest, context: HandlerContext) {
    return this.instance.start(request, context)
  }

  async getConfig(request: ProcessConfigRequest, context: HandlerContext) {
    const config = await this.instance.getConfig(request, context)
    config.executionConfig = create(ExecutionConfigSchema, GLOBAL_CONFIG.execution)
    return config
  }

  async *processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: HandlerContext) {
    yield* this.instance.processBindingsStream(requests, context)
  }

  async updateTemplates(request: UpdateTemplatesRequest, context: HandlerContext) {
    return this.instance.updateTemplates(request, context)
  }
}
