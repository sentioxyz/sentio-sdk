import { CallContext } from 'nice-grpc'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Different than the simple one which
import {
  DataBinding,
  HandlerType,
  ProcessBindingsRequest,
  ProcessConfigRequest,
  ProcessorServiceImplementation,
  StartRequest,
  ProcessResult,
} from './gen/processor/protos/processor.js'

import { Empty } from '@sentio/protos'
import fs from 'fs-extra'
import path from 'path'

function locatePackageJson(pkgId: string) {
  const m = require.resolve(pkgId)

  let dir = path.dirname(m)
  while (!fs.existsSync(path.join(dir, 'package.json'))) {
    dir = path.dirname(dir)
  }
  const content = fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')
  return JSON.parse(content)
}

export class FullProcessorServiceImpl implements ProcessorServiceImplementation {
  constructor(instance: ProcessorServiceImplementation) {
    this.instance = instance
    const sdkPackageJson = locatePackageJson('@sentio/sdk')
    const runtimePackageJson = locatePackageJson('@sentio/runtime')

    console.log('Runtime version:', runtimePackageJson.version, 'SDK version:', sdkPackageJson.version)

    const version = sdkPackageJson.version.split('.')
    this.sdkMinorVersion = parseInt(version[1])
  }

  instance: ProcessorServiceImplementation
  sdkMinorVersion: number

  async getConfig(request: ProcessConfigRequest, context: CallContext) {
    const config = await this.instance.getConfig(request, context)
    if (config.contractConfigs) {
      for (const contract of config.contractConfigs) {
        // @ts-ignore old fields
        if (contract.aptosCallConfigs) {
          // @ts-ignore old fields
          contract.moveCallConfigs = contract.aptosCallConfigs
        }
        // @ts-ignore old fields
        if (contract.aptosEventConfigs) {
          // @ts-ignore old fields
          contract.moveEventConfigs = contract.aptosEventConfigs
        }
      }
    }
    return config
  }

  async start(request: StartRequest, context: CallContext) {
    return await this.instance.start(request, context)
  }

  async stop(request: Empty, context: CallContext) {
    return await this.instance.stop(request, context)
  }

  async processBindings(request: ProcessBindingsRequest, options: CallContext) {
    for (const binding of request.bindings) {
      this.adjustDataBinding(binding)
    }
    const result = await this.instance.processBindings(request, options)
    this.adjustResult(result.result as ProcessResult)
    return result
  }

  async *processBindingsStream(requests: AsyncIterable<DataBinding>, context: CallContext) {
    throw new Error('Not Implemented for streaming')
    // y this.instance.processBindingsStream(requests, context)
  }

  private adjustResult(res: ProcessResult): void {}

  private adjustDataBinding(dataBinding: DataBinding): void {
    switch (dataBinding.handlerType) {
      case HandlerType.APT_EVENT:
        if (dataBinding.data?.aptEvent) {
          // const aptEvent = dataBinding.data.aptEvent
          // if (aptEvent.event && this.sdkMinorVersion < 40) {
          //   assert.ok(aptEvent.transaction, 'No Transaction')
          //   aptEvent.transaction.events = [aptEvent.event]
          // }
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
