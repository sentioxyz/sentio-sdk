import { LogDescription, LogParams, Result, ParamType } from 'ethers'
import { GLOBAL_CONFIG, processMetrics } from '@sentio/runtime'
import { Piscina } from 'piscina'

import { decodeTraceInline, parseLogInline, IResult } from './decode-worker.js'

function createOptions() {
  const options: any = {
    filename: findWorkFile(),
    recordTiming: true
  }
  if (GLOBAL_CONFIG.execution.ethAbiDecoderConfig?.workerCount) {
    try {
      const workerNum = GLOBAL_CONFIG.execution.ethAbiDecoderConfig?.workerCount
      options.maxThreads = workerNum
      options.minThreads = workerNum
    } catch (e) {}
  }
  return options
}

function findWorkFile() {
  let baseUrl = import.meta.url
  // find the base from @sentio/sdk
  const index = baseUrl.indexOf('/@sentio/sdk/')
  if (index > 0) {
    baseUrl = baseUrl.substring(0, index + 13)
  } else {
    // dev environment, path is .../packages/sdk/src/eth/abi-decoder/parse-log-worker.ts
    const index = baseUrl.indexOf('packages/sdk/')
    if (index > 0) {
      baseUrl = baseUrl.substring(0, index + 13)
    }
  }
  return new URL('./lib/eth/abi-decoder/decode-worker.js', baseUrl).href
}

export async function parseLog(processor: any, log: LogParams) {
  if (GLOBAL_CONFIG.execution.ethAbiDecoderConfig?.enabled) {
    let workerPool = processor._logWorkerPool as Piscina
    const contractView = processor.CreateBoundContractView()
    const contractViewInterface = contractView.rawContract.interface
    if (!workerPool) {
      const fragments = contractViewInterface.fragments
      const options = createOptions()
      options.workerData = fragments

      workerPool = new Piscina(options)
      processor._logWorkerPool = workerPool
    }
    try {
      const result = (await workerPool.run({ log }, { name: 'parseLog' })) as any
      if (result) {
        const fragment = contractViewInterface.getEvent(result.topic)

        if (!fragment || fragment.anonymous) {
          return null
        }
        return new LogDescription(fragment, result.topic, Result.fromItems(result.args?.array ?? [], result.args?.keys))
      }
    } catch (e) {
      const skipWhenDecodeFailed = GLOBAL_CONFIG.execution.ethAbiDecoderConfig?.skipWhenDecodeFailed
      console.error(`parseLog worker failed, skip: ${!!skipWhenDecodeFailed}, the error is:`, e)
      if (!skipWhenDecodeFailed) {
        throw e
      }
    } finally {
      if (workerPool.waitTime && workerPool.runTime) {
        const labels = {
          chain_id: processor.config?.network,
          processor: processor.config?.name,
          workerPool: 'parseLog'
        }
        processMetrics.processor_worker_wait_time.record(workerPool.waitTime.average, labels)
        processMetrics.processor_worker_run_time.record(workerPool.runTime?.average, labels)
        processMetrics.processor_worker_utilization.record(workerPool.utilization, labels)
        processMetrics.processor_worker_queue_size.record(workerPool.queueSize, labels)
        processMetrics.processor_worker_completed.record(workerPool.completed, labels)
      }
    }
    return null
  } else {
    const contractView = processor.CreateBoundContractView()
    const contractViewInterface = contractView.rawContract.interface
    return parseLogInline(contractViewInterface, log)
  }
}

export async function decodeTrace(processor: any, inputs: readonly ParamType[], traceData: string) {
  if (GLOBAL_CONFIG.execution.ethAbiDecoderConfig?.enabled) {
    let workerPool = processor._traceWorkerPool
    if (!workerPool) {
      const contractView = processor.CreateBoundContractView()
      const contractViewInterface = contractView.rawContract.interface
      const fragments = contractViewInterface.fragments
      const options = createOptions()
      options.workerData = fragments

      workerPool = new Piscina(options)
      processor._traceWorkerPool = workerPool
    }
    try {
      const result = (await workerPool.run({ inputs, traceData }, { name: 'decodeTrace' })) as IResult
      if (result) {
        return Result.fromItems(result.array ?? [], result.keys)
      }
    } catch (e) {
      const skipWhenDecodeFailed = GLOBAL_CONFIG.execution.ethAbiDecoderConfig?.skipWhenDecodeFailed
      console.error(`decode trace worker failed, skip: ${!!skipWhenDecodeFailed}, the error is:`, e)
      if (!skipWhenDecodeFailed) {
        throw e
      }
    } finally {
      if (workerPool.waitTime && workerPool.runTime) {
        const labels = {
          chain_id: processor.config?.network,
          processor: processor.config?.name,
          workerPool: 'parseLog'
        }
        processMetrics.processor_worker_wait_time.record(workerPool.waitTime.average, labels)
        processMetrics.processor_worker_run_time.record(workerPool.runTime?.average, labels)
        processMetrics.processor_worker_utilization.record(workerPool.utilization, labels)
        processMetrics.processor_worker_queue_size.record(workerPool.queueSize, labels)
        processMetrics.processor_worker_completed.record(workerPool.completed, labels)
      }
    }
    return null
  } else {
    const contractView = processor.CreateBoundContractView()
    const contractViewInterface = contractView.rawContract.interface
    return decodeTraceInline(contractViewInterface, inputs, traceData)
  }
}
