import { ListStateStorage } from '@sentio/runtime'
import { CosmosProcessor } from './cosmos-processor.js'
import { ProcessResult } from '@sentio/protos'
import { CosmosNetwork } from './network.js'

export class CosmosProcessorState extends ListStateStorage<CosmosProcessor> {
  static INSTANCE = new CosmosProcessorState()
}

export type CallHandler<T> = {
  handlerName: string
  handler: (call: T) => Promise<ProcessResult>
  logConfig?: {
    logFilters: string[]
  }
  partitionHandler?: (call: T) => Promise<string | undefined>
}

export type CosmosProcessorConfig = {
  address: string
  name?: string
  chainId: CosmosNetwork
  startBlock?: bigint
  endBlock?: bigint
}
