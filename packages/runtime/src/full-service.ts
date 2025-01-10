import { CallContext } from 'nice-grpc'
import { createRequire } from 'module'
// Different than the simple one which
import {
  DataBinding,
  ExecutionConfig,
  HandlerType,
  PreprocessStreamRequest,
  ProcessBindingsRequest,
  ProcessConfigRequest,
  ProcessorServiceImplementation,
  ProcessResult,
  ProcessStreamRequest,
  StartRequest
} from './gen/processor/protos/processor.js'

import { Empty } from '@sentio/protos'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { GLOBAL_CONFIG } from './global-config.js'

const require = createRequire(import.meta.url)

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
    config.executionConfig = ExecutionConfig.fromPartial(GLOBAL_CONFIG.execution)

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
    if (GLOBAL_CONFIG.execution.sequential) {
      request.bindings = request.bindings.sort(dataCompare)
    }

    for (const binding of request.bindings) {
      this.adjustDataBinding(binding)
    }
    try {
      const result = await this.instance.processBindings(request, options)
      this.adjustResult(result.result as ProcessResult)
      if (!result.configUpdated && result.result?.states?.configUpdated) {
        result.configUpdated = result.result?.states?.configUpdated
      }
      return result
    } catch (e) {
      if (this.sdkMinorVersion <= 16) {
        // Old sdk doesn't handle this well
        if (
          e.code === os.constants.errno.ECONNRESET ||
          e.code === os.constants.errno.ECONNREFUSED ||
          e.code === os.constants.errno.ECONNABORTED
        ) {
          process.exit(1)
        }
      }
      throw e
    }
  }

  async *adjustBindingsStream(requests: AsyncIterable<ProcessStreamRequest>): AsyncIterable<ProcessStreamRequest> {
    for await (const request of requests) {
      this.adjustDataBinding(request.binding)
      yield request
    }
  }

  async *processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: CallContext) {
    yield* this.instance.processBindingsStream(this.adjustBindingsStream(requests), context)
  }

  async *preprocessBindingsStream(requests: AsyncIterable<PreprocessStreamRequest>, context: CallContext) {
    yield* this.instance.preprocessBindingsStream(this.adjustBindingsStream(requests), context)
  }

  private adjustResult(res: ProcessResult): void {}

  private adjustDataBinding(dataBinding?: DataBinding): void {
    if (!dataBinding) {
      return
    }
    switch (dataBinding.handlerType) {
      case HandlerType.FUEL_TRANSACTION:
        if (this.sdkMinorVersion < 55) {
          dataBinding.handlerType = HandlerType.FUEL_CALL
          if (dataBinding.data) {
            dataBinding.data.fuelCall = dataBinding.data?.fuelTransaction
          }
        }
        break
      case HandlerType.FUEL_RECEIPT:
        if (this.sdkMinorVersion < 55) {
          dataBinding.handlerType = HandlerType.FUEL_CALL
          if (dataBinding.data) {
            dataBinding.data.fuelCall = dataBinding.data?.fuelLog
          }
        }

        break
      case HandlerType.APT_EVENT:
        if (dataBinding.data?.aptEvent) {
          if (dataBinding.data.aptEvent.rawTransaction && !dataBinding.data.aptEvent.transaction) {
            dataBinding.data.aptEvent.transaction = JSON.parse(dataBinding.data.aptEvent.rawTransaction)
          }
        }
        break
      case HandlerType.APT_CALL:
        if (dataBinding.data?.aptCall) {
          if (dataBinding.data.aptCall.rawTransaction && !dataBinding.data.aptCall.transaction) {
            dataBinding.data.aptCall.transaction = JSON.parse(dataBinding.data.aptCall.rawTransaction)
          }
        }
        break
      case HandlerType.APT_RESOURCE:
        if (dataBinding.data?.aptResource?.resources) {
          if (dataBinding.data.aptResource.rawResources && dataBinding.data.aptResource.rawResources.length > 0) {
            dataBinding.data.aptResource.resources = dataBinding.data.aptResource.rawResources.map((e) => JSON.parse(e))
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

// TODO push the logic into sdk
function dataCompare(a: DataBinding, b: DataBinding): number {
  const timeA = getTimestamp(a) || new Date(0)
  const timeB = getTimestamp(b) || new Date(0)
  const timeCmp = timeA.getTime() - timeB.getTime()
  if (timeCmp !== 0) {
    return timeCmp
  }
  return getSecondary(a) - getSecondary(b)
}

function getTimestamp(d: DataBinding): Date | undefined {
  return (
    d.data?.ethLog?.timestamp ||
    d.data?.ethTransaction?.timestamp ||
    (d.data?.ethBlock?.block?.timestamp ? new Date(Number(d.data.ethBlock.block.timestamp) * 1000) : undefined) ||
    d.data?.ethTrace?.timestamp ||
    (d.data?.aptCall?.transaction ? new Date(Number(d.data.aptCall.transaction.timestamp) / 1000) : undefined) ||
    (d.data?.aptEvent?.transaction ? new Date(Number(d.data.aptEvent.transaction.timestamp) / 1000) : undefined) ||
    (d.data?.aptResource?.timestampMicros ? new Date(Number(d.data.aptResource.timestampMicros) / 1000) : undefined) ||
    d.data?.fuelCall?.timestamp
  )
}

function getSecondary(d: DataBinding) {
  return (
    d.data?.ethLog?.log?.logIndex ||
    d.data?.ethTransaction?.transaction?.transactionIndex ||
    d.data?.ethBlock?.block?.number ||
    d.data?.ethTrace?.trace?.transactionPosition
  )
}
