import { MapStateStorage } from '@sentio/runtime'
import {
  Data_FuelBlock,
  Data_FuelReceipt,
  Data_FuelTransaction,
  FuelAssetHandlerConfig,
  FuelReceiptHandlerConfig,
  HandleInterval,
  OnIntervalConfig,
  ProcessResult
} from '@sentio/protos'
import { Block, TransactionSummary } from 'fuels'

// Client-side only filter for `onCall`. Fuel calls are delivered as FUEL_TRANSACTION
// data and filtered in-handler, so this never reaches the backend.
export interface FuelCallFilter {
  function: string
  includeFailed: boolean
}

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
  fetchConfig?: { filters: FuelCallFilter[] }
  assetConfig?: Omit<Partial<FuelAssetHandlerConfig>, '$typeName' | '$unknown'>
  partitionHandler?: (call: T) => Promise<string | undefined>
}

export type ReceiptHandler = {
  handlerName: string
  handler: (receipt: Data_FuelReceipt) => Promise<ProcessResult>
  receiptConfig?: Omit<Partial<FuelReceiptHandlerConfig>, '$typeName' | '$unknown'>
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
