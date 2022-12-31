import { CallContext } from 'nice-grpc'

// Different than the simple one which
import {
  DataBinding,
  HandlerType,
  ProcessBindingsRequest,
  ProcessConfigRequest,
  ProcessorServiceImplementation,
  StartRequest,
} from './gen/processor/protos/processor'

import { Empty } from '@sentio/protos/lib/google/protobuf/empty'

export class FullProcessorServiceImpl implements ProcessorServiceImplementation {
  constructor(instance: ProcessorServiceImplementation) {
    this.instance = instance
  }

  instance: ProcessorServiceImplementation

  async getConfig(request: ProcessConfigRequest, context: CallContext) {
    return this.instance.getConfig(request, context)
  }

  async start(request: StartRequest, context: CallContext) {
    return this.instance.start(request, context)
  }

  async stop(request: Empty, context: CallContext) {
    return this.instance.stop(request, context)
  }

  async processBindings(request: ProcessBindingsRequest, options: CallContext) {
    for (const binding of request.bindings) {
      this.adjustDataBinding(binding)
    }
    return this.instance.processBindings(request, options)
  }

  async *processBindingsStream(requests: AsyncIterable<DataBinding>, context: CallContext) {
    throw new Error('Not Implemented for streaming')
    // y this.instance.processBindingsStream(requests, context)
  }

  protected adjustDataBinding(dataBinding: DataBinding): void {
    switch (dataBinding.handlerType) {
      case HandlerType.UNKNOWN:
        if (dataBinding.data?.ethBlock) {
          if (dataBinding.data.raw.length === 0) {
            // This is actually not needed in current system, just as initla test propose, move to test only
            // when this is stable
            dataBinding.data.raw = new TextEncoder().encode(JSON.stringify(dataBinding.data.ethBlock.block))
          }
        }
        break
      default:
        break
    }
  }
}
