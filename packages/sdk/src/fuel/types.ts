import { ListStateStorage } from '@sentio/runtime'
import { Data_FuelCall, FuelAssetHandlerConfig, FuelCallHandlerConfig, ProcessResult } from '@sentio/protos'

export interface FuelBaseProcessor<T> {
  configure(): Promise<void>
  config: T
  callHandlers: CallHandler<Data_FuelCall>[]
}

export class FuelProcessorState extends ListStateStorage<FuelBaseProcessor<any>> {
  static INSTANCE = new FuelProcessorState()
}

export type CallHandler<T> = {
  handler: (call: T) => Promise<ProcessResult>
  fetchConfig?: Partial<FuelCallHandlerConfig>
  assetConfig?: Partial<FuelAssetHandlerConfig>
}

export interface FuelLog {
  logId: number
  decodedLog: any
}
