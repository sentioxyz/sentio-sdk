import { ListStateStorage } from '@sentio/runtime'
import {
  Data_FuelBlock,
  Data_FuelCall,
  FuelAssetHandlerConfig,
  FuelCallHandlerConfig,
  HandleInterval,
  OnIntervalConfig,
  ProcessResult
} from '@sentio/protos'

export interface FuelBaseProcessor<T> {
  configure(): Promise<void>
  config: T
  callHandlers: CallHandler<Data_FuelCall>[]
  blockHandlers: BlockHandler[]
}

export class FuelProcessorState extends ListStateStorage<FuelBaseProcessor<any>> {
  static INSTANCE = new FuelProcessorState()
}

export type CallHandler<T> = {
  handler: (call: T) => Promise<ProcessResult>
  fetchConfig?: Partial<FuelCallHandlerConfig>
  assetConfig?: Partial<FuelAssetHandlerConfig>
  logConfig?: {
    logIds: string[]
  }
}

export type BlockHandler = {
  blockInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handler: (block: Data_FuelBlock) => Promise<ProcessResult>
  fetchConfig?: Partial<OnIntervalConfig>
}

export interface FuelLog<T> {
  logId: string
  data: T
  receiptIndex: number
}
