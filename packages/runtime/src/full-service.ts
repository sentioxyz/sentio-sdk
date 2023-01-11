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
import fs from 'fs-extra'
import * as assert from 'assert'

export class FullProcessorServiceImpl implements ProcessorServiceImplementation {
  constructor(instance: ProcessorServiceImplementation) {
    this.instance = instance
    const sdkPackageJsonPath = require.resolve('@sentio/sdk/package.json')
    const sdkPackageJsonContent = fs.readFileSync(sdkPackageJsonPath, 'utf-8')
    const sdkPackageJson = JSON.parse(sdkPackageJsonContent)

    const runtimePackageJsonPath = require.resolve('@sentio/runtime/package.json')
    const runtimePackageJsonContent = fs.readFileSync(runtimePackageJsonPath, 'utf-8')
    const runtimePackageJson = JSON.parse(runtimePackageJsonContent)

    console.log('Runtime version:', runtimePackageJson.version, 'SDK version:', sdkPackageJson.version)

    const version = sdkPackageJson.version.split('.')
    this.sdkMinorVersion = parseInt(version[1])
  }

  instance: ProcessorServiceImplementation
  sdkMinorVersion: number

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
      case HandlerType.APT_EVENT:
        if (dataBinding.data?.aptEvent) {
          const aptEvent = dataBinding.data.aptEvent
          if (aptEvent.event && this.sdkMinorVersion < 40) {
            assert.ok(aptEvent.transaction, 'No Transaction')
            aptEvent.transaction.events = [aptEvent.event]
          }
        }
        break
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
