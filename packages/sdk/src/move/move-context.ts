import { BaseContext } from '../core/index.js'
import { AbstractMoveCoder } from './abstract-move-coder.js'

export abstract class MoveContext<Network, ModuleType, StructType> extends BaseContext {
  address: string
  coder: AbstractMoveCoder<Network, ModuleType, StructType>
  network: Network

  abstract getTimestamp(): number
}

export abstract class MoveAccountContext<Network, ModuleType, StructType> extends BaseContext {
  address: string
  coder: AbstractMoveCoder<Network, ModuleType, StructType>
  network: Network

  abstract getTimestamp(): number
}
