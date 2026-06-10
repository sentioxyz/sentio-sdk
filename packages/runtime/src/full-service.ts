import { create } from '@bufbuild/protobuf'
import { type HandlerContext, type ServiceImpl } from '@connectrpc/connect'
import {
  ExecutionConfigSchema,
  type ProcessConfigRequest,
  ProcessorV3,
  type ProcessStreamRequest,
  type StartRequest,
  type UpdateTemplatesRequest
} from '@sentio/protos'
import { ProcessorServiceImplV3 } from './service-v3.js'
import { GLOBAL_CONFIG } from './global-config.js'

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
