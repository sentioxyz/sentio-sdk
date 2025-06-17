import { MapStateStorage } from '@sentio/runtime'
import {
  Data_FuelBlock,
  Data_FuelReceipt,
  Data_FuelTransaction,
  FuelAssetHandlerConfig,
  FuelCallHandlerConfig,
  FuelReceiptHandlerConfig,
  HandleInterval,
  OnIntervalConfig,
  ProcessResult
} from '@sentio/protos'
import { Block, TransactionSummary } from 'fuels'

export interface FuelBaseProcessor<T> {
  configure(): Promise<void>
  config: T
  txHandlers: CallHandler<Data_FuelTransaction>[]
  blockHandlers: BlockHandler[]
  receiptHandlers?: ReceiptHandler[]
}

export class FuelProcessorState extends MapStateStorage<FuelBaseProcessor<any>> {
  static INSTANCE = new FuelProcessorState()
}

export type CallHandler<T> = {
  handlerName: string
  handler: (call: T) => Promise<ProcessResult>
  fetchConfig?: Partial<FuelCallHandlerConfig>
  assetConfig?: Partial<FuelAssetHandlerConfig>
  partitionHandler?: (call: T) => Promise<string | undefined>
}

export type ReceiptHandler = {
  handlerName: string
  handler: (receipt: Data_FuelReceipt) => Promise<ProcessResult>
  receiptConfig?: Partial<FuelReceiptHandlerConfig>
  partitionHandler?: (receipt: Data_FuelReceipt) => Promise<string | undefined>
}

export type BlockHandler = {
  blockInterval?: HandleInterval
  timeIntervalInMinutes?: HandleInterval
  handler: (block: Data_FuelBlock) => Promise<ProcessResult>
  handlerName: string
  fetchConfig?: Partial<OnIntervalConfig>
  partitionHandler?: (block: Data_FuelBlock) => Promise<string | undefined>
}

export interface FuelLog<T> {
  logId: string
  data: T
  receiptIndex: number
}

export type FuelTransaction = TransactionSummary & {
  blockNumber?: string
  logs?: FuelLog<any>[]
  sender?: string
}

export type FuelBlock = Omit<Block, 'transactionIds'>

export type ContractTransferFilter = {
  assetId?: string
  from?: string
  to?: string
}
