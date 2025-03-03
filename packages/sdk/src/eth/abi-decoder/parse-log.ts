import Piscina from 'piscina'
import { LogDescription, LogParams, Result } from 'ethers'
import { GLOBAL_CONFIG } from '@sentio/runtime'
import { parseLog } from './parse-log-worker.js'

export default async (processor: any, log: LogParams) => {
  const workers = GLOBAL_CONFIG.execution.ethAbiDecoderWorker
  if (workers != null) {
    let workerPool = processor._logWorkerPool
    const contractView = processor.CreateBoundContractView()
    const contractViewInterface = contractView.rawContract.interface
    if (!workerPool) {
      const fragments = contractViewInterface.fragments
      const options: any = {
        // hack fix for node:test with tsx
        filename: new URL('./parse-log-worker.js', import.meta.url).href.replaceAll('/src/eth', '/lib/eth'),
        workerData: fragments
      }
      if (workers > 0) {
        // 0 for the Piscina default auto value
        options.maxThreads = workers
        options.minThreads = workers
      }
      // @ts-ignore typescript def for piscina is wrong?
      workerPool = new Piscina(options)
      processor._logWorkerPool = workerPool
    }
    const result = (await workerPool.run({ log })) as any
    if (result) {
      const fragment = contractViewInterface.getEvent(result.topic)

      if (!fragment || fragment.anonymous) {
        return null
      }

      return new LogDescription(fragment, result.topic, Result.fromItems(result.args?.array ?? [], result.args?.keys))
    }
    return null
  } else {
    const contractView = processor.CreateBoundContractView()
    const contractViewInterface = contractView.rawContract.interface
    return parseLog(contractViewInterface, log)
  }
}
