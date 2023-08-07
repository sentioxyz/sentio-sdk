import { BaseContext } from '../core/index.js'
import { AbstractMoveCoder } from '@typemove/move'

export abstract class MoveContext<Network, ModuleType, StructType> extends BaseContext {
  address: string
  coder: AbstractMoveCoder<ModuleType, StructType>
  network: Network

  abstract getTimestamp(): number
}

export abstract class MoveAccountContext<Network, ModuleType, StructType> extends BaseContext {
  address: string
  coder: AbstractMoveCoder<ModuleType, StructType>
  network: Network

  abstract getTimestamp(): number
}
