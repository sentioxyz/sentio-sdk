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
  ProcessConfigResponse,
  ProcessorServiceImplementation,
  ProcessResult,
  ProcessStreamRequest,
  StartRequest
} from './gen/processor/protos/processor.js'

import { DeepPartial, Empty, ProcessorV3ServiceImplementation, UpdateTemplatesRequest } from '@sentio/protos'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { GLOBAL_CONFIG } from './global-config.js'
import { compareSemver, parseSemver, Semver } from './utils.js'
import { LRUCache } from 'lru-cache'
import { createHash } from 'crypto'

const require = createRequire(import.meta.url)

const FUEL_PROTO_UPDATE_VERSION = parseSemver('2.54.0-rc.7')
const FUEL_PROTO_NO_FUEL_TRANSACTION_AS_CALL_VERSION = parseSemver('2.55.0-rc.1')

const MOVE_USE_RAW_VERSION = parseSemver('2.55.0-rc.1')
const ETH_USE_RAW_VERSION = parseSemver('2.57.9-rc.12')
// new driver (after MOVE_USE_RAW_VERSION) will sent the same event multiple times when fetch all true
// so we need to cache it, key will be tx-handler_id
const PROCESSED_MOVE_EVENT_TX_HANDLER = new LRUCache<string, boolean>({
  max: 10000
})

const enableTxCache = process.env.ENABLE_PARSE_CACHE === 'true'

// Cache for parsed JSON data
const PARSED_DATA_CACHE = new LRUCache<string, any>({
  max: enableTxCache ? 5000 : 1
})

/**
 * Gets parsed JSON data from a string, using a cache to avoid repeated parsing
 * @param rawData The raw string data to parse
 * @returns The parsed JSON object
 */
function getParsedData(rawData: string): any {
  if (!enableTxCache) {
    return JSON.parse(rawData)
  }

  // Create a digest of the raw data for cache key
  const digest = createHash('md5').update(rawData).digest('hex')

  // Check if we already have this data parsed
  let parsedData = PARSED_DATA_CACHE.get(digest)
  if (!parsedData) {
    // Parse and cache the data
    parsedData = JSON.parse(rawData)
    PARSED_DATA_CACHE.set(digest, parsedData)
  }

  return parsedData
}

function locatePackageJson(pkgId: string) {
  const m = require.resolve(pkgId)

  let dir = path.dirname(m)
  while (!fs.existsSync(path.join(dir, 'package.json'))) {
    dir = path.dirname(dir)
  }
  const content = fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')
  return JSON.parse(content)
}

/**
 * The RuntimeServicePatcher class is responsible for providing backward compatibility
 * patches for different SDK versions. It ensures that the runtime can adapt to changes
 * in the SDK by applying necessary adjustments to data bindings and other configurations.
 */
export class RuntimeServicePatcher {
  sdkVersion: Semver

  constructor() {
    const sdkPackageJson = locatePackageJson('@sentio/sdk')
    const runtimePackageJson = locatePackageJson('@sentio/runtime')

    console.log('Runtime version:', runtimePackageJson.version, 'SDK version:', sdkPackageJson.version)

    this.sdkVersion = parseSemver(sdkPackageJson.version)
  }

  adjustDataBinding(dataBinding?: DataBinding): void {
    const isBeforeMoveUseRawVersion = compareSemver(this.sdkVersion, MOVE_USE_RAW_VERSION) < 0
    // const isBeforeEthUseRawVersion = compareSemver(this.sdkVersion,ETH_USE_RAW_VERSION) < 0

    if (!dataBinding) {
      return
    }
    switch (dataBinding.handlerType) {
      case HandlerType.ETH_LOG:
        const ethLog = dataBinding.data?.ethLog
        if (ethLog?.log == null && ethLog?.rawLog) {
          ethLog.log = JSON.parse(ethLog.rawLog)

          if (ethLog.rawTransaction) {
            ethLog.transaction = getParsedData(ethLog.rawTransaction)
          }
          if (ethLog.rawBlock) {
            ethLog.block = getParsedData(ethLog.rawBlock)
          }
          if (ethLog.rawTransactionReceipt) {
            ethLog.transactionReceipt = getParsedData(ethLog.rawTransactionReceipt)
          }
        }
        break
      case HandlerType.ETH_TRANSACTION:
        const ethTx = dataBinding.data?.ethTransaction
        if (ethTx?.transaction == null && ethTx?.rawTransaction) {
          ethTx.transaction = getParsedData(ethTx.rawTransaction)
          if (ethTx.rawBlock) {
            ethTx.block = getParsedData(ethTx.rawBlock)
          } else {
            ethTx.block = undefined
          }
          if (ethTx.rawTransactionReceipt) {
            ethTx.transactionReceipt = getParsedData(ethTx.rawTransactionReceipt)
          } else {
            ethTx.transactionReceipt = undefined
          }
        }
        break
      case HandlerType.FUEL_TRANSACTION:
        if (compareSemver(this.sdkVersion, FUEL_PROTO_UPDATE_VERSION) < 0) {
          dataBinding.handlerType = HandlerType.FUEL_CALL
          if (dataBinding.data) {
            dataBinding.data.fuelCall = dataBinding.data?.fuelTransaction
          }
        }
        break
      case HandlerType.FUEL_RECEIPT:
        if (compareSemver(this.sdkVersion, FUEL_PROTO_UPDATE_VERSION) < 0) {
          dataBinding.handlerType = HandlerType.FUEL_CALL
          if (dataBinding.data) {
            dataBinding.data.fuelCall = dataBinding.data?.fuelLog
          }
        }

        break
      case HandlerType.APT_EVENT:
        const aptEvent = dataBinding.data?.aptEvent
        if (aptEvent) {
          if (isBeforeMoveUseRawVersion && aptEvent.rawTransaction) {
            const transaction = getParsedData(aptEvent.rawTransaction)

            const key = `${transaction.hash}-${dataBinding.handlerIds[0]}`
            if (PROCESSED_MOVE_EVENT_TX_HANDLER.has(key)) {
              console.debug('skip binding', key)
              dataBinding.handlerType = HandlerType.UNKNOWN
              return
            }
            PROCESSED_MOVE_EVENT_TX_HANDLER.set(key, true)

            aptEvent.transaction = transaction
            if (!transaction.events?.length) {
              // when fetch all is not true, then events is empty, we need to fill it to old format
              transaction.events = [JSON.parse(aptEvent.rawEvent)]
            }
          }
        }
        break
      case HandlerType.APT_CALL:
        const aptCall = dataBinding.data?.aptCall
        if (aptCall) {
          if (isBeforeMoveUseRawVersion && aptCall.rawTransaction) {
            aptCall.transaction = getParsedData(aptCall.rawTransaction)
          }
        }
        break
      case HandlerType.APT_RESOURCE:
        const aptResource = dataBinding.data?.aptResource
        if (aptResource) {
          if (isBeforeMoveUseRawVersion && aptResource.rawResources) {
            aptResource.resources = aptResource.rawResources.map((e) => JSON.parse(e))
          }
        }
        break
      case HandlerType.SUI_EVENT:
        const suiEvent = dataBinding.data?.suiEvent
        if (suiEvent) {
          if (isBeforeMoveUseRawVersion && suiEvent.rawTransaction) {
            const transaction = getParsedData(suiEvent.rawTransaction)

            const key = `${transaction.digest}-${dataBinding.handlerIds[0]}`
            if (PROCESSED_MOVE_EVENT_TX_HANDLER.has(key)) {
              console.debug('skip binding', key)
              dataBinding.handlerType = HandlerType.UNKNOWN
              return
            }
            PROCESSED_MOVE_EVENT_TX_HANDLER.set(key, true)

            suiEvent.transaction = transaction
            if (!transaction.events?.length) {
              // when fetch all is not true, then events is empty, we need to fill it to old format
              transaction.events = [JSON.parse(suiEvent.rawEvent)]
            }
          }
        }
        break
      case HandlerType.SUI_CALL:
        const suiCall = dataBinding.data?.suiCall
        if (suiCall) {
          if (isBeforeMoveUseRawVersion && suiCall.rawTransaction) {
            suiCall.transaction = getParsedData(suiCall.rawTransaction)
          }
        }
        break
      case HandlerType.SUI_OBJECT:
        const suiObject = dataBinding.data?.suiObject
        if (suiObject) {
          if (isBeforeMoveUseRawVersion && (suiObject.rawSelf || suiObject.rawObjects)) {
            if (suiObject.rawSelf) {
              suiObject.self = JSON.parse(suiObject.rawSelf)
            }
            suiObject.objects = suiObject.rawObjects.map((e) => JSON.parse(e))
          }
        }
        break
      case HandlerType.SUI_OBJECT_CHANGE:
        const suiObjectChange = dataBinding.data?.suiObjectChange
        if (suiObjectChange) {
          if (isBeforeMoveUseRawVersion && suiObjectChange.rawChanges) {
            suiObjectChange.changes = suiObjectChange.rawChanges.map((e) => JSON.parse(e))
          }
        }
        break
      case HandlerType.UNKNOWN:
        // if (dataBinding.data?.ethBlock) {
        //   if (dataBinding.data.raw.length === 0) {
        //     // This is actually not needed in current system, just as initla test propose, move to test only
        //     // when this is stable
        //     dataBinding.data.raw = new TextEncoder().encode(JSON.stringify(dataBinding.data.ethBlock.block))
        //   }
        // }
        break
      default:
        break
    }
  }

  patchConfig(config: DeepPartial<ProcessConfigResponse>): void {
    config.executionConfig = ExecutionConfig.fromPartial(GLOBAL_CONFIG.execution)

    if (config.contractConfigs) {
      for (const contract of config.contractConfigs) {
        // for old fuel processor
        if (
          compareSemver(this.sdkVersion, FUEL_PROTO_NO_FUEL_TRANSACTION_AS_CALL_VERSION) < 0 &&
          contract.fuelCallConfigs
        ) {
          contract.fuelTransactionConfigs = contract.fuelCallConfigs
          contract.fuelCallConfigs = undefined
        }

        // @ts-ignore convert old fuelLogConfigs to fuelReceiptConfigs
        if (contract.fuelLogConfigs) {
          contract.fuelReceiptConfigs = contract.fuelLogConfigs.map((e) => ({
            handlerId: e.handlerId,
            handlerName: e.handlerName,
            log: {
              logIds: e.logIds
            }
          }))
        }

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
  }
}

export class FullProcessorServiceImpl implements ProcessorServiceImplementation {
  constructor(instance: ProcessorServiceImplementation) {
    this.instance = instance
    const sdkPackageJson = locatePackageJson('@sentio/sdk')
    const runtimePackageJson = locatePackageJson('@sentio/runtime')

    console.log('Runtime version:', runtimePackageJson.version, 'SDK version:', sdkPackageJson.version)

    this.sdkVersion = parseSemver(sdkPackageJson.version)
  }

  instance: ProcessorServiceImplementation
  sdkVersion: Semver
  patcher: RuntimeServicePatcher = new RuntimeServicePatcher()

  async getConfig(request: ProcessConfigRequest, context: CallContext) {
    const config = await this.instance.getConfig(request, context)
    this.patcher.patchConfig(config)

    if (compareSemver(this.sdkVersion, MOVE_USE_RAW_VERSION) < 0) {
      PROCESSED_MOVE_EVENT_TX_HANDLER.clear()
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
    // if (GLOBAL_CONFIG.execution.sequential) {
    //   request.bindings = request.bindings.sort(dataCompare)
    // }

    for (const binding of request.bindings) {
      this.patcher.adjustDataBinding(binding)
    }
    try {
      const result = await this.instance.processBindings(request, options)
      this.adjustResult(result.result as ProcessResult)
      if (!result.configUpdated && result.result?.states?.configUpdated) {
        result.configUpdated = result.result?.states?.configUpdated
      }
      return result
    } catch (e) {
      if (this.sdkVersion.minor <= 16) {
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
      this.patcher.adjustDataBinding(request.binding)
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
}

// function dataCompare(a: DataBinding, b: DataBinding): number {
//   const timeA = getTimestamp(a) || new Date(0)
//   const timeB = getTimestamp(b) || new Date(0)
//   const timeCmp = timeA.getTime() - timeB.getTime()
//   if (timeCmp !== 0) {
//     return timeCmp
//   }
//   return getSecondary(a) - getSecondary(b)
// }
//
// function getTimestamp(d: DataBinding): Date | undefined {
//   return (
//     d.data?.ethLog?.timestamp ||
//     d.data?.ethTransaction?.timestamp ||
//     (d.data?.ethBlock?.block?.timestamp ? new Date(Number(d.data.ethBlock.block.timestamp) * 1000) : undefined) ||
//     d.data?.ethTrace?.timestamp ||
//     (d.data?.aptCall?.transaction ? new Date(Number(d.data.aptCall.transaction.timestamp) / 1000) : undefined) ||
//     (d.data?.aptEvent?.transaction ? new Date(Number(d.data.aptEvent.transaction.timestamp) / 1000) : undefined) ||
//     (d.data?.aptResource?.timestampMicros ? new Date(Number(d.data.aptResource.timestampMicros) / 1000) : undefined) ||
//     d.data?.fuelCall?.timestamp
//   )
// }
//
// function getSecondary(d: DataBinding) {
//   return (
//     d.data?.ethLog?.log?.logIndex ||
//     d.data?.ethTransaction?.transaction?.transactionIndex ||
//     d.data?.ethBlock?.block?.number ||
//     d.data?.ethTrace?.trace?.transactionPosition
//   )
// }

export class FullProcessorServiceV3Impl implements ProcessorV3ServiceImplementation {
  patcher: RuntimeServicePatcher = new RuntimeServicePatcher()

  constructor(readonly instance: ProcessorV3ServiceImplementation) {}

  async start(request: StartRequest, context: CallContext): Promise<DeepPartial<Empty>> {
    return this.instance.start(request, context)
  }

  async getConfig(request: ProcessConfigRequest, context: CallContext): Promise<DeepPartial<ProcessConfigResponse>> {
    const config = await this.instance.getConfig(request, context)
    this.patcher.patchConfig(config)
    return config
  }

  async *processBindingsStream(requests: AsyncIterable<ProcessStreamRequest>, context: CallContext) {
    yield* this.instance.processBindingsStream(this.adjustBindingsStream(requests), context)
  }

  async *adjustBindingsStream(requests: AsyncIterable<ProcessStreamRequest>): AsyncIterable<ProcessStreamRequest> {
    for await (const request of requests) {
      this.patcher.adjustDataBinding(request.binding)
      yield request
    }
  }

  async updateTemplates(request: UpdateTemplatesRequest, context: CallContext): Promise<DeepPartial<Empty>> {
    return this.instance.updateTemplates(request, context)
  }
}
